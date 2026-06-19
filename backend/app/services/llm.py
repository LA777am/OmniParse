from google import genai
from google.genai import types
from app.config import settings

async def generate_answer(query: str, context_chunks: list[dict]) -> str:
    """
    Prompts Gemini to answer the query using ONLY the provided document chunks.
    """
    if not settings.gemini_api_key:
        return "Error: Gemini API key is not configured."
        
    client = genai.Client(api_key=settings.gemini_api_key)
    
    # Format the context
    context_text = "\n\n".join(
        [f"--- Chunk from Page {c.get('page', '?')} ---\n{c.get('text', '')}" for c in context_chunks]
    )
    
    prompt = f"""You are a helpful document analysis assistant.
Answer the user's question using ONLY the provided document context below.
If the answer is not contained in the context, say "I cannot answer this based on the document."

DOCUMENT CONTEXT:
{context_text}

USER QUESTION:
{query}
"""

    try:
        response = await client.aio.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt,
        )
        return response.text
    except Exception as exc:
        return f"Error communicating with Gemini API: {str(exc)}"
