import React, { useState, useRef, useEffect, useTransition } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { GlowCard } from '../components/ui/glow-card';
import { Textarea, useAutoResizeTextarea, TypingDots } from '../components/ui/chat-input';
import { Noise } from '../components/ui/noise';
import { SendIcon, LoaderIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PDFViewerPane from '../components/pdf/PDFViewerPane';
import { SignInButton, UserButton, useAuth } from '@clerk/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatScreen() {
    const { document_id } = useParams();
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [stats, setStats] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [activeHighlight, setActiveHighlight] = useState(null);
    const [recentDocs, setRecentDocs] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const chatContainerRef = useRef(null);
    const navigate = useNavigate();
    const { getToken, isSignedIn } = useAuth();
    
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
                const token = await getToken();
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const res = await fetch(`/api/v1/documents/${document_id}/stats`, { headers });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                    if (data.status === 'completed' || data.status === 'failed') {
                        clearInterval(pollInterval);
                    }
                }
            } catch (error) {
                console.error("Could not fetch stats:", error);
            }
        };

        const fetchHistory = async () => {
            if (!isSignedIn) {
                setRecentDocs([]);
                return;
            }
            try {
                const token = await getToken();
                const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
                const res = await fetch('/api/v1/documents/', { headers });
                if (res.ok) {
                    const data = await res.json();
                    if (Array.isArray(data)) setRecentDocs(data);
                }
            } catch (error) {
                console.error("Could not fetch recent documents:", error);
            }
        };

        fetchStats();
        fetchHistory();
        
        pollInterval = setInterval(fetchStats, 2000);
        return () => clearInterval(pollInterval);
    }, [document_id]);

    const handleSend = async () => {
        if (!input.trim() || isTyping) return;
        
        const newMsg = { text: input, sender: 'user', time: 'JUST NOW' };
        setMessages(prev => [...prev, newMsg]);
        const userMsg = newMsg;
        setInput("");
        adjustHeight(true);
        setIsTyping(true);

        try {
            const token = await getToken();
            const headers = { 'Content-Type': 'application/json' };
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`/api/v1/documents/${document_id}/query`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ query: userMsg.text })
            });
            if (!res.ok) throw new Error('Query failed');
            const data = await res.json();
            const aiMsg = { text: data.answer, sources: data.sources, sender: 'ai', time: 'JUST NOW' };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            const errorMsg = { text: "System Error: Unable to reach the OmniParse engine. " + error.message, sender: 'ai', time: 'JUST NOW', isError: true };
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
            <header className="fixed top-0 w-full flex justify-between items-center px-8 h-20 z-50 bg-white/5 backdrop-blur-sm border-b border-white/10">
                <div className="flex items-center gap-2">
                    <span className="text-[24px] font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit' }}>OmniParse</span>
                </div>
                <nav className="hidden md:flex items-center gap-8 relative">
                    <button 
                        onClick={() => setShowHistory(!showHistory)} 
                        className="text-[16px] text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined text-[20px]">history</span>
                        History
                    </button>
                    
                    {/* History Dropdown */}
                    {showHistory && (
                        <div className="absolute top-12 left-0 w-80 bg-[#121212] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-white/5 bg-white/5">
                                <h3 className="text-sm font-semibold tracking-widest uppercase text-white/80" style={{ fontFamily: 'JetBrains Mono' }}>Recent Documents</h3>
                            </div>
                            <div className="max-h-[60vh] overflow-y-auto p-2 custom-scrollbar">
                                {recentDocs.length === 0 ? (
                                    <div className="p-4 text-center text-white/40 text-sm font-mono">No history found.</div>
                                ) : (
                                    recentDocs.map((doc) => (
                                        <div 
                                            key={doc.document_id}
                                            onClick={() => {
                                                setShowHistory(false);
                                                navigate(`/document/${doc.document_id}`);
                                                window.location.reload(); // Force reload to fetch new doc
                                            }}
                                            className="flex flex-col gap-1 p-3 rounded-xl hover:bg-white/10 cursor-pointer transition-colors group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span className="material-symbols-outlined text-white/40 group-hover:text-white/80 text-[18px]">description</span>
                                                <span className="text-sm text-white/90 truncate font-medium" style={{ fontFamily: 'Outfit' }}>
                                                    {doc.original_filename}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center ml-6">
                                                <span className="text-[10px] uppercase tracking-widest font-mono" style={{ color: doc.status === 'completed' ? '#4ade80' : doc.status === 'processing' ? '#fbbf24' : '#f87171' }}>
                                                    {doc.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </nav>
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

            {/* Main Content Grid */}
            <main className="flex-1 pt-20 flex min-h-0 gap-4 p-4 relative z-10 w-full max-w-[1600px] mx-auto">
                {/* Left Panel: PDF Viewer (50%) */}
                <div className="hidden lg:flex w-[50%] h-full">
                    <PDFViewerPane pdfUrl={stats?.pdf_url} activeHighlight={activeHighlight} />
                </div>

                {/* Right Panel: Chat Interface (50%) */}
                <div className="flex-1 min-w-0 min-h-0 lg:w-[50%] rounded-2xl relative flex flex-col" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(24px)', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}>
                    
                    {/* Chat Background Overlay */}
                    <div className="absolute inset-0 z-0 pointer-events-none rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_560px_at_50%_200px,rgba(249,115,22,0.08),transparent)]" />
                        <Noise patternRefreshInterval={2} patternAlpha={8} />
                    </div>

                    {/* Messages Area - Completely Redesigned Scroll Container */}
                    <div 
                        ref={chatContainerRef} 
                        data-lenis-prevent="true"
                        className="flex-1 overflow-y-auto overflow-x-hidden p-6 flex flex-col gap-6 relative z-10" 
                        style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.2) transparent' }}
                    >
                        {/* Static AI Message */}
                        <div className="flex flex-col items-start max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 backdrop-blur-sm border border-white/10">
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
                            ) : msg.isError ? (
                                <div key={idx} className="flex flex-col items-start max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="p-4 rounded-2xl rounded-tl-none bg-red-500/10 backdrop-blur-sm border border-red-500/20">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="material-symbols-outlined text-red-400 text-sm">warning</span>
                                            <span className="text-[12px] text-red-400 font-semibold tracking-wide uppercase" style={{ fontFamily: 'Outfit' }}>Processing Error</span>
                                        </div>
                                        <p className="text-[14px] text-red-200/90 leading-relaxed font-light" style={{ fontFamily: 'JetBrains Mono' }}>{msg.text}</p>
                                    </div>
                                    <span className="text-[10px] text-red-500/50 mt-2 ml-1 uppercase tracking-widest font-semibold" style={{ fontFamily: 'JetBrains Mono' }}>SYSTEM • {msg.time}</span>
                                </div>
                            ) : (
                                <div key={idx} className="flex flex-col items-start max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 backdrop-blur-sm border border-white/10 prose prose-invert max-w-none">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                                        {msg.sources && msg.sources.length > 0 && (
                                            <div className="mt-3 pt-3 border-t border-white/10">
                                                <p className="text-[10px] text-gray-400 mb-1 font-semibold tracking-widest uppercase">Sources</p>
                                                <div className="flex flex-wrap gap-1">
                                                    {msg.sources.map((s, i) => (
                                                        <span 
                                                            key={i} 
                                                            onMouseEnter={() => setActiveHighlight(s)}
                                                            onClick={() => setActiveHighlight(s)}
                                                            className="cursor-pointer hover:bg-white/20 hover:border-white/20 transition-all px-1.5 py-0.5 bg-white/10 rounded text-[9px] text-gray-300 border border-white/5 font-mono"
                                                        >
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

                    {/* Input Area (Pinned to bottom via flex) */}
                    <div className="w-full p-4 bg-black/40 backdrop-blur-sm border-t border-white/10 z-20 relative shrink-0">
                        <div className="max-w-4xl mx-auto relative flex flex-col items-center">
                            
                            <AnimatePresence>
                                {isTyping && (
                                    <motion.div 
                                        className="absolute -top-12 mx-auto backdrop-blur-sm bg-white/[0.02] rounded-full px-4 py-2 shadow-lg border border-white/[0.05]"
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

                            <div className="w-full relative bg-[#121212] rounded-2xl border border-white/10 shadow-2xl overflow-hidden mt-2">
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
                                        className="w-full px-4 py-3 resize-none bg-transparent border-none text-white/90 text-sm focus:outline-none placeholder:text-gray-500 min-h-[60px]"
                                        style={{ overflow: "hidden", fontFamily: 'Outfit' }}
                                        showRing={false}
                                    />
                                </div>
                                <div className="p-3 border-t border-white/10 flex items-center justify-end gap-4">
                                    <motion.button
                                        type="button"
                                        onClick={handleSend}
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={isTyping || !input.trim()}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                                            input.trim()
                                                ? "bg-white text-black shadow-lg shadow-white/10"
                                                : "bg-white/10 text-white/40"
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
                </div>{/* end chat panel */}
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
