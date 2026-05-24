import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Zap, MapPin, Clock, MessageCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

export default function BookingNotification() {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [hasNew, setHasNew] = useState(true);
  const [showRejectReasons, setShowRejectReasons] = useState(false);

  const handleAccept = () => {
    setShowSuccess(true);
    setHasNew(false);
    setTimeout(() => {
      setShowSuccess(false);
      setIsOpen(false);
    }, 3000);
  };

  const handleRejectAction = () => {
    setHasNew(false);
    setIsOpen(false);
    setShowRejectReasons(false);
  };

  const rejectReasons = [
    t('notif_reject_busy'),
    t('notif_reject_far'),
    t('notif_reject_unskilled'),
    t('notif_reject_other')
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        title={t('notif_bell_tooltip')}
        className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all relative"
      >
        <Bell size={20} />
        {hasNew && (
          <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-accent rounded-full border-2 border-[#0F172A] animate-pulse" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full right-0 mt-3 w-[320px] bg-[#0F172A]/98 backdrop-blur-[20px] border border-white/20 rounded-[24px] p-2 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {showSuccess ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 text-center"
              >
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-500/20">
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <h3 className="text-lg font-black text-white uppercase italic tracking-tighter mb-2">{t('notif_success')}</h3>
                <button className="w-full py-3 bg-[#25D366] text-white rounded-xl font-black text-xs flex items-center justify-center gap-2 mt-4">
                  <MessageCircle size={16} fill="currentColor" />
                  {t('notif_whatsapp')}
                </button>
              </motion.div>
            ) : hasNew ? (
              <div className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-accent">{t('notif_title')}</span>
                  </div>
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-widest">{t('notif_time_ago')}</span>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                      <Zap size={20} fill="currentColor" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-white uppercase italic tracking-tight">{t('notif_problem')}</h4>
                      <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Ahmed Ali • Rs. 1,500</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/60">
                      <MapPin size={12} className="text-accent" />
                      <span className="uppercase tracking-widest">{t('notif_location')}: Gulshan, Karachi</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-white/60">
                      <Clock size={12} className="text-accent" />
                      <span className="uppercase tracking-widest">{t('notif_time')}: 10:30 AM</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={handleAccept}
                    className="py-3 bg-accent text-primary rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg shadow-accent/20"
                  >
                    {t('notif_accept')}
                  </button>
                  <button 
                    onClick={() => setShowRejectReasons(!showRejectReasons)}
                    className="py-3 bg-white/5 border border-white/10 text-white/60 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    {t('notif_reject')}
                  </button>
                </div>

                {showRejectReasons && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-2"
                  >
                    {rejectReasons.map((reason, idx) => (
                      <button
                        key={idx}
                        onClick={handleRejectAction}
                        className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-[10px] font-bold uppercase tracking-widest transition-all"
                      >
                        {reason}
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center bg-white/5 rounded-[20px]">
                <p className="text-[10px] font-black uppercase tracking-widest text-white/40">No new notifications</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
