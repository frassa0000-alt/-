import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { auth, db } from '../lib/firebase';
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'model';
  text: string;
}

interface AIChatProps {
  isOwner?: boolean;
  language?: 'ar' | 'en' | 'fr' | 'es';
}

const AI_TRANSLATIONS = {
  ar: {
    welcome: 'مرحباً بك في دعم أوميجا الذكي! أنا مساعدك الشخصي لاكتشاف الألعاب. كيف يمكنني مساعدتك اليوم؟ 🎮',
    timeout: (date: string) => `أنت في فترة استراحة حتى ${date}. ⏳`,
    banned: 'تم حظرك من استخدام المساعد الذكي. يرجى التواصل مع الدعم الفني. 🚫',
    abuseReport: 'تم إرسال تقرير بالإساءة. تم وضعك في فترة استراحة لمدة 5 دقائق. 🚫',
    error: 'عذراً، حدث خطأ ما. حاول مرة أخرى!',
    connectionError: 'عذراً، واجهت مشكلة في الاتصال. يرجى المحاولة لاحقاً.',
    header: 'دعم أوميجا الذكي',
    placeholderTimeout: 'فترة استراحة...',
    placeholderBanned: 'لقد تم حظرك...',
    placeholderNormal: 'اسألني عن أي لعبة...'
  },
  en: {
    welcome: 'Welcome to OmiEG Smart Support! I am your personal game discovery assistant. How can I help you today? 🎮',
    timeout: (date: string) => `You are on a timeout until ${date}. ⏳`,
    banned: 'You have been banned from using the AI assistant. Please contact support. 🚫',
    abuseReport: 'An abuse report has been sent. You have been placed on a 5-minute timeout. 🚫',
    error: 'Sorry, something went wrong. Try again!',
    connectionError: 'Sorry, I encountered a connection problem. Please try again later.',
    header: 'OmiEG Smart Support',
    placeholderTimeout: 'Timeout period...',
    placeholderBanned: 'You are banned...',
    placeholderNormal: 'Ask me about any game...'
  },
};

export default function AIChat({ isOwner = false, language = 'ar' }: AIChatProps) {
  const t = AI_TRANSLATIONS[language] || AI_TRANSLATIONS.en;
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-omieg-chat', handleOpenChat);
    return () => window.removeEventListener('open-omieg-chat', handleOpenChat);
  }, []);

  const [banStatus, setBanStatus] = useState<{ status: 'active' | 'banned' | 'timeout', expiry?: any }>({ status: 'active' });
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = auth.currentUser;

  useEffect(() => {
    setMessages([
      { 
        role: 'model', 
        text: t.welcome
      }
    ]);
  }, [language]);

  useEffect(() => {
    if (currentUser && !isOwner) {
      checkBan();
    }
  }, [currentUser, isOwner]);

  const checkBan = async () => {
    if (!currentUser) return;
    try {
      const banDoc = await getDoc(doc(db, 'bans', currentUser.uid));
      if (banDoc.exists()) {
        const data = banDoc.data();
        setBanStatus(data as any);
        if (data.status !== 'active' && data.status !== 'unbanned') {
          const expirySeconds = data.expiry?.seconds || (data.expiry instanceof Timestamp ? data.expiry.seconds : 0);
          const dateStr = expirySeconds ? new Date(expirySeconds * 1000).toLocaleDateString(
            language === 'ar' ? 'ar-EG' : 'en-US'
          ) : '...';
          const text = data.status === 'timeout' 
            ? t.timeout(dateStr)
            : t.banned;
          setMessages([{ role: 'model', text }]);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || (!isOwner && banStatus.status !== 'active' && banStatus.status !== 'unbanned')) return;

    const userMessage = input.trim();
    setInput('');
    const updatedMessages = [...messages, { role: 'user' as const, text: userMessage }];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...updatedMessages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
          }))
        ],
        config: {
          systemInstruction: `You are the OmiEG Steam AI Assistant. 
          Your task is to help users discover games, manage their library, and provide support for the OmiEG Steam AI Portal. 
          You are helpful, knowledgeable about gaming, and use a friendly but professional tone. 
          Talk to users as if you are part of the Steam Support team. 
          Provide game recommendations based on their interests. 
          CRITICAL: Always respond in the SAME language the user is using. You support ALL languages.`,
        }
      });

      const aiText = response.text || t.error;
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: t.connectionError
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[1000] font-sans flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-[#1b2838] border border-white/10 rounded-sm w-[calc(100vw-3rem)] sm:w-[400px] h-[500px] max-h-[60vh] sm:max-h-[500px] flex flex-col overflow-hidden mb-4 shadow-2xl"
          >
            {/* Header */}
            <div className="bg-[#171a21] border-b border-white/10 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#66c0f4] flex items-center justify-center rounded-sm">
                  <Bot size={18} className="text-[#171a21]" />
                </div>
                <span className="font-bold text-white text-sm uppercase tracking-widest">
                  {t.header}
                </span>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 no-scrollbar bg-[#171a21]/50">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={cn(
                    "max-w-[85%] p-3 rounded-sm text-[11px] leading-relaxed shadow-md",
                    msg.role === 'user' 
                    ? 'bg-[#2a475e] text-white' 
                    : 'bg-[#1b2838] text-[#c7d5e0] border border-white/5'
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-[#1b2838] p-3 rounded-sm border border-white/5">
                    <Loader2 size={14} className="animate-spin text-[#66c0f4]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-[#171a21] border-t border-white/10 flex gap-2">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading || (!isOwner && banStatus.status !== 'active')}
                placeholder={!isOwner && banStatus.status === 'timeout' 
                  ? t.placeholderTimeout 
                  : (!isOwner && (banStatus.status === 'banned') 
                      ? t.placeholderBanned 
                      : t.placeholderNormal)}
                className="flex-grow bg-[#1b2838] border border-white/5 rounded-sm px-4 py-2 text-xs focus:outline-none focus:border-[#66c0f4]/50 disabled:opacity-50 min-w-0 transition-all text-white"
              />
              <button 
                type="submit"
                disabled={isLoading || (!isOwner && banStatus.status !== 'active' && banStatus.status !== 'unbanned')}
                className="px-4 bg-[#66c0f4] text-[#171a21] rounded-sm font-bold text-xs uppercase hover:bg-[#66c0f4]/90 transition-all disabled:opacity-50"
              >
                <Send size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#66c0f4] text-[#171a21] rounded-sm flex items-center justify-center shadow-xl transition-transform border border-white/10"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </motion.button>
    </div>
  );
}
