'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Bot, User, Sparkles, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' 
});

interface Message {
  role: 'user' | 'model';
  content: string;
  isThinking?: boolean;
}

export default function ChatBot({ context }: { context?: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isDeepThink, setIsDeepThink] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (isDeepThink) {
        const response = await ai.models.generateContent({
          model: "gemini-3.1-pro-preview",
          contents: input,
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
            systemInstruction: `You are a highly intelligent academic tutor. Use deep reasoning to solve complex problems and explain difficult concepts. ${context ? `Context about current handout: ${context}` : ''}`,
          }
        });
        const botMessage: Message = { role: 'model', content: response.text };
        setMessages(prev => [...prev, botMessage]);
      } else {
        const history = messages.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }));

        const chat = ai.chats.create({
          model: "gemini-3-flash-preview",
          history: history,
          config: {
            systemInstruction: `You are EduFlow AI, a helpful academic assistant. ${context ? `Context about current handout: ${context}` : ''} Provide clear, accurate, and encouraging responses.`,
          }
        });

        const response = await chat.sendMessage({
          message: input,
        });

        const botMessage: Message = { role: 'model', content: response.text };
        setMessages(prev => [...prev, botMessage]);
      }
    } catch (error) {
      console.error('Chat Error:', error);
      setMessages(prev => [...prev, { role: 'model', content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={() => setIsOpen(true)}
          className="w-16 h-16 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 text-white p-0"
        >
          <Bot className="w-8 h-8" />
        </Button>
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className={`fixed bottom-6 right-6 z-50 w-full max-w-[400px] ${isMinimized ? 'h-auto' : 'h-[600px]'} flex flex-col`}
      >
        <Card className="flex-1 flex flex-col shadow-2xl border-indigo-100 overflow-hidden rounded-[2rem]">
          {/* Header */}
          <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">EduFlow AI</h3>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] opacity-80 uppercase tracking-widest font-bold">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsDeepThink(!isDeepThink)} 
                className={`text-[10px] font-bold uppercase tracking-widest px-2 h-7 rounded-lg transition-colors ${isDeepThink ? 'bg-amber-400 text-slate-900 hover:bg-amber-500' : 'bg-white/10 text-white hover:bg-white/20'}`}
              >
                {isDeepThink ? 'Deep Think ON' : 'Deep Think'}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)} className="text-white hover:bg-white/10 w-8 h-8">
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-white/10 w-8 h-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4" viewportRef={scrollRef}>
                <div className="space-y-4">
                  {messages.length === 0 && (
                    <div className="text-center py-8">
                      <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-6 h-6 text-indigo-600" />
                      </div>
                      <p className="text-sm text-slate-500 font-medium">How can I help you with your studies today?</p>
                    </div>
                  )}
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="w-8 h-8 border">
                          <AvatarFallback className={msg.role === 'user' ? 'bg-slate-100' : 'bg-indigo-100'}>
                            {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-indigo-600" />}
                          </AvatarFallback>
                        </Avatar>
                        <div className={`p-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-indigo-600 text-white rounded-tr-none' 
                            : 'bg-slate-100 text-slate-800 rounded-tl-none'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex gap-3 max-w-[85%]">
                        <Avatar className="w-8 h-8 border">
                          <AvatarFallback className="bg-indigo-100">
                            <Bot className="w-4 h-4 text-indigo-600" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none">
                          <div className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input */}
              <div className="p-4 border-t bg-slate-50">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask anything..."
                    className="rounded-xl border-slate-200 focus:ring-indigo-600"
                  />
                  <Button onClick={handleSend} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-3">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2 font-medium uppercase tracking-wider">
                  Powered by Gemini AI
                </p>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
