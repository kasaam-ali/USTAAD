import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Mic, Bot, Sparkles, Volume2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import VoiceButton from './VoiceButton';

export default function WorkerBot() {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'bot', content: string }[]>([
    { role: 'bot', content: t('worker_bot_greeting') }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Sync initial message when language changes
  useEffect(() => {
    if (messages.length === 1 && messages[0].role === 'bot') {
       setMessages([{ role: 'bot', content: t('worker_bot_greeting') }]);
    }
  }, [language]);

  const speak = (text: string, index: number) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (isSpeaking === index) {
      setIsSpeaking(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Function to set voice
    const setVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      const urduVoice = voices.find(v => v.lang.includes('ur') || v.lang.includes('hi'));
      if (urduVoice) utterance.voice = urduVoice;
      else {
        // Fallback to any localized voice that sounds similar
        const secondary = voices.find(v => v.lang.includes('hi'));
        if (secondary) utterance.voice = secondary;
      }
    };

    // Attempt to find an Urdu or Hindi voice for natural sounding speech
    setVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = setVoice;
    }
    
    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onstart = () => setIsSpeaking(index);
    utterance.onend = () => setIsSpeaking(null);
    utterance.onerror = () => setIsSpeaking(null);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Auto-speak new bot messages
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage && lastMessage.role === 'bot' && isOpen) {
      speak(lastMessage.content, messages.length - 1);
    }
  }, [messages.length, isOpen]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setIsTyping(true);

    // Simulate a small delay for the bot response
    setTimeout(() => {
      let response = "";
      
      const lowerMsg = userMsg.toLowerCase();
      if (lowerMsg.includes('earning') || lowerMsg.includes('kamai')) {
        response = language === 'urdu' ? "اپنی کمائی دیکھنے کے لیے ارننگز ٹیب چیک کریں۔" : "Earnings tab check karein apni kamai dekhne ke liye.";
      } else if (lowerMsg.includes('booking') || lowerMsg.includes('kaam')) {
        response = language === 'urdu' ? "اپنے کام دیکھنے کے لیے بکنگز ٹیب دیکھیں۔" : "Bookings tab mein apna sara kaam dekhein.";
      } else {
        response = language === 'urdu' ? "آپ کا شکریہ! میں ابھی آپ کی مدد نہیں کر سکتا، براہ کرم ہیلپ سینٹر سے رابطہ کریں۔" : "Shukriya! Main abhi aapki mazeed madad nahi kar sakta, baraye meherbani help center se rabta karein.";
      }

      setMessages(prev => [...prev, { role: 'bot', content: response }]);
      setIsTyping(false);
    }, 1000);
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-accent text-primary rounded-full shadow-2xl shadow-accent/40 flex items-center justify-center group hover:scale-110 transition-all z-40 border-4 border-white dark:border-slate-900"
      >
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white text-[8px] font-black rounded-full flex items-center justify-center animate-bounce">1</div>
        <MessageSquare size={28} className="group-hover:rotate-12 transition-transform" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.8 }}
            className="fixed bottom-6 right-6 left-6 md:left-auto md:w-96 h-[500px] bg-slate-900 rounded-[3rem] shadow-2xl border border-white/5 flex flex-col overflow-hidden z-50 origin-bottom-right"
          >
            {/* Header */}
            <div className="p-6 bg-[#2563EB] text-[#FFFFFF] flex justify-between items-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Bot size={80} />
               </div>
               <div className="flex items-center gap-3 relative z-10">
                  <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center text-primary">
                     <Sparkles size={20} />
                  </div>
                  <div>
                    <h3 className="font-black italic uppercase tracking-tighter text-lg leading-none">Madadgaar Bot</h3>
                    <p className="text-[8px] font-black uppercase tracking-widest text-white flex items-center gap-1">
                       <span className="w-1 h-1 rounded-full bg-accent animate-pulse" /> Online
                    </p>
                  </div>
               </div>
               <button onClick={() => setIsOpen(false)} className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition-all relative z-10">
                  <X size={20} />
               </button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950 text-[#FFFFFF]">
               {messages.map((msg, i) => (
                 <motion.div 
                   key={i}
                   initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className={cn(
                     "flex flex-col gap-1 max-w-[85%]",
                     msg.role === 'user' ? "ml-auto items-end" : "items-start"
                   )}
                 >
                    <div className={cn(
                      "p-4 rounded-2xl leading-relaxed",
                      language === 'urdu' ? "text-[15px] !leading-[1.8] font-medium" : "text-[13px] font-bold",
                      language === 'urdu' && "font-['Noto_Nastaliq_Urdu']",
                      msg.role === 'user' 
                        ? "bg-[#2563EB] text-[#FFFFFF] rounded-tr-none shadow-lg shadow-blue-500/20" 
                        : "bg-white/15 text-[#FFFFFF] rounded-tl-none border border-white/10 backdrop-blur-md"
                    )}>
                       {msg.content}
                    </div>
                    {msg.role === 'bot' && (
                       <button 
                         onClick={() => speak(msg.content, i)}
                         className={cn(
                           "text-[10px] font-black uppercase flex items-center gap-1 mt-1 transition-all",
                           language === 'urdu' && "text-xs !leading-none",
                           isSpeaking === i ? "text-white animate-pulse scale-110" : "text-white/60 hover:text-white"
                         )}
                       >
                          <Volume2 size={10} className={isSpeaking === i ? "animate-bounce" : ""} /> 
                          {isSpeaking === i ? t('speaking_label') : t('listen_label')}
                       </button>
                    )}
                 </motion.div>
               ))}
               {isTyping && (
                 <div className="flex gap-2 p-4 bg-white/15 rounded-2xl rounded-tl-none w-20 items-center justify-center border border-white/10 backdrop-blur-md">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce" />
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce [animation-delay:0.4s]" />
                 </div>
               )}
            </div>

            {/* Input */}
            <div className="p-6 bg-slate-900 border-t border-white/5">
               <div className="relative flex items-center gap-2">
                  <input 
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t('ask_something')}
                    className={cn(
                      "flex-1 min-w-0 pl-6 pr-6 py-4 rounded-2xl font-bold bg-[#FFFFFF] text-[#000000] placeholder-gray-400 outline-none focus:ring-2 focus:ring-[#2563EB] border border-gray-200 shadow-inner",
                      language === 'urdu' && "font-['Noto_Nastaliq_Urdu'] text-[15px]"
                    )}
                  />
                  <div className="flex gap-1 flex-shrink-0">
                    <VoiceButton 
                      onResult={(text) => setInput(text)}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    />
                    <button 
                      onClick={handleSend}
                      className="p-3 bg-[#2563EB] text-white rounded-xl shadow-lg shadow-blue-500/20 hover:scale-105 active:scale-95 transition-all opacity-100 !flex items-center justify-center cursor-pointer"
                    >
                      <Send size={20} />
                    </button>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
