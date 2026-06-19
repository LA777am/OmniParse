from sentence_transformers import SentenceTransformer
from app.config import settings

# Load model once globally per worker/server
model = SentenceTransformer(settings.embedding_model)

def generate_embeddings_batch(chunks: list[dict]) -> list[dict]:
    """
    Enriches each chunk dict with an 'embedding_vector' field.
    Uses local sentence-transformers for zero-cost embeddings.
    """
    if not chunks:
        return []
        
    texts = [c["chunk_text"] for c in chunks]
    
    # encode() automatically batches and handles CPU/GPU execution
    all_embeddings = model.encode(texts, show_progress_bar=False)
    
    for chunk, embedding in zip(chunks, all_embeddings.tolist()):
        chunk["embedding_vector"] = embedding
    
    return chunks

async def find_similar_chunks(db, document_id: str, query: str, top_k: int = 5) -> list[dict]:
    """
    Since we are using local MongoDB Community Edition (which lacks Atlas Vector Search),
    we perform exact K-Nearest Neighbors locally in-memory using cos_sim.
    """
    from sentence_transformers import util
    import torch

    # 1. Generate embedding for the query
    query_embedding = model.encode(query, convert_to_tensor=True)
    
    # 2. Fetch all chunks for the document from MongoDB
    cursor = db.document_chunks.find(
        {"document_id": document_id},
        {"_id": 0, "chunk_text": 1, "page_number": 1, "embedding_vector": 1}
    )
    chunks = await cursor.to_list(length=None)
    
    if not chunks:
        return []

    # 3. Compute cosine similarity for all chunks
    chunk_embeddings = [c["embedding_vector"] for c in chunks]
    chunk_tensors = torch.tensor(chunk_embeddings)
    
    # cos_sim returns a matrix of similarities [1, num_chunks]
    cosine_scores = util.cos_sim(query_embedding, chunk_tensors)[0]
    
    # 4. Sort and get top_k
    top_results = torch.topk(cosine_scores, k=min(top_k, len(chunks)))
    
    best_chunks = []
    for score, idx in zip(top_results[0], top_results[1]):
        chunk_data = chunks[idx]
        best_chunks.append({
            "text": chunk_data["chunk_text"],
            "page": chunk_data.get("page_number", 0),
            "score": float(score)
        })
        
    return best_chunks
