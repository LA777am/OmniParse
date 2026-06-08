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
    <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden relative font-sans text-text-primary">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[40%] -left-[20%] w-[800px] h-[800px] bg-accent-primary/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
        <div className="absolute top-[60%] -right-[10%] w-[600px] h-[600px] bg-accent-dark/20 rounded-full blur-[100px] mix-blend-screen" />
        {/* Dot pattern */}
        <div 
          className="absolute inset-0 opacity-20" 
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}
        />
      </div>

      {/* App Shell content - Elevated over background */}
      <div className="relative z-10 flex flex-col h-full w-full">
        {/* ── Header ── */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border-subtle bg-bg-secondary/40 backdrop-blur-xl shadow-sm">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-accent-primary blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300 rounded-lg"></div>
              <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary to-accent-dark flex items-center justify-center border border-white/10 shadow-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-gradient">
                Lean OmniParse
              </h1>
              <p className="text-xs font-medium text-accent-light/80 uppercase tracking-wider mt-0.5">
                Spatial Metadata Platform
              </p>
            </div>
          </div>

          {/* Status pill */}
          <div className="flex items-center">
            {appState === "processing" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-status-pending/10 border border-status-pending/30 shadow-[0_0_15px_rgba(251,191,36,0.15)]">
                <div className="w-2.5 h-2.5 rounded-full bg-status-pending animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                <span className="text-xs font-semibold text-status-pending tracking-wide">Processing</span>
              </motion.div>
            )}
            {appState === "query" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-status-success/10 border border-status-success/30 shadow-[0_0_15px_rgba(74,222,128,0.15)]">
                <div className="w-2.5 h-2.5 rounded-full bg-status-success shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
                <span className="text-xs font-semibold text-status-success tracking-wide">Ready</span>
              </motion.div>
            )}
          </div>
        </header>

        {/* ── Main Content ── */}
        <main className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {appState === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="h-full flex items-center justify-center p-6"
              >
                <div
                  className="glass-panel p-16 text-center cursor-pointer relative group max-w-xl w-full
                             hover:bg-bg-secondary/60 transition-all duration-500 overflow-hidden"
                  onClick={() => {
                    setAppState("processing");
                    setTimeout(() => setAppState("query"), 3000);
                  }}
                >
                  {/* Subtle hover gradient */}
                  <div className="absolute inset-0 bg-gradient-to-b from-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  {/* Dashed border effect */}
                  <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-border-subtle group-hover:border-accent-primary/50 group-hover:bg-accent-primary/5 transition-all duration-300 z-0 pointer-events-none" />
                  
                  <div className="relative z-10">
                    <motion.div 
                      whileHover={{ y: -5, scale: 1.05 }}
                      className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-bg-tertiary to-bg-secondary border border-border-subtle flex items-center justify-center shadow-xl group-hover:shadow-accent-primary/20 transition-all duration-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-accent-light group-hover:text-accent-primary transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </motion.div>
                    <h2 className="text-2xl font-bold text-text-primary mb-3 group-hover:text-white transition-colors">
                      Drag & Drop your PDF
                    </h2>
                    <p className="text-base text-text-secondary mb-6 max-w-sm mx-auto">
                      Upload your document to generate rich spatial embeddings and extract deep insights.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-bg-tertiary/50 border border-border-subtle text-xs text-text-muted">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" /><polyline points="13 2 13 9 20 9" /></svg>
                      Supports PDF up to 50 MB
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {appState === "processing" && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="h-full flex items-center justify-center p-6"
              >
                <div className="glass-panel p-16 text-center max-w-md w-full relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-bg-tertiary">
                    <motion.div 
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 3, ease: "linear" }}
                      className="h-full bg-gradient-to-r from-accent-primary to-accent-light shadow-[0_0_10px_rgba(99,144,191,0.5)]" 
                    />
                  </div>
                  
                  <div className="relative w-20 h-20 mx-auto mb-8">
                    <div className="absolute inset-0 rounded-full border-4 border-bg-tertiary" />
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-0 rounded-full border-4 border-accent-primary border-t-transparent shadow-[0_0_15px_rgba(99,144,191,0.3)]" 
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-accent-light animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </div>
                  </div>
                  
                  <h2 className="text-xl font-bold text-text-primary mb-3">
                    Analyzing Document
                  </h2>
                  <div className="space-y-2 text-sm text-text-secondary">
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Parsing page geometry...</motion.p>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}>Extracting structural blocks...</motion.p>
                    <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2.2 }}>Generating spatial embeddings...</motion.p>
                  </div>
                </div>
              </motion.div>
            )}

            {appState === "query" && (
              <motion.div
                key="query"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="h-full flex flex-col md:flex-row p-4 gap-4"
              >
                {/* LEFT PANE: Chat Interface (40%) */}
                <div className="w-full md:w-[400px] lg:w-[450px] flex flex-col glass-panel overflow-hidden shadow-2xl">
                  {/* Chat Header */}
                  <div className="px-5 py-4 border-b border-border-subtle bg-bg-secondary/50 flex items-center gap-3">
                    <div className="p-1.5 rounded bg-accent-primary/20 text-accent-primary">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <h3 className="font-semibold text-sm">Spatial Assistant</h3>
                  </div>
                  
                  {/* Chat Messages Area */}
                  <div className="flex-1 p-5 overflow-y-auto flex flex-col items-center justify-center bg-gradient-to-b from-transparent to-bg-secondary/20">
                     <div className="w-16 h-16 rounded-full bg-bg-tertiary flex items-center justify-center mb-4 border border-border-subtle shadow-inner">
                       <span className="text-2xl">✨</span>
                     </div>
                     <p className="text-text-primary font-medium mb-1">How can I help?</p>
                     <p className="text-xs text-text-muted text-center max-w-[250px]">
                       Ask about figures, specific sections, or general concepts in the document.
                     </p>
                  </div>

                  {/* Chat Input */}
                  <div className="p-4 bg-bg-secondary/80 border-t border-border-subtle backdrop-blur-md">
                    <div className="relative flex items-center">
                      <input
                        type="text"
                        placeholder="Ask anything..."
                        className="w-full pl-4 pr-12 py-3 rounded-xl bg-bg-tertiary text-text-primary
                                   placeholder:text-text-muted border border-border-subtle shadow-inner
                                   focus:outline-none focus:border-accent-primary focus:ring-1
                                   focus:ring-accent-primary/50 text-sm transition-all"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") console.log("Send message");
                        }}
                      />
                      <button className="absolute right-2 p-1.5 rounded-lg bg-accent-primary text-white hover:bg-accent-light transition-colors hover:shadow-lg hover:shadow-accent-primary/20">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                      </button>
                    </div>
                  </div>
                </div>

                {/* RIGHT PANE: PDF Viewer (60%) */}
                <div className="flex-1 glass-panel overflow-hidden relative flex flex-col shadow-2xl">
                  {/* PDF Viewer Header */}
                  <div className="px-4 py-3 border-b border-border-subtle bg-bg-secondary/50 flex items-center justify-between">
                     <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                        <span className="font-medium">document_analysis.pdf</span>
                     </div>
                     <div className="flex gap-2">
                        <button className="p-1.5 rounded hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="11" y1="8" x2="11" y2="14"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        </button>
                        <button className="p-1.5 rounded hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors">
                           <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="8" y1="11" x2="14" y2="11"></line></svg>
                        </button>
                     </div>
                  </div>
                  
                  {/* PDF Canvas Area */}
                  <div className="flex-1 bg-black/20 flex items-center justify-center relative overflow-hidden">
                    {/* Background grid for canvas */}
                    <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                    
                    {/* Placeholder Document Page */}
                    <div className="relative w-[500px] h-[700px] bg-white rounded shadow-2xl flex flex-col text-slate-800 p-8 transform transition-transform hover:scale-[1.02] duration-500">
                       <div className="w-3/4 h-8 bg-slate-200 rounded mb-6"></div>
                       <div className="w-full h-4 bg-slate-100 rounded mb-3"></div>
                       <div className="w-full h-4 bg-slate-100 rounded mb-3"></div>
                       <div className="w-5/6 h-4 bg-slate-100 rounded mb-8"></div>
                       
                       <div className="w-full h-48 bg-slate-100 rounded mb-8 relative group border border-slate-200 flex items-center justify-center cursor-crosshair hover:bg-slate-50 transition-colors">
                          <span className="text-slate-400 font-medium">Figure 1.0</span>
                          {/* Simulated bounding box */}
                          <div className="absolute inset-0 bg-[rgba(99,144,191,0.15)] border-2 border-[rgba(99,144,191,0.6)] rounded opacity-0 group-hover:opacity-100 transition-opacity flex items-start p-2">
                             <span className="bg-[rgba(99,144,191,0.9)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md">chart_figure</span>
                          </div>
                       </div>
                       
                       <div className="w-full h-4 bg-slate-100 rounded mb-3"></div>
                       <div className="w-full h-4 bg-slate-100 rounded mb-3"></div>
                       <div className="w-4/5 h-4 bg-slate-100 rounded mb-3"></div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
