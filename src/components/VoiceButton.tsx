import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

interface VoiceButtonProps {
  onResult: (text: string) => void;
  className?: string;
  size?: number;
}

export default function VoiceButton({ onResult, className, size = 20 }: VoiceButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const { language, t } = useLanguage();

  // Check if Web Speech API is supported
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  let recognition: any = null;
  if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = language === 'urdu' ? 'ur-PK' : 'en-US';
  }

  const startListening = () => {
    if (!recognition) {
       alert(t('speech_not_supported'));
       return;
    }
    
    setIsListening(true);
    recognition.start();

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={startListening}
        disabled={isListening}
        className={cn(
          "p-3 rounded-full transition-all relative z-10",
          isListening 
            ? "bg-red-500 text-white shadow-lg shadow-red-500/30" 
            : "text-gray-400 hover:text-accent hover:bg-white/5"
        )}
      >
        <AnimatePresence mode="wait">
          {isListening ? (
            <motion.div
              key="mic-off"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <MicOff size={size} />
            </motion.div>
          ) : (
            <motion.div
              key="mic-on"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Mic size={size} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Pulsing rings when listening */}
      <AnimatePresence>
        {isListening && (
          <>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1.5, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 bg-red-500 rounded-full z-0"
            />
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.5 }}
              className="absolute inset-0 bg-red-500 rounded-full z-0"
            />
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute -top-12 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap z-20"
            >
                {t('listening_label')}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
