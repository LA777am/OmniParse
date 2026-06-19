import React, { useState, useRef, useEffect } from 'react';
import { UploadCloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { HeroGeometric } from '../components/ui/shape-landing-hero';
import { GlowCard } from '../components/ui/glow-card';

export default function UploadScreen() {
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState('Waiting for document...');
  const panelRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

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
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const data = await response.json();
      setStatus('Success. Redirecting...');
      setTimeout(() => navigate(`/document/${data.document_id}`), 1000);
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('Error: Could not upload document.');
    }
  };

  return (
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
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              border: `2px ${isDragging ? 'solid' : 'dashed'} ${isDragging ? 'var(--glass-border-hover)' : 'var(--glass-border)'}`,
              borderRadius: '12px',
              padding: '2rem 1.5rem',
              background: isDragging ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
          >
            <UploadCloud size={36} color={isDragging ? 'var(--text-primary)' : 'var(--text-secondary)'} style={{ margin: '0 auto 1rem', transition: 'all 0.3s ease' }} />
            <p className="monospace" style={{ color: isDragging ? 'var(--text-primary)' : 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {status}
            </p>
          </div>
          </GlowCard>
        </div>
      </div>
    </HeroGeometric>
  );
}
