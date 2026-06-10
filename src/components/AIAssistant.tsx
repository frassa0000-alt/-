import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Send, X, Bot, User, Loader2, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIAssistantProps {
  games: any[];
  lang: 'ar' | 'en';
}

const AIAssistant: React.FC<AIAssistantProps> = ({ games, lang }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Use a ref for the AI instance to avoid re-initialization issues
  const aiRef = useRef<GoogleGenAI | null>(null);

  useEffect(() => {
    if (!aiRef.current) {
      try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
          aiRef.current = new GoogleGenAI({ apiKey });
        }
      } catch (e) {
        console.error("Failed to initialize Gemini API:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    if (!aiRef.current) {
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: lang === 'ar' ? 'عذراً، لم يتم إعداد مفتاح API بشكل صحيح.' : 'Sorry, API key is not configured correctly.' 
      }]);
      return;
    }

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const gameContext = games.map(g => `- ${g.title[lang]}: ${g.category}, ${g.size || 'N/A'}`).join('\n');
      
      const systemInstruction = lang === 'ar' 
        ? `أنت مساعد ذكي لمتجر ألعاب OmiEG. هدفك هو مساعدة المستخدمين في العثور على ألعاب رائعة.
           إليك قائمة الألعاب المتوفرة حالياً:
           ${gameContext}
           كن ودوداً، مختصراً، ومفيداً. أجب باللغة العربية.`
        : `You are a helpful AI assistant for OmiEG Games store. Your goal is to help users find great games.
           Here is the list of currently available games:
           ${gameContext}
           Be friendly, concise, and helpful. Answer in English.`;

      const response = await aiRef.current.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          })),
          { role: 'user', parts: [{ text: input }] }
        ],
        config: {
          systemInstruction,
        }
      });

      const botMessage: Message = { 
        role: 'model', 
        text: response.text || (lang === 'ar' ? 'عذراً، حدث خطأ ما.' : 'Sorry, something went wrong.') 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: lang === 'ar' ? 'عذراً، واجهت مشكلة في الاتصال بالذكاء الاصطناعي.' : 'Sorry, I encountered a problem connecting to the AI.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-[100] w-14 h-14 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20 hover:scale-110 transition-all group"
      >
        <Sparkles className="text-black group-hover:rotate-12 transition-transform" size={24} />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={cn(
              "fixed bottom-24 right-6 z-[100] w-[90vw] max-w-[400px] h-[500px] bg-[#111] border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden",
              lang === 'ar' ? 'font-sans' : 'font-sans'
            )}
            dir={lang === 'ar' ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-gradient-to-r from-green-600 to-emerald-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-tight text-white">
                    {lang === 'ar' ? 'مساعد OmiEG' : 'OmiEG Assistant'}
                  </h3>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-white/70 font-bold uppercase">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all text-white">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
              {messages.length === 0 && (
                <div className="text-center py-10 space-y-4">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                    <MessageSquare size={32} className="text-gray-600" />
                  </div>
                  <p className="text-gray-500 text-sm font-medium px-6">
                    {lang === 'ar' 
                      ? 'مرحباً! أنا مساعدك الذكي لمتجر OmiEG. كيف يمكنني مساعدتك اليوم؟ يمكنك أيضاً زيارة موقعنا الرسمي من هنا: omieg.com' 
                      : 'Hi! I am your AI assistant for OmiEG Store. How can I help you today? You can also visit our official site here: omieg.com'}
                  </p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex gap-3",
                  m.role === 'user' ? "flex-row-reverse" : "flex-row"
                )}>
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                    m.role === 'user' ? "bg-green-500 text-black" : "bg-white/5 text-green-400"
                  )}>
                    {m.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                    m.role === 'user' 
                      ? "bg-green-500 text-black rounded-tr-none" 
                      : "bg-white/5 text-gray-200 border border-white/5 rounded-tl-none"
                  )}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center shrink-0 text-green-400">
                    <Bot size={16} />
                  </div>
                  <div className="bg-white/5 p-3 rounded-2xl rounded-tl-none border border-white/5">
                    <Loader2 size={16} className="animate-spin text-green-400" />
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-black/20">
              <div className="relative">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSend()}
                  placeholder={lang === 'ar' ? 'اكتب سؤالك هنا...' : 'Type your question...'}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:border-green-500/50 text-sm"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-green-500 hover:text-green-400 disabled:opacity-50 transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIAssistant;
