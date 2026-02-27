import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { cn } from '@/lib/utils';
import { LogoIcon } from '@/components/Logo';
import ReactMarkdown from 'react-markdown';

interface Message {
    role: 'user' | 'model';
    parts: [{ text: string }];
}

const ChatWidget: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const toggleChat = () => setIsOpen(!isOpen);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            role: 'user',
            parts: [{ text: input.trim() }]
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.parts[0].text,
                    history: messages
                }),
            });

            const data = await response.json();

            if (data.reply) {
                setMessages(prev => [...prev, {
                    role: 'model',
                    parts: [{ text: data.reply }]
                }]);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat Error:', error);
            setMessages(prev => [...prev, {
                role: 'model',
                parts: [{ text: "Sorry, I'm having trouble connecting right now. Please try again later." }]
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, y: 20, scale: 0.95, filter: 'blur(10px)' }}
                        transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 25
                        }}
                        className="mb-4 w-[320px] sm:w-[400px] pointer-events-auto shadow-2xl"
                    >
                        <Card className="border-slate-800/50 shadow-2xl overflow-hidden backdrop-blur-xl bg-slate-950/90 rounded-2xl ring-1 ring-white/10">
                            {/* Header */}
                            <CardHeader className="bg-gradient-to-r from-orange-500/10 via-orange-600/10 to-transparent border-b border-white/5 p-4 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex-shrink-0">
                                        <LogoIcon className="w-8 h-8 text-orange-500" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-sm font-bold text-white tracking-wide">AI Assistant</CardTitle>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-medium opacity-80 mt-0.5 flex items-center gap-1">
                                            <Sparkles size={10} className="text-orange-500" />
                                            Ready to assist with your fuel needs
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={toggleChat}
                                    className="text-slate-400 hover:text-white hover:bg-white/5 h-8 w-8 rounded-full transition-colors"
                                >
                                    <X size={18} />
                                </Button>
                            </CardHeader>

                            {/* Chat Area */}
                            <CardContent className="p-0">
                                <ScrollArea className="h-[450px]">
                                    <div className="p-4 space-y-6">
                                        {messages.length === 0 && (
                                            <div className="text-center py-12 px-6 flex flex-col items-center justify-center">
                                                <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-3xl flex items-center justify-center mb-4 animate-float">
                                                    <Bot size={32} className="text-orange-500 opacity-50" />
                                                </div>
                                                <h3 className="text-white font-bold text-sm mb-2">Hello! How can I help?</h3>
                                                <p className="text-[11px] text-slate-400 leading-relaxed max-w-[200px]">
                                                    Ask me about fuel prices, delivery times, or how to place an order.
                                                </p>
                                            </div>
                                        )}

                                        {messages.map((msg, i) => (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                key={i}
                                                className={cn(
                                                    "flex gap-3",
                                                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ring-1",
                                                    msg.role === 'user'
                                                        ? "bg-slate-900 ring-slate-800 text-orange-400"
                                                        : "bg-orange-500/10 ring-orange-500/20 text-orange-500"
                                                )}>
                                                    {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                                </div>
                                                <div className={cn(
                                                    "px-4 py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm max-w-[80%] prose prose-invert prose-p:my-0 prose-strong:text-inherit prose-strong:font-bold",
                                                    msg.role === 'user'
                                                        ? "bg-orange-500 text-white rounded-tr-none font-medium"
                                                        : "bg-slate-900/50 border border-white/5 text-slate-200 rounded-tl-none"
                                                )}>
                                                    <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                                                </div>
                                            </motion.div>
                                        ))}

                                        {isLoading && (
                                            <div className="flex gap-3 flex-row animate-in fade-in slide-in-from-bottom-2">
                                                <div className="w-8 h-8 rounded-lg bg-orange-500/10 ring-1 ring-orange-500/20 flex items-center justify-center text-orange-500">
                                                    <Bot size={14} />
                                                </div>
                                                <div className="bg-slate-900/50 border border-white/5 p-3 rounded-2xl rounded-tl-none flex items-center">
                                                    <div className="flex gap-1">
                                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                                        <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div ref={scrollEndRef} />
                                    </div>
                                </ScrollArea>
                            </CardContent>

                            {/* Input Area */}
                            <CardFooter className="p-4 border-t border-white/5 bg-slate-950/50 backdrop-blur-md">
                                <form
                                    onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                    className="flex w-full gap-2 items-center"
                                >
                                    <div className="relative flex-1 group">
                                        <Input
                                            placeholder="Ask anything about fuel..."
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            className="bg-slate-900/50 border-white/5 text-white placeholder:text-slate-500 focus-visible:ring-orange-500/50 focus-visible:border-orange-500/50 pl-4 py-6 rounded-xl transition-all"
                                        />
                                        <div className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity"></div>
                                    </div>
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={isLoading || !input.trim()}
                                        className="bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-12 w-12 transition-all active:scale-95 shadow-lg shadow-orange-500/10"
                                    >
                                        {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                    </Button>
                                </form>
                            </CardFooter>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleChat}
                className={cn(
                    "w-16 h-16 rounded-3xl shadow-2xl flex items-center justify-center transition-all duration-500 pointer-events-auto group relative overflow-hidden",
                    isOpen
                        ? "bg-slate-900 ring-2 ring-white/10"
                        : "bg-orange-500 hover:bg-orange-600 ring-4 ring-orange-500/20"
                )}
            >
                {/* Glow effect */}
                {!isOpen && (
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                )}

                <div className="relative z-10 transition-transform duration-500" style={{ transform: isOpen ? 'rotate(90deg)' : 'rotate(0)' }}>
                    {isOpen ? <X size={28} className="text-white" /> : <MessageSquare size={28} className="text-white fill-current" />}
                </div>
            </motion.button>
        </div>
    );
};

export default ChatWidget;
