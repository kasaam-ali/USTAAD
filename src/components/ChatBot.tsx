import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Sparkles, Mic, MessageCircle, Star } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import VoiceButton from './VoiceButton';
import { Link } from 'react-router-dom';
import { MOCK_WORKERS } from '../constants';
import { Worker } from '../types';

interface Message {
  id: string;
  type: 'bot' | 'user';
  text: string;
  isQuickReply?: boolean;
  workers?: Worker[];
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { language } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getGreeting = () => {
    if (language === 'urdu') return "اسلام علیکم! آپ کو کس کام کی ضرورت ہے؟";
    if (language === 'roman') return "Assalam o Alaikum! Aap ko kis kaam ki zaroorat hai?";
    return "Hello! What service do you need today?";
  };

  const getQuickReplies = () => {
    if (language === 'urdu') return ['بجلی', 'پلمبر', 'درزی', 'بڑھئی', 'رنگ ساز', 'دیگر'];
    if (language === 'roman') return ['Bijli', 'Plumber', 'Darzi', 'Barhahi', 'Rang Saaz', 'Kuch Aur'];
    return ['Electrician', 'Plumber', 'Tailor', 'Carpenter', 'Painter', 'Other'];
  };

  useEffect(() => {
    if (isOpen) {
      if (messages.length === 0) {
        setMessages([
          {
            id: '1',
            type: 'bot',
            text: getGreeting(),
            isQuickReply: true
          }
        ]);
      } else if (messages.length === 1 && messages[0].id === '1') {
        // If only the greeting exists, update it when language changes
        setMessages([
          {
            id: '1',
            type: 'bot',
            text: getGreeting(),
            isQuickReply: true
          }
        ]);
      }
    }
  }, [isOpen, language]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), type: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');

    // Simulate Bot Response
    setTimeout(() => {
      let reply = "";
      let foundWorkers: Worker[] | undefined = undefined;

      const lowerText = text.toLowerCase();
      let categoryId = "";
      
      // Map common terms to categories
      if (lowerText.includes('electric') || lowerText.includes('bijli') || lowerText.includes('بجلی')) categoryId = 'electrician';
      else if (lowerText.includes('plumb') || lowerText.includes('پلمبر') || lowerText.includes('pani')) categoryId = 'plumber';
      else if (lowerText.includes('tailor') || lowerText.includes('darzi') || lowerText.includes('درزی') || lowerText.includes('silai')) categoryId = 'tailor';
      else if (lowerText.includes('carpenter') || lowerText.includes('barhahi') || lowerText.includes('بڑھئی') || lowerText.includes('lakri')) categoryId = 'carpenter';
      else if (lowerText.includes('paint') || lowerText.includes('rang') || lowerText.includes('رنگ')) categoryId = 'painter';
      else if (lowerText.includes('ac') || lowerText.includes('اے سی')) categoryId = 'ac-tech';

      if (categoryId) {
        foundWorkers = MOCK_WORKERS.filter(w => w.category === categoryId).slice(0, 3);
      }

      if (language === 'urdu') {
        reply = `جی ضرور، میں آپ کے لیے بہترین ${text} تلاش کر رہا ہوں۔ ایک لمحہ رکیں...`;
      } else if (language === 'roman') {
        reply = `Ji bilkul, main aap ke liye behtareen ${text} talash kar raha hoon. Ek lamha rukien...`;
      } else {
        reply = `Sure, I am looking for the best ${text} for you. Just a moment...`;
      }

      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        type: 'bot', 
        text: reply,
        workers: foundWorkers
      };
      setMessages(prev => [...prev, botMsg]);

      // If workers found, send follow up
      if (foundWorkers && foundWorkers.length > 0) {
        setTimeout(() => {
          let followUp = "";
          if (language === 'urdu') {
            followUp = "یہ رہے آپ کے قریب ترین بہترین ہنرمند۔ مزید دیکھنے کے لیے پروفائل پر کلک کریں یا براہِ راست بکنگ کریں!";
          } else if (language === 'roman') {
            followUp = "Yeh rahe aap ke qareeb tareen behtareen workers. Tap karke profile dekhen ya direct book karen!";
          } else {
            followUp = "Here are the best available workers near you. Tap to view their profile or book directly!";
          }
          setMessages(prev => [...prev, {
            id: (Date.now() + 2).toString(),
            type: 'bot',
            text: followUp
          }]);
        }, 1200);
      }
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-[350px] h-[450px] bg-[#0F172A] rounded-[20px] shadow-2xl border border-white/15 overflow-hidden flex flex-col shadow-blue-500/10"
          >
            {/* Header */}
            <div className="bg-[#2563EB] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className={cn(
                    "font-bold text-base leading-tight",
                    language === 'urdu' && "font-['Noto_Nastaliq_Urdu'] text-right"
                  )}>
                    {language === 'urdu' ? 'استاد بھائی' : 'Ustaad Bhai'}
                  </h3>
                  <p className={cn(
                    "text-[10px] uppercase tracking-widest opacity-80",
                    language === 'urdu' && "font-['Noto_Nastaliq_Urdu'] text-right mt-1"
                  )}>
                    {language === 'urdu' ? 'ہر وقت حاضر' : 'Always Online'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div 
              ref={scrollRef}
              className={cn(
                "flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-[#0F172A]",
                language === 'urdu' ? "text-right" : "text-left"
              )}
              dir={language === 'urdu' ? 'rtl' : 'ltr'}
            >
              {messages.map((msg) => (
                <div key={msg.id} className="w-full flex flex-col items-start gap-2">
                  <div className={cn(
                    "max-w-[80%] p-3 rounded-[12px] text-sm",
                    msg.type === 'user' 
                      ? "bg-[#2563EB] text-white self-end" 
                      : "bg-white/12 text-white self-start",
                    language === 'urdu' && "font-['Noto_Nastaliq_Urdu'] text-[15px] leading-[1.8]"
                  )}>
                    {msg.text}
                  </div>

                  {msg.isQuickReply && (
                    <div className="flex flex-wrap gap-2 mt-1">
                      {getQuickReplies().map(reply => (
                        <button
                          key={reply}
                          onClick={() => handleSend(reply)}
                          className={cn(
                            "px-3.5 py-1.5 bg-[#2563EB]/30 border border-[#38BDF8]/40 text-[#93C5FD] rounded-full text-xs font-medium hover:bg-[#2563EB]/50 transition-all cursor-pointer",
                            language === 'urdu' && "font-['Noto_Nastaliq_Urdu'] text-[13px] pt-2"
                          )}
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  )}

                  {msg.workers && (
                    <div className="mt-2 space-y-3 w-full">
                      {msg.workers.map((worker) => (
                        <div key={worker.id} className="bg-white/8 border border-white/15 rounded-xl p-3 flex flex-col gap-3">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0",
                              worker.bgColor === 'blue' ? 'bg-blue-500' :
                              worker.bgColor === 'teal' ? 'bg-teal-500' :
                              worker.bgColor === 'coral' ? 'bg-coral-500' :
                              worker.bgColor === 'purple' ? 'bg-purple-500' : 'bg-orange-500'
                            )}>
                              {worker.initials}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-bold text-sm truncate">{worker.name}</h4>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={cn(
                                  "text-[10px] bg-white/10 text-white/70 px-2 py-0.5 rounded-full uppercase tracking-tighter font-bold truncate",
                                  language === 'urdu' && "font-sans" // Use sans for category name if it's English
                                )}>
                                  {worker.category} • {worker.location}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-500/20 px-1.5 py-0.5 rounded text-yellow-500 text-[10px] font-bold shrink-0">
                              <Star size={10} fill="currentColor" />
                              {worker.rating}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-2">
                            <div className="text-white/60 text-[11px] font-bold uppercase tracking-wider shrink-0">
                              Rs. {worker.priceRange || '500+'}
                            </div>
                            <div className="flex gap-2 shrink-0">
                              <Link 
                                to={`/worker/${worker.id}`}
                                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold rounded-lg transition-all"
                              >
                                {language === 'urdu' ? 'پروفائل' : language === 'roman' ? 'Profile' : 'Profile'}
                              </Link>
                              <Link 
                                to={`/worker/${worker.id}`}
                                className="px-3 py-1.5 bg-[#2563EB] hover:bg-blue-600 text-white text-[10px] font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all whitespace-nowrap"
                              >
                                {language === 'urdu' ? 'بک کریں' : language === 'roman' ? 'Book Now' : 'Book Now'}
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Input Area */}
            <div className="p-3 bg-[#1E3A8A] flex items-center gap-2 relative">
              <VoiceButton 
                onResult={(text) => setInputValue(text)}
                className="bg-white/10 text-white rounded-full w-9 h-9 flex items-center justify-center hover:bg-white/20 transition-all ring-0 border-0 flex-shrink-0"
                size={18}
              />
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
                placeholder={language === 'urdu' ? "پیغام لکھیں..." : "Type your message..."}
                dir={language === 'urdu' ? 'rtl' : 'ltr'}
                className={cn(
                  "flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-[#2563EB] transition-all min-w-0",
                  language === 'urdu' && "font-['Noto_Nastaliq_Urdu'] !text-[14px] text-right"
                )}
              />
              <button 
                onClick={() => handleSend(inputValue)}
                className="w-9 h-9 min-w-[36px] min-h-[36px] bg-[#2563EB] text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer !opacity-100 !visible !flex"
                title="Send"
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#2563EB] rounded-full shadow-2xl flex items-center justify-center text-white cursor-pointer relative z-[101]"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X size={28} />
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
              <MessageCircle size={28} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

