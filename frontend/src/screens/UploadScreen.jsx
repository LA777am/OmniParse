import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { HeroGeometric } from '../components/ui/shape-landing-hero';
import { GlowCard } from '../components/ui/glow-card';
import { SignInButton, UserButton, useAuth } from '@clerk/react';

export default function UploadScreen() {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('Waiting for document...');
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const panelRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { getToken, isSignedIn } = useAuth();

  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const uploadFile = async (file) => {
    setStatus('Initializing knowledge ingestion sequence...');
    setIsUploading(true);
    setProgress(0);
    
    // Simulate progress bar up to 90%
    const progressInterval = setInterval(() => {
      setProgress(p => (p < 90 ? p + Math.random() * 15 : p));
    }, 300);

    try {
      const token = await getToken();
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        headers,
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      clearInterval(progressInterval);
      setProgress(100);
      setStatus('Success. Redirecting...');
      setTimeout(() => navigate(`/document/${data.document_id}`), 1000);
    } catch (error) {
      console.error('Upload error:', error);
      clearInterval(progressInterval);
      setIsUploading(false);
      setProgress(0);
      setStatus('Error: Could not upload document.');
    }
  };

  return (
    <>
      <header className="fixed top-0 w-full flex justify-between items-center px-8 h-20 z-50 bg-transparent">
        <div className="flex items-center gap-2">
            <span className="text-[24px] font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>OmniParse</span>
        </div>
        <div className="flex items-center gap-4">
            {!isSignedIn ? (
                <div className="flex items-center gap-3">
                    <span className="text-[10px] text-gray-400 hidden sm:block uppercase tracking-widest font-mono">Sign in to save history</span>
                    <SignInButton mode="modal">
                        <button className="px-5 py-2 bg-white text-black rounded-lg text-[12px] font-bold hover:opacity-80 transition-all active:scale-95 uppercase tracking-widest">Sign In</button>
                    </SignInButton>
                </div>
            ) : (
                <UserButton 
                    appearance={{
                        elements: {
                            userButtonAvatarBox: "w-9 h-9 border border-white/20",
                        }
                    }}
                />
            )}
        </div>
      </header>

      <HeroGeometric badge="OmniParse Core" title1="OmniParse" title2="AI Document Intelligence">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0rem' }}>
          <div ref={panelRef} className="w-full max-w-[480px]">
            <GlowCard customSize={true} glowColor="purple" className="relative z-20 w-full p-8 text-center bg-black/40 backdrop-blur-3xl shadow-2xl">
            <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem', fontSize: '1.4rem', fontFamily: 'Outfit' }}>Initialize Document</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Drop a PDF to begin knowledge ingestion.</p>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept="application/pdf,text/plain,text/markdown,text/csv" 
            className="hidden" 
          />

          <div 
            onClick={!isUploading ? handleClick : undefined}
            onDragOver={!isUploading ? handleDragOver : undefined}
            onDragLeave={!isUploading ? handleDragLeave : undefined}
            onDrop={!isUploading ? handleDrop : undefined}
            className="relative overflow-hidden"
            style={{
              border: `2px ${isDragging ? 'solid' : 'dashed'} ${isDragging ? 'var(--glass-border-hover)' : 'var(--glass-border)'}`,
              borderRadius: '12px',
              padding: '2rem 1.5rem',
              background: isDragging ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              transition: 'all 0.3s ease',
              cursor: isUploading ? 'default' : 'pointer'
            }}
          >
            {isUploading && (
              <div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-white/10 to-white/40 z-0 transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }} 
              />
            )}
            <div className="relative z-10 flex flex-col items-center">
              <UploadCloud size={36} color={isDragging || isUploading ? 'var(--text-primary)' : 'var(--text-secondary)'} style={{ margin: '0 auto 1rem', transition: 'all 0.3s ease' }} />
              <p className="monospace" style={{ color: isDragging || isUploading ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.85rem' }}>
                {status}
              </p>
            </div>
          </div>
          </GlowCard>
        </div>
      </div>
      </HeroGeometric>
    </>
  );
}
