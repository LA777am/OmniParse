import React, { useState, useRef, useEffect, useTransition } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlowCard } from '../components/ui/glow-card';
import { Textarea, useAutoResizeTextarea, TypingDots } from '../components/ui/chat-input';
import { Noise } from '../components/ui/noise';
import { SendIcon, LoaderIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatScreen() {
    const { document_id } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [stats, setStats] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const chatContainerRef = useRef(null);
    const navigate = useNavigate();
    
    const { textareaRef, adjustHeight } = useAutoResizeTextarea({
        minHeight: 60,
        maxHeight: 200,
    });

    const scrollToEnd = () => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        scrollToEnd();
    }, [messages]);

    useEffect(() => {
        if (!document_id) return;
        let pollInterval;
        const fetchStats = async () => {
            try {
                const res = await fetch(`/api/v1/documents/${document_id}/stats`);
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                    if (data.status === 'completed' || data.status === 'failed') {
                        clearInterval(pollInterval);
                    }
                }
            } catch (err) {
                console.error("Polling error", err);
            }
        };
        fetchStats();
        pollInterval = setInterval(fetchStats, 2000);
        return () => clearInterval(pollInterval);
    }, [document_id]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;
        
        const newMsg = { text: input, sender: 'user', time: 'JUST NOW' };
        setMessages(prev => [...prev, newMsg]);
        const currentInput = input;
        setInput("");
        adjustHeight(true);
        setIsTyping(true);

        try {
            const res = await fetch(`/api/v1/documents/${document_id}/query`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: currentInput, top_k: 5 })
            });
            if (!res.ok) throw new Error('Query failed');
            const data = await res.json();
            const aiMsg = { text: data.answer, sources: data.sources, sender: 'ai', time: 'JUST NOW' };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg = { text: "Error: Unable to reach the engine. " + error.message, sender: 'ai', time: 'JUST NOW' };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="bg-black text-white h-screen flex flex-col overflow-hidden">
            {/* TopNavBar */}
            <header className="fixed top-0 w-full flex justify-between items-center px-8 h-20 z-50 bg-white/5 backdrop-blur-2xl border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="text-[24px] font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>OmniParse</span>
                </div>
                <nav className="hidden md:flex items-center gap-8">
                    <a className="text-[16px] text-white border-b-2 border-white pb-1" href="#">Platform</a>
                    <a className="text-[16px] text-gray-400 hover:text-white transition-colors" href="#">Security</a>
                    <a className="text-[16px] text-gray-400 hover:text-white transition-colors" href="#">Pricing</a>
                    <a className="text-[16px] text-gray-400 hover:text-white transition-colors" href="#">Docs</a>
                </nav>
                <div className="flex items-center gap-4">
                    <button className="text-[12px] text-gray-400 hover:text-white transition-all duration-200 uppercase tracking-widest">Contact Sales</button>
                    <button className="px-5 py-2 bg-white text-black rounded-lg text-[12px] font-bold hover:opacity-80 transition-all active:scale-95 uppercase tracking-widest">Sign In</button>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="flex-1 pt-20 flex min-h-0 gap-4 p-4 relative z-10">
                {/* Left Panel: Document Metadata (30%) */}
                <GlowCard customSize={true} glowColor="purple" className="hidden lg:flex flex-col w-[30%] bg-white/5 backdrop-blur-2xl shadow-2xl rounded-2xl p-6 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-[24px] text-white font-bold" style={{ fontFamily: 'Outfit' }}>Metadata</h2>
                        <span className="material-symbols-outlined text-gray-400">database</span>
                    </div>

                    {/* File Header */}
                    <div className="mb-8 p-4 rounded-xl bg-white/5 border border-white/5">
                        <p className="text-[12px] text-gray-400 mb-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>CURRENT DOCUMENT</p>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-white">description</span>
                            <span className="text-[14px] text-white truncate" style={{ fontFamily: 'JetBrains Mono' }}>{stats ? stats.original_filename : 'Loading...'}</span>
                        </div>
                    </div>

                    {/* Stats List */}
                    <div className="space-y-6">
                        <div>
                            <p className="text-[12px] text-gray-400 mb-2 uppercase tracking-widest font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>Extraction Stats</p>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-[14px] text-gray-400">Status</span>
                                    <span className="text-[14px] text-white uppercase" style={{ fontFamily: 'JetBrains Mono', color: stats && stats.status === 'completed' ? '#4ade80' : 'inherit' }}>{stats ? stats.status : 'N/A'}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-[14px] text-gray-400">Chunks</span>
                                    <span className="text-[14px] text-white" style={{ fontFamily: 'JetBrains Mono' }}>{stats ? stats.total_chunks : 0}</span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-white/5">
                                    <span className="text-[14px] text-gray-400">Pages</span>
                                    <span className="text-[14px] text-white" style={{ fontFamily: 'JetBrains Mono' }}>{stats ? stats.total_pages : 0}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Visual Context Indicator */}
                    <div className="mt-auto pt-8">
                        <div className="relative w-full h-32 rounded-lg overflow-hidden border border-white/10">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[12px] text-white font-semibold bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm tracking-wide">RAG Engine Active</span>
                            </div>
                        </div>
                    </div>
                </GlowCard>

                {/* Right Panel: Chat Interface (70%) */}
                <GlowCard customSize={true} glowColor="blue" className="flex flex-col flex-1 min-w-0 min-h-0 lg:w-[70%] bg-white/5 backdrop-blur-2xl shadow-2xl rounded-2xl relative overflow-hidden">
                    
                    {/* Chat Background Overlay */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_560px_at_50%_200px,rgba(249,115,22,0.08),transparent)]" />
                        <Noise patternRefreshInterval={2} patternAlpha={8} />
                    </div>

                    {/* Messages Area */}
                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 pb-48 relative z-10" style={{ scrollbarWidth: 'none' }}>
                        {/* Static AI Message */}
                        <div className="flex flex-col items-start max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-500">
                            <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 backdrop-blur-md border border-white/10">
                                <p className="text-[16px] text-white leading-relaxed font-light" style={{ fontFamily: 'Outfit' }}>
                                    {stats && stats.status === 'completed' 
                                        ? `Hello. I have successfully parsed ${stats.original_filename}. I've indexed ${stats.total_chunks} chunks. How can I assist with your document analysis?` 
                                        : 'Processing document... please wait.'}
                                </p>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-2 ml-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>OMNIPARSE AI • {stats ? stats.status : 'initializing'}</span>
                        </div>

                        {messages.map((msg, idx) => (
                            msg.sender === 'user' ? (
                                <div key={idx} className="flex flex-col items-end max-w-[85%] ml-auto animate-in fade-in slide-in-from-right-2 duration-300">
                                    <div className="p-4 rounded-2xl rounded-tr-none bg-white/15 border border-white/10">
                                        <p className="text-[16px] text-white leading-relaxed font-light" style={{ fontFamily: 'Outfit' }}>{msg.text}</p>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-2 mr-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>YOU • {msg.time}</span>
                                </div>
                            ) : (
                                <div key={idx} className="flex flex-col items-start max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 backdrop-blur-md border border-white/10">
                                        <p className="text-[16px] text-white leading-relaxed font-light" style={{ fontFamily: 'Outfit' }}>{msg.text}</p>
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                <p className="text-[10px] text-gray-400 mb-1 font-semibold tracking-widest uppercase">Sources</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {msg.sources.map((s, i) => (
                                                        <span key={i} className="px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-gray-300 border border-white/5 font-mono">
                                                            {s.page_number ? `Page ${s.page_number}` : `Chunk ${i}`}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-2 ml-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>OMNIPARSE AI • {msg.time}</span>
                                </div>
                            )
                        ))}
                    </div>

                    {/* Floating Input Area */}
                    <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-black via-black/80 to-transparent z-20">
                        <div className="max-w-4xl mx-auto relative flex flex-col items-center">
                            
                            <AnimatePresence>
                                {isTyping && (
                                    <motion.div 
                                        className="absolute -top-12 mx-auto backdrop-blur-2xl bg-white/[0.02] rounded-full px-4 py-2 shadow-lg border border-white/[0.05]"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-2 text-sm text-white/70" style={{ fontFamily: 'Outfit' }}>
                                                <span>OmniParse AI is reasoning</span>
                                                <TypingDots />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="w-full relative bg-[#E5E7EB] rounded-2xl border border-gray-300 shadow-2xl overflow-hidden mt-4">
                                <div className="p-2">
                                    <Textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={(e) => {
                                            setInput(e.target.value);
                                            adjustHeight(false);
                                        }}
                                        onKeyDown={handleKeyDown}
                                        placeholder="Query the document..."
                                        containerClassName="w-full"
                                        className="w-full px-4 py-3 resize-none bg-transparent border-none text-gray-900 text-sm focus:outline-none placeholder:text-gray-500 min-h-[60px]"
                                        style={{ overflow: "hidden", fontFamily: 'Outfit' }}
                                        showRing={false}
                                    />
                                </div>
                                <div className="p-3 border-t border-gray-300 flex items-center justify-end gap-4">
                                    <motion.button
                                        type="button"
                                        onClick={handleSend}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isTyping || !input.trim()}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                            input.trim()
                                                ? "bg-black text-white shadow-lg shadow-black/10"
                                                : "bg-gray-300 text-gray-500"
                                        }`}
                                    >
                                        {isTyping ? (
                                            <LoaderIcon className="w-4 h-4 animate-[spin_2s_linear_infinite]" />
                                        ) : (
                                            <SendIcon className="w-4 h-4" />
                                        )}
                                        <span style={{ fontFamily: 'Outfit' }}>Send Query</span>
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </div>
                </GlowCard>
            </main>

            {/* Interactive Layer / Magenta Orb Background */}
            <div 
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundColor: "#050505",
                    backgroundImage: `
                        linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px),
                        radial-gradient(circle at 50% 60%, rgba(236,72,153,0.05) 0%, rgba(168,85,247,0.02) 40%, transparent 70%)
                    `,
                    backgroundSize: "40px 40px, 40px 40px, 100% 100%",
                }}
            />
        </div>
    );
}
