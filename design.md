# OmniParse Glassmorphic Design System

OmniParse is a highly advanced, local-first RAG architecture designed to parse PDFs and answer questions. The application must feel incredibly premium, technical, and cutting-edge. 

We will strictly enforce a "Dark Mode Glassmorphic" aesthetic.

## 1. Color Palette

- **Background:** Deep space/midnight gradient. It should not be flat black. Use a radial or linear gradient ranging from extremely dark blue `#0A0F1C` to black `#000000`.
- **Primary Accent:** Electric Cyan (`#00F0FF`) and Neon Purple (`#8A2BE2`) used for glowing borders, primary buttons, and active states.
- **Glass Panels (Surface/Cards):** Panels must not be solid. They should use a transparent white/blue tint (e.g., `rgba(255, 255, 255, 0.03)` or `rgba(0, 240, 255, 0.05)`) with a strong backdrop blur (`backdrop-filter: blur(16px)`).
- **Text (Primary):** Pure White (`#FFFFFF`) or slightly off-white (`#F8F9FA`).
- **Text (Secondary):** Light Gray (`#A0AEC0`) or Muted Cyan (`#82A0B5`).
- **Borders:** Extremely subtle translucent borders `rgba(255, 255, 255, 0.1)`. For active/hover states, borders should transition to a glowing electric cyan `rgba(0, 240, 255, 0.4)`.

## 2. Typography

- **Headers/Display:** Use a geometric, modern font like `Outfit` or `Space Grotesk`. Font weights should be bold or semi-bold. Tracking (letter-spacing) can be slightly tight.
- **Body/Chat Text:** Use `Inter` or `Roboto Mono` for readability and a technical feel. Line height should be generous (`1.6`).
- **Data/Logs:** Use a monospace font (like `Fira Code` or `JetBrains Mono`) for any processing stats, chunk counts, or logs to emphasize the developer-focused nature of the app.

## 3. Core Components

### 3.1. Glassmorphic Panels (The "Container")
Every major section (upload box, chat window, stat tracker) MUST sit inside a Glassmorphic Panel.
- **Rules:** 
  - `background: rgba(10, 15, 28, 0.6);`
  - `backdrop-filter: blur(20px);`
  - `border: 1px solid rgba(255, 255, 255, 0.08);`
  - `border-radius: 16px;`
  - `box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);`

### 3.2. Drag-and-Drop Upload Zone
- **Idle State:** A dashed border with low opacity. A central icon (like a document or upload cloud) glowing softly.
- **Drag-Active State:** The border becomes solid and pulses Electric Cyan. The inner background gets slightly brighter.
- **Uploading State:** A smooth CSS loading spinner or horizontal progress bar filling up with a cyan-to-purple gradient.

### 3.3. RAG Chat Interface
- **User Messages:** Align right. Bubble is a solid, subtle accent color (e.g., `rgba(138, 43, 226, 0.3)`).
- **AI Responses:** Align left. Bubble is standard glassmorphism. Text must be highly readable.
- **Sources/Context Pills:** Below the AI response, display the retrieved document chunks as small, pill-shaped tags (`[Page 1]`, `[Score: 0.89]`). These pills should have a 1px border and hover effect.
- **Input Field:** A floating glass pill at the bottom of the chat. No hard edges. Glows cyan when focused.

## 4. Micro-Interactions & Animation

- **Hover States:** Buttons and cards should slightly scale up (`transform: scale(1.02)`) and increase their border opacity. Transition duration should be `0.2s ease-in-out`.
- **Glow Effects:** Use `box-shadow` strategically to create inner and outer glows on primary elements, making them look like they emit light.
- **Fade Ins:** New messages or newly uploaded documents should fade in and slide up slightly (`opacity 0 -> 1`, `transform translateY(10px) -> 0`).

## 5. Overall Layout Guidelines

- The application should generally be a full-screen Single Page Application.
- Avoid scrollbars on the main window; only scroll within the specific glass panels (e.g., the chat history).
- Use generous padding (`24px` to `32px`) inside panels to let the UI "breathe".
