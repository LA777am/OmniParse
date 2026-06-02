/* ── TypeScript interfaces for API contracts ──
   These mirror the Pydantic models in backend/app/schemas/
*/

export interface PageDimensions {
  width: number;
  height: number;
}

export interface SpatialCoordinates {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface Citation {
  source_index: number;
  page_number: number;
  page_dimensions: PageDimensions;
  bounding_box: [number, number, number, number]; // [x0, y0, x1, y1]
  chunk_text: string;
  chunk_type: "paragraph" | "table_cell" | "header" | "footer" | "caption";
  relevance_score: number;
}

export interface QueryResponse {
  answer: string;
  citations: Citation[];
  model: string;
  chunks_retrieved: number;
}

export interface UploadResponse {
  task_id: string;
  document_id: string;
  status: string;
}

export interface TaskStatus {
  task_id: string;
  document_id: string;
  original_filename: string;
  status: "pending" | "processing" | "completed" | "failed";
  chunk_count: number;
  page_count: number;
  error_log: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp: Date;
}
