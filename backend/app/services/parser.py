import pdfplumber
from datetime import datetime

def _compute_table_bbox(table_bbox):
    return table_bbox

def _word_in_any_table(word, table_bboxes):
    """Checks if a word's bounding box falls inside any table bounding box."""
    wx0, wy0, wx1, wy1 = word["x0"], word["top"], word["x1"], word["bottom"]
    for (tx0, ty0, tx1, ty1) in table_bboxes:
        if wx0 >= tx0 and wx1 <= tx1 and wy0 >= ty0 and wy1 <= ty1:
            return True
    return False

def _group_words_into_paragraphs(words, y_gap_threshold=5.0):
    """
    Groups words into paragraphs based on vertical proximity.
    Assumes words are sorted by top-to-bottom, left-to-right.
    """
    if not words:
        return []
    
    # Sort words top-to-bottom, then left-to-right
    sorted_words = sorted(words, key=lambda w: (w["top"], w["x0"]))
    
    paragraphs = []
    current_para = {
        "text": sorted_words[0]["text"],
        "x0": sorted_words[0]["x0"],
        "y0": sorted_words[0]["top"],
        "x1": sorted_words[0]["x1"],
        "y1": sorted_words[0]["bottom"],
    }
    
    for word in sorted_words[1:]:
        # If the vertical gap between current word and bottom of current paragraph is large, start a new paragraph
        if word["top"] - current_para["y1"] > y_gap_threshold:
            paragraphs.append(current_para)
            current_para = {
                "text": word["text"],
                "x0": word["x0"],
                "y0": word["top"],
                "x1": word["x1"],
                "y1": word["bottom"],
            }
        else:
            # Append to current paragraph
            current_para["text"] += " " + word["text"]
            current_para["x0"] = min(current_para["x0"], word["x0"])
            current_para["y0"] = min(current_para["y0"], word["top"])
            current_para["x1"] = max(current_para["x1"], word["x1"])
            current_para["y1"] = max(current_para["y1"], word["bottom"])
            
    paragraphs.append(current_para)
    return paragraphs

def extract_chunks_with_coordinates(file_path: str, document_id: str) -> list[dict]:
    chunks = []
    
    with pdfplumber.open(file_path) as pdf:
        for page_num, page in enumerate(pdf.pages, start=1):
            page_width = page.width
            page_height = page.height
            
            # --- TABLE EXTRACTION ---
            tables = page.find_tables()
            table_bboxes = [table.bbox for table in tables]
            
            for table in tables:
                extracted = table.extract()
                if not extracted:
                    continue
                
                # Format the table as a Markdown string
                markdown_rows = []
                for row in extracted:
                    cleaned_row = [str(cell).replace('\n', ' ').strip() if cell else "" for cell in row]
                    markdown_rows.append("| " + " | ".join(cleaned_row) + " |")
                
                markdown_table = "[TABLE DATA]\n" + "\n".join(markdown_rows)
                
                chunks.append({
                    "document_id": document_id,
                    "page_number": page_num,
                    "page_dimensions": {
                        "width": float(page_width),
                        "height": float(page_height),
                    },
                    "chunk_text": markdown_table,
                    "chunk_type": "table",
                    "spatial_coordinates": {
                        "x0": round(table.bbox[0], 2),
                        "y0": round(table.bbox[1], 2),
                        "x1": round(table.bbox[2], 2),
                        "y1": round(table.bbox[3], 2),
                    },
                    "created_at": datetime.utcnow(),
                })
            
            # --- PARAGRAPH EXTRACTION ---
            # Extract words, excluding regions already captured as tables
            words = page.extract_words(
                keep_blank_chars=False,
                x_tolerance=3,
                y_tolerance=3,
            )
            
            # Filter out words that fall within table bounding boxes
            non_table_words = [
                w for w in words
                if not _word_in_any_table(w, table_bboxes)
            ]
            
            # Group words into paragraph-level chunks by vertical proximity
            paragraphs = _group_words_into_paragraphs(
                non_table_words, y_gap_threshold=5.0
            )
            
            for para in paragraphs:
                chunks.append({
                    "document_id": document_id,
                    "page_number": page_num,
                    "page_dimensions": {
                        "width": float(page_width),
                        "height": float(page_height),
                    },
                    "chunk_text": para["text"],
                    "chunk_type": "paragraph",
                    "spatial_coordinates": {
                        "x0": round(para["x0"], 2),
                        "y0": round(para["y0"], 2),
                        "x1": round(para["x1"], 2),
                        "y1": round(para["y1"], 2),
                    },
                    "created_at": datetime.utcnow(),
                })
    
    return chunks
