import pdfplumber
from datetime import datetime
import re
from typing import List, Dict, Any

def _word_in_any_table(word: Dict[str, Any], table_bboxes: List[tuple]) -> bool:
    """Checks if a word's bounding box falls inside any table bounding box."""
    wx0, wy0, wx1, wy1 = word["x0"], word["top"], word["x1"], word["bottom"]
    for (tx0, ty0, tx1, ty1) in table_bboxes:
        if wx0 >= (tx0 - 2) and wx1 <= (tx1 + 2) and wy0 >= (ty0 - 2) and wy1 <= (ty1 + 2):
            return True
    return False

def _compute_document_median_font_size(words: List[Dict]) -> float:
    """Calculates the median font size of the document to identify headers vs paragraphs."""
    sizes = [w.get("size", 12.0) for w in words if "size" in w]
    if not sizes:
        return 12.0
    sizes.sort()
    return sizes[len(sizes)//2]

def _group_words_into_lines(words: List[Dict]) -> List[List[Dict]]:
    """Groups words into horizontal lines based on overlapping vertical bounds."""
    if not words:
        return []
    
    # Sort primarily by vertical position (top) to iterate top-to-bottom
    sorted_words = sorted(words, key=lambda w: (w["top"], w["x0"]))
    
    lines = []
    current_line = []
    
    for word in sorted_words:
        if not current_line:
            current_line.append(word)
            continue
            
        line_top = min(w["top"] for w in current_line)
        line_bottom = max(w["bottom"] for w in current_line)
        word_vcenter = (word["top"] + word["bottom"]) / 2
        
        # Word belongs to line if its vertical center is within the line's vertical bounds
        if line_top - 2 <= word_vcenter <= line_bottom + 2:
            current_line.append(word)
        else:
            # Sort the completed line horizontally before saving
            current_line.sort(key=lambda w: w["x0"])
            lines.append(current_line)
            current_line = [word]
            
    if current_line:
        current_line.sort(key=lambda w: w["x0"])
        lines.append(current_line)
        
    return lines

def _is_bullet_point(text: str) -> bool:
    """Detects if a text string starts with a bullet point or numbering."""
    text = text.strip()
    return bool(re.match(r'^([•\-\*]|\d+\.)\s+', text))

def _group_lines_into_chunks(lines: List[List[Dict]], median_font_size: float) -> List[Dict]:
    """
    Groups lines into semantic chunks (Headers, Paragraphs, Lists).
    Splits when it detects large vertical gaps, bullet points, or font size changes.
    """
    chunks = []
    if not lines:
        return chunks
        
    def _create_chunk_from_lines(line_group: List[List[Dict]]) -> Dict:
        all_words = [w for line in line_group for w in line]
        text = "\n".join(" ".join(w["text"] for w in line) for line in line_group)
        
        # Determine chunk type based on the first line's font size
        first_line_words = line_group[0]
        max_font_size = max([w.get("size", 12.0) for w in first_line_words], default=12.0)
        
        c_type = "paragraph"
        
        # 15% larger than median font is considered a header
        if max_font_size >= median_font_size * 1.15:
            c_type = "header"
            if max_font_size >= median_font_size * 1.5:
                text = f"# {text}"
            elif max_font_size >= median_font_size * 1.3:
                text = f"## {text}"
            else:
                text = f"### {text}"
                
        # If it's a list item and not a header
        if _is_bullet_point(text) and c_type != "header":
            c_type = "list_item"
            
        return {
            "text": text.strip(),
            "type": c_type,
            "x0": min(w["x0"] for w in all_words),
            "top": min(w["top"] for w in all_words),
            "x1": max(w["x1"] for w in all_words),
            "bottom": max(w["bottom"] for w in all_words),
        }

    current_group = [lines[0]]
    
    for i in range(1, len(lines)):
        prev_line = lines[i-1]
        curr_line = lines[i]
        
        prev_bottom = max(w["bottom"] for w in prev_line)
        curr_top = min(w["top"] for w in curr_line)
        vertical_gap = curr_top - prev_bottom
        
        curr_text = " ".join(w["text"] for w in curr_line).strip()
        
        curr_max_font = max([w.get("size", 12.0) for w in curr_line], default=12.0)
        prev_max_font = max([w.get("size", 12.0) for w in prev_line], default=12.0)
        
        # Split criteria
        is_large_gap = vertical_gap > 4.0
        is_bullet = _is_bullet_point(curr_text)
        is_font_change = abs(curr_max_font - prev_max_font) > 1.0
        
        if is_large_gap or is_bullet or is_font_change:
            chunks.append(_create_chunk_from_lines(current_group))
            current_group = [curr_line]
        else:
            current_group.append(curr_line)
            
    if current_group:
        chunks.append(_create_chunk_from_lines(current_group))
        
    return chunks

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
                
                markdown_rows = []
                for row in extracted:
                    cleaned_row = [str(cell).replace('\n', ' ').strip() if cell else "" for cell in row]
                    markdown_rows.append("| " + " | ".join(cleaned_row) + " |")
                
                markdown_table = "[TABLE]\n" + "\n".join(markdown_rows)
                
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
            
            # --- TEXT EXTRACTION ---
            words = page.extract_words(
                keep_blank_chars=False,
                x_tolerance=3,
                y_tolerance=3,
                extra_attrs=["size", "fontname"]
            )
            
            non_table_words = [w for w in words if not _word_in_any_table(w, table_bboxes)]
            
            if not non_table_words:
                continue
                
            median_font_size = _compute_document_median_font_size(non_table_words)
            lines = _group_words_into_lines(non_table_words)
            semantic_chunks = _group_lines_into_chunks(lines, median_font_size)
            
            for ch in semantic_chunks:
                chunks.append({
                    "document_id": document_id,
                    "page_number": page_num,
                    "page_dimensions": {
                        "width": float(page_width),
                        "height": float(page_height),
                    },
                    "chunk_text": ch["text"],
                    "chunk_type": ch["type"],
                    "spatial_coordinates": {
                        "x0": round(ch["x0"], 2),
                        "y0": round(ch["top"], 2),
                        "x1": round(ch["x1"], 2),
                        "y1": round(ch["bottom"], 2),
                    },
                    "created_at": datetime.utcnow(),
                })
    
    return chunks
