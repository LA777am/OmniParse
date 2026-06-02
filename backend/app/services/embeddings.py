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
