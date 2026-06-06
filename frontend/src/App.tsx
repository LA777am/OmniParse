import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Lean OmniParse — Main Application Shell
 *
 * Three-state view:
 *   1. UPLOAD   → drag-and-drop PDF upload zone
 *   2. PROCESS  → processing status indicator (polling)
 *   3. QUERY    → dual-pane: chat (left) + PDF viewer (right)
 *
 * Sprint 1: Renders the shell layout with placeholder content.
 * Sprint 5: Each state is replaced with full components.
 */

type AppState = "upload" | "processing" | "query";

function App() {
  const [appState, setAppState] = useState<AppState>("upload");

  return (
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border-subtle bg-bg-secondary/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-dark flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5 text-white"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-semibold text-text-primary tracking-tight">
              Lean OmniParse
            </h1>
            <p className="text-xs text-text-muted">
              Spatial Metadata RAG Platform
            </p>
          </div>
        </div>

        {/* Status pill */}
        <div className="flex items-center gap-2">
          {appState === "processing" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-pending/10 border border-status-pending/30"
            >
              <div className="w-2 h-2 rounded-full bg-status-pending animate-pulse" />
              <span className="text-xs font-medium text-status-pending">
                Processing
              </span>
            </motion.div>
          )}
          {appState === "query" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-status-success/10 border border-status-success/30"
            >
              <div className="w-2 h-2 rounded-full bg-status-success" />
              <span className="text-xs font-medium text-status-success">
                Ready
              </span>
            </motion.div>
          )}
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {appState === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex items-center justify-center"
            >
              {/* Sprint 5: Replace with <UploadZone /> */}
              <div
                className="glass-panel p-12 text-center cursor-pointer
                           hover:glow-border transition-all duration-300 max-w-lg"
                onClick={() => {
                  // Placeholder: simulate upload → processing transition
                  setAppState("processing");
                  setTimeout(() => setAppState("query"), 3000);
                }}
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-primary/10 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-8 h-8 text-accent-primary"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-text-primary mb-2">
                  Drop your PDF here!
                </h2>
                <p className="text-sm text-text-secondary mb-4">
                  Upload a financial document for spatial analysis
                </p>
                <p className="text-xs text-text-muted">
                  Supports PDF files up to 50 MB
                </p>
              </div>
            </motion.div>
          )}

          {appState === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="h-full flex items-center justify-center"
            >
              {/* Sprint 5: Replace with <StatusIndicator /> */}
              <div className="glass-panel p-12 text-center max-w-md">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-accent-primary border-t-transparent animate-spin" />
                <h2 className="text-lg font-semibold text-text-primary mb-2">
                  Extracting spatial metadata...
                </h2>
                <p className="text-sm text-text-secondary">
                  Parsing pages, extracting coordinates, generating embeddings
                </p>
              </div>
            </motion.div>
          )}

          {appState === "query" && (
            <motion.div
              key="query"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="h-full flex"
            >
              {/* LEFT PANE: Chat Interface (40%) */}
              <div className="w-2/5 h-full border-r border-border-subtle flex flex-col bg-bg-secondary/40">
                {/* Sprint 5: Replace with <ChatPane /> */}
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-text-muted">
                    Chat interface — Sprint 5
                  </p>
                </div>
                <div className="p-4 border-t border-border-subtle">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ask a question about the document..."
                      className="flex-1 px-4 py-2.5 rounded-lg bg-bg-tertiary text-text-primary
                                 placeholder:text-text-muted border border-border-subtle
                                 focus:outline-none focus:border-accent-primary/50 focus:ring-1
                                 focus:ring-accent-primary/20 text-sm transition-all"
                    />
                    <button
                      className="px-4 py-2.5 rounded-lg bg-accent-primary text-white text-sm
                                 font-medium hover:bg-accent-light transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT PANE: PDF Viewer (60%) */}
              <div className="w-3/5 h-full bg-bg-primary flex items-center justify-center">
                {/* Sprint 6: Replace with <PDFViewer /> */}
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-bg-tertiary flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-8 h-8 text-text-muted"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <line x1="3" y1="9" x2="21" y2="9" />
                      <line x1="9" y1="21" x2="9" y2="9" />
                    </svg>
                  </div>
                  <p className="text-sm text-text-muted">
                    PDF Viewer — Sprint 6
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    Bounding box overlays will render here
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
