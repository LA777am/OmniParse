from google import genai
from google.genai import types
from app.config import settings

async def generate_answer(query: str, context_chunks: list[dict]) -> str:
    """
    Prompts Gemini to answer the query using ONLY the provided document chunks.
    Injects spatial bounding box data to allow the LLM to understand document layout.
    """
    if not settings.gemini_api_key:
        return "Error: Gemini API key is not configured."
        
    client = genai.Client(api_key=settings.gemini_api_key)
    
    # Format the context with spatial metadata
    context_blocks = []
    for c in context_chunks:
        page = c.get('page_number', '?')
        coords = c.get('spatial_coordinates', {})
        dims = c.get('page_dimensions', {})
        
        # Build a rich header for each chunk
        coord_str = f"[x0: {coords.get('x0', 0)}, y0: {coords.get('y0', 0)}, x1: {coords.get('x1', 0)}, y1: {coords.get('y1', 0)}]" if coords else "[No coordinates]"
        
        block = f"--- Page {page} | Coordinates: {coord_str} ---\n{c.get('text', '')}"
        context_blocks.append(block)
        
    context_text = "\n\n".join(context_blocks)
    
    prompt = f"""You are OmniParse, an advanced Spatial Document Intelligence AI.
Your job is to analyze the provided document excerpts and provide highly accurate, beautifully formatted answers to the user's queries.

CRITICAL INSTRUCTIONS:
1. USE MARKDOWN: Format your responses beautifully using Markdown. Use **bolding** for emphasis, bullet points for lists, and Markdown tables (`| Col | Col |`) when presenting tabular data. Do NOT output a giant wall of plain text.
2. SPATIAL AWARENESS: You are provided with the physical bounding box coordinates [x0, y0, x1, y1] for the data chunks. When relevant, tell the user *where* the information is located (e.g., "On the top-right of page 4...").
3. SYNTHESIS, NOT JUST PARROTING: Connect ideas across the chunks logically. If asked for a summary, provide a structured executive summary. 
4. GRACEFUL DEGRADATION: If the exact answer is not in the context, DO NOT just say "I cannot answer this." Instead, politely explain what information *is* available in the current context that might be related, or explain why the specific extraction might have failed (e.g., "The provided excerpts do not contain the specific Q3 revenue figures, but I did find the overall annual projections...").
5. STAY GROUNDED: Do not invent facts outside of the provided context.

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
