import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlowCard } from '../components/ui/glow-card';

export default function StitchUploadScreen() {
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState('Waiting for document...');
    const [isIngesting, setIsIngesting] = useState(false);
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        handleFiles(e.target.files);
    };

    const handleFiles = (files) => {
        if (files.length > 0) {
            const fileName = files[0].name;
            setStatus(`Ingesting: ${fileName.toUpperCase()}`);
            setIsIngesting(true);
            
            // Simulated ingestion feedback
            setTimeout(() => {
                setStatus(`Analyzing vectors... ${Math.floor(Math.random() * 100)}%`);
                setTimeout(() => navigate('/document/doc-123'), 1500);
            }, 1000);
        }
    };

    // Parallax effect on the background glow
    useEffect(() => {
        const handleMouseMove = (e) => {
            const glow = document.getElementById('background-glow');
            if (glow) {
                const x = (window.innerWidth / 2 - e.pageX) / 30;
                const y = (window.innerHeight / 2 - e.pageY) / 30;
                glow.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        return () => document.removeEventListener('mousemove', handleMouseMove);
    }, []);

    return (
        <div className="bg-black text-white font-sans min-h-screen overflow-hidden">
            {/* TopNavBar */}
            <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-white/5 backdrop-blur-2xl border-b border-white/10">
                <div className="text-[24px] font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>OmniParse</div>
                <nav className="hidden md:flex items-center gap-8">
                    <a className="text-gray-400 hover:text-white transition-colors" href="#">Platform</a>
                    <a className="text-gray-400 hover:text-white transition-colors" href="#">Security</a>
                    <a className="text-gray-400 hover:text-white transition-colors" href="#">Pricing</a>
                    <a className="text-gray-400 hover:text-white transition-colors" href="#">Docs</a>
                </nav>
                <div className="flex items-center gap-4">
                    <button className="text-gray-400 hover:text-white transition-colors uppercase tracking-widest text-[12px] font-semibold">Contact Sales</button>
                    <button className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:opacity-80 transition-all duration-200 active:scale-95 uppercase tracking-widest text-[12px]">Sign In</button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="relative h-screen w-full flex items-center justify-center px-8 overflow-hidden">
                {/* Subtle background light effect */}
                <div id="background-glow" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] pointer-events-none transition-transform duration-75"></div>
                
                {/* Glassmorphic Panel */}
                <GlowCard customSize={true} glowColor="orange" className="bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] w-full max-w-xl rounded-xl p-10 md:p-12 z-10 flex flex-col items-center text-center">
                    <h1 className="text-[32px] text-white font-bold mb-2 tracking-tight" style={{ fontFamily: 'Outfit' }}>Upload Document</h1>
                    <p className="text-gray-400 mb-10 text-[16px]">Initialize knowledge ingestion sequence.</p>
                    
                    {/* Drag-and-Drop Zone */}
                    <div 
                        onClick={handleClick}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`w-full aspect-[4/3] rounded-xl flex flex-col items-center justify-center cursor-pointer group transition-all duration-300 ${
                            isDragging ? 'border-2 border-white/50 bg-white/5 shadow-[0_0_20px_rgba(255,255,255,0.05)]' : 'border-2 border-dashed border-white/10'
                        }`}
                    >
                        <input 
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            className="hidden" 
                            multiple 
                            type="file"
                        />
                        <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                            <span className="material-symbols-outlined text-[64px] text-white shadow-[0_0_15px_rgba(255,255,255,0.3)]">upload_file</span>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[18px] text-white">Drop files here or browse</span>
                            <span className="text-[12px] text-gray-400 uppercase tracking-widest opacity-60 font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>Supports PDF, MD, TXT, CSV</span>
                        </div>
                    </div>
                    
                    {/* Status Area */}
                    <div className="mt-8 flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                            <code className={`text-[12px] font-semibold uppercase tracking-widest ${isIngesting ? 'text-white' : 'text-gray-400 animate-pulse'}`} style={{ fontFamily: 'JetBrains Mono' }}>
                                {status}
                            </code>
                        </div>
                    </div>
                </GlowCard>
            </main>

            {/* Footer */}
            <footer className="fixed bottom-0 w-full py-4 border-t border-white/10 bg-transparent z-50">
                <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto w-full">
                    <div className="text-[12px] text-gray-400 font-semibold uppercase tracking-widest" style={{ fontFamily: 'JetBrains Mono' }}>
                        © 2024 OmniParse AI. Built for the local-first future.
                    </div>
                    <div className="flex gap-8 mt-4 md:mt-0 uppercase tracking-widest font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>
                        <a className="text-[12px] text-gray-400 hover:text-white transition-colors" href="#">Privacy Policy</a>
                        <a className="text-[12px] text-gray-400 hover:text-white transition-colors" href="#">Terms of Service</a>
                        <a className="text-[12px] text-gray-400 hover:text-white transition-colors flex items-center gap-2" href="#">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                            Status
                        </a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
