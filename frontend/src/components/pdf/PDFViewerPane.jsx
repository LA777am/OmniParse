import React, { useState, useEffect, useRef, memo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up the worker for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

const PDFViewerPane = memo(function PDFViewerPane({ pdfUrl, activeHighlight }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [containerWidth, setContainerWidth] = useState(500);
  const [zoom, setZoom] = useState(1.0);
  const containerRef = useRef(null);

  // Jump to the highlighted page if it changes
  useEffect(() => {
    if (activeHighlight && activeHighlight.page_number) {
      setCurrentPage(activeHighlight.page_number);
    }
  }, [activeHighlight]);

  // Adjust PDF width based on container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.getBoundingClientRect().width - 32); // 32px for padding
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  const renderHighlight = () => {
    if (!activeHighlight || !activeHighlight.spatial_coordinates || !activeHighlight.page_dimensions) return null;
    if (activeHighlight.page_number !== currentPage) return null;

    const { x0, y0, x1, y1 } = activeHighlight.spatial_coordinates;
    const { width: origWidth } = activeHighlight.page_dimensions;
    
    // Calculate scale factor using the zoomed width
    const currentRenderWidth = containerWidth * zoom;
    const scale = currentRenderWidth / origWidth;
    
    const highlightStyle = {
      position: 'absolute',
      left: `${x0 * scale}px`,
      top: `${y0 * scale}px`,
      width: `${(x1 - x0) * scale}px`,
      height: `${(y1 - y0) * scale}px`,
      backgroundColor: 'rgba(168, 85, 247, 0.3)', // Purple glass highlight
      border: '2px solid rgba(168, 85, 247, 0.8)',
      borderRadius: '4px',
      boxShadow: '0 0 15px rgba(168, 85, 247, 0.5)',
      pointerEvents: 'none',
      zIndex: 10,
      transition: 'all 0.3s ease-in-out'
    };

    return <div style={highlightStyle} className="animate-in fade-in duration-300" />;
  };

  if (!pdfUrl) {
    return (
      <div className="flex-1 rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-6 flex items-center justify-center">
        <p className="text-gray-400 font-mono text-sm">Loading document...</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full rounded-3xl bg-white/5 backdrop-blur-md border border-white/10 p-4 relative overflow-hidden">
      
      {/* Header / Controls */}
      <div className="flex items-center justify-between mb-4 px-2">
        <h3 className="text-sm font-semibold tracking-widest uppercase text-white/80" style={{ fontFamily: 'JetBrains Mono' }}>
          Document Viewer
        </h3>
        
        <div className="flex items-center gap-6">
          {/* Zoom Controls */}
          <div className="flex items-center gap-3 bg-black/40 rounded-full px-3 py-1 border border-white/5">
            <button 
              onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
              className="text-white/60 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">zoom_out</span>
            </button>
            <span className="text-xs font-mono text-white/80 w-12 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button 
              onClick={() => setZoom(z => Math.min(3.0, z + 0.25))}
              className="text-white/60 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">zoom_in</span>
            </button>
          </div>

          {/* Pagination Controls */}
          {numPages && (
            <div className="flex items-center gap-4 bg-black/40 rounded-full px-3 py-1 border border-white/5">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="text-white/60 hover:text-white disabled:opacity-30 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">chevron_left</span>
              </button>
              <span className="text-xs font-mono text-white/80">
                {currentPage} / {numPages}
              </span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(numPages, p + 1))}
                disabled={currentPage >= numPages}
                className="text-white/60 hover:text-white disabled:opacity-30 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">chevron_right</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PDF Container */}
      <div 
        ref={containerRef} 
        data-lenis-prevent="true"
        className="flex-1 overflow-y-auto overflow-x-auto relative bg-black/20 rounded-xl"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div style={{ 
          minWidth: '100%',
          minHeight: '100%',
          width: 'max-content',
          height: 'max-content',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: '24px 0'
        }}>
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center h-64 text-white/50 text-sm font-mono w-full">
                Parsing PDF layout...
              </div>
            }
            className="relative"
          >
            <Page 
              pageNumber={currentPage} 
              width={containerWidth * zoom} 
              renderTextLayer={true}
              renderAnnotationLayer={false}
              className="shadow-2xl relative"
            >
              {renderHighlight()}
            </Page>
          </Document>
        </div>
      </div>

    </div>
  );
});

export default PDFViewerPane;
