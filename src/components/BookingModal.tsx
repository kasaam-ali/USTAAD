import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mic, Calendar, Clock, MapPin, Zap, CheckCircle2, MessageCircle, Home, Loader2, Star, ShieldCheck } from 'lucide-react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import VoiceButton from './VoiceButton';

interface Worker {
  id: string;
  name: string;
  category: string;
  rating: number;
  initials: string;
  bgColor: string;
  priceRange: string;
}

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  worker: Worker;
}

const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose, worker }) => {
  const { language, t } = useLanguage();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    description: '',
    date: '',
    time: 'morning',
    address: ''
  });

  const bgColorMap: Record<string, string> = {
    blue: 'bg-blue-600',
    purple: 'bg-purple-600',
    orange: 'bg-orange-600',
    emerald: 'bg-emerald-600',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setStep('success');
    }, 1500);
  };

  const openWhatsApp = () => {
    const message = `Assalam o Alaikum! Maine Ustaad app pe aapko book kiya hai. Mera naam ${formData.name} hai. Kaam: ${formData.description}. Date: ${formData.date}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/923001234567?text=${encodedMessage}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
          {/* Overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm shadow-[0_0_100px_rgba(0,0,0,1)]"
          />

          {/* Modal Card */}
          <motion.div
            initial={window.innerWidth < 768 ? { y: "100%" } : { opacity: 0, scale: 0.9, y: 20 }}
            animate={window.innerWidth < 768 ? { y: 0 } : { opacity: 1, scale: 1, y: 0 }}
            exit={window.innerWidth < 768 ? { y: "100%" } : { opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={cn(
              "relative w-full max-w-[500px] bg-[#0F172A]/98 backdrop-blur-[32px] border border-white/15 shadow-2xl overflow-hidden flex flex-col max-h-[95vh] z-20",
              "md:rounded-[32px] rounded-t-[32px] md:m-4"
            )}
          >
            {/* Handle Bar for Mobile */}
            <div className="md:hidden w-12 h-1.5 bg-white/10 rounded-full mx-auto mt-4 mb-2" />

            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-30 w-10 h-10 rounded-full glass flex items-center justify-center text-white/50 hover:text-white transition-all hover:bg-white/10 hover:shadow-[0_0_20px_rgba(245,158,11,0.4)]"
            >
              <X size={20} />
            </button>

          <div className="overflow-y-auto p-8 scrollbar-hide">
            {step === 'form' ? (
              <>
                {/* Worker Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className={cn(
                    "w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg",
                    bgColorMap[worker.bgColor] || 'bg-primary'
                  )}>
                    {worker.initials}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 mb-1">
                       <h3 className="text-xl font-bold text-white uppercase tracking-tight italic">{worker.name}</h3>
                       <ShieldCheck size={16} className="text-available" />
                    </div>
                    <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black bg-accent/20 text-accent px-2 py-0.5 rounded-md uppercase tracking-widest">{worker.category}</span>
                       <div className="flex items-center gap-1 text-[#FCD34D]">
                         <Star size={12} fill="currentColor" />
                         <span className="text-xs font-bold">{worker.rating}</span>
                       </div>
                    </div>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-2 italic">
                       {t('booking_request_msg')}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{t('your_name')}</label>
                    <input 
                      required
                      type="text" 
                      placeholder={t('name_placeholder')}
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] px-4 py-3 text-white placeholder:text-white/20 focus:ring-2 focus:ring-accent/50 outline-none transition-all text-sm font-medium"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{t('phone_number')}</label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold text-sm border-r border-white/10 pr-3">+92</div>
                      <input 
                        required
                        type="tel" 
                        pattern="[0-3][0-9]{9}"
                        placeholder={t('phone_placeholder')}
                        value={formData.phone}
                        onChange={e => setFormData({...formData, phone: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-[12px] pl-16 pr-4 py-3 text-white placeholder:text-white/20 focus:ring-2 focus:ring-accent/50 outline-none transition-all text-sm font-medium tracking-widest"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{t('how_title')} / {t('problem_desc')}</label>
                    <div className="relative">
                      <textarea 
                        required
                        rows={3}
                        placeholder={t('problem_placeholder')}
                        value={formData.description}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-[12px] px-4 py-3 text-white placeholder:text-white/20 focus:ring-2 focus:ring-accent/50 outline-none transition-all text-sm font-medium resize-none"
                      />
                      <div className="absolute bottom-3 right-3 scale-75">
                         <VoiceButton onResult={(text) => setFormData({...formData, description: text})} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Date */}
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{t('when_needed')}</label>
                      <input 
                        required
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-[12px] px-4 py-3 text-white placeholder:text-white/20 focus:ring-2 focus:ring-accent/50 outline-none transition-all text-xs font-bold"
                      />
                    </div>

                    {/* Address Small */}
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{t('area_city')}</label>
                      <input 
                        required
                        placeholder="e.g. DHA, Karachi"
                        className="w-full bg-white/5 border border-white/10 rounded-[12px] px-4 py-3 text-white placeholder:text-white/20 focus:ring-2 focus:ring-accent/50 outline-none transition-all text-xs font-bold"
                      />
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-3 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{t('time_pref')}</label>
                    <div className="flex gap-2">
                       {[
                         { id: 'morning', label: t('morning'), time: '8am-12pm' },
                         { id: 'afternoon', label: t('afternoon'), time: '12pm-5pm' },
                         { id: 'evening', label: t('evening'), time: '5pm-9pm' }
                       ].map(t => (
                         <button 
                           key={t.id}
                           type="button"
                           onClick={() => setFormData({...formData, time: t.id})}
                           className={cn(
                             "flex-1 py-3 rounded-xl flex flex-col items-center border transition-all cursor-pointer",
                             formData.time === t.id 
                               ? "bg-gradient-to-br from-blue-600 to-blue-400 border-transparent shadow-lg shadow-blue-500/20 scale-105 z-10" 
                               : "bg-white/5 border-white/10 hover:border-accent text-white/60"
                           )}
                         >
                           <span className="text-[10px] font-black uppercase tracking-tighter mb-0.5">{t.label}</span>
                           <span className="text-[8px] font-bold opacity-60 uppercase tracking-widest">{t.time}</span>
                         </button>
                       ))}
                    </div>
                  </div>

                  {/* Address */}
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">{t('full_address')}</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 text-accent" size={16} />
                      <textarea 
                        required
                        rows={2}
                        placeholder={t('address_placeholder')}
                        value={formData.address}
                        onChange={e => setFormData({...formData, address: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-[12px] pl-12 pr-4 py-3 text-white placeholder:text-white/20 focus:ring-2 focus:ring-accent/50 outline-none transition-all text-sm font-medium resize-none"
                      />
                    </div>
                  </div>

                  {/* AI Estimate */}
                  <div className="bg-golden/10 border border-golden/30 rounded-[12px] p-4 flex items-center gap-4">
                    <div className="w-10 h-10 bg-golden/20 rounded-xl flex items-center justify-center text-golden">
                      <Zap size={20} fill="currentColor" />
                    </div>
                    <div className="text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#FCD34D]">{t('ai_andaza')}</p>
                      <p className="text-lg font-black text-white">Rs. 800 — 1,500</p>
                      <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest">{t('final_price_notice')}</p>
                    </div>
                  </div>

                  {/* Submit */}
                  <button 
                    disabled={loading}
                    type="submit"
                    className="btn-primary w-full !py-4 !rounded-[14px] !shadow-none hover:!shadow-[0_0_25px_rgba(245,158,11,0.6),0_0_50px_rgba(245,158,11,0.2)]"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : (
                      <>
                        <CheckCircle2 size={18} />
                        {t('btn_send_booking')}
                      </>
                    )}
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col items-center text-center py-10">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", damping: 12, stiffness: 200 }}
                  className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(34,197,94,0.5)] mb-8"
                >
                  <CheckCircle2 size={50} className="text-white" />
                </motion.div>
                
                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">{t('booking_success')}</h2>
                <p className="text-white/60 font-medium mb-10 max-w-[280px]">
                  {t('success_msg')}
                </p>

                <div className="w-full space-y-4">
                   <button 
                    onClick={openWhatsApp}
                    className="w-full py-5 bg-[#25D366] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:scale-105 transition-all shadow-xl shadow-green-500/20"
                   >
                     <MessageCircle size={20} fill="currentColor" />
                     {t('btn_whatsapp')}
                   </button>
                   
                   <button 
                    onClick={onClose}
                    className="w-full py-5 glass text-white rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:border-accent transition-all"
                   >
                     <Home size={18} />
                     {t('btn_go_home')}
                   </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};

export default BookingModal;
