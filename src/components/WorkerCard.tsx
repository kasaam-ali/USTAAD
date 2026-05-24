import React, { useState } from 'react';
import { Star, ShieldCheck, MapPin, Briefcase, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { Worker } from '../types';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import BookingModal from './BookingModal';

interface WorkerCardProps {
  worker: Worker;
  index: number;
}

export default function WorkerCard({ worker, index }: WorkerCardProps) {
  const { t, language } = useLanguage();
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  const bgColorMap = {
    teal: 'bg-teal-500',
    coral: 'bg-orange-400',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  const bookingWorker = {
    id: worker.id,
    name: worker.name,
    category: worker.category,
    rating: worker.rating,
    initials: worker.initials,
    bgColor: worker.bgColor,
    priceRange: worker.priceRange
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ 
          scale: 1.02, 
          y: -8,
          boxShadow: "0 0 30px rgba(245, 158, 11, 0.6), 0 0 70px rgba(245, 158, 11, 0.25), 0 0 110px rgba(245, 158, 11, 0.1), 0 24px 48px rgba(0, 0, 0, 0.45)",
          borderColor: "rgba(245, 158, 11, 0.85)",
          backgroundColor: "rgba(245, 158, 11, 0.06)",
          filter: "brightness(1.1)"
        }}
        whileTap={{ scale: 0.99, y: -2 }}
        transition={{ delay: index * 0.1, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="p-8 rounded-[30px] min-w-[300px] md:min-w-0 flex flex-col group border bg-[rgba(255,255,255,0.12)] border-[rgba(255,255,255,0.20)] backdrop-blur-[20px] transition-all"
      >
        <div className="relative flex justify-between items-start mb-8">
          <div className={cn(
            "w-20 h-20 rounded-[22px] flex items-center justify-center text-white text-3xl font-black shadow-lg border-2 border-white/10 overflow-hidden",
            !worker.profilePhotoURL && (bgColorMap[worker.bgColor] || 'bg-primary')
          )}>
            {worker.profilePhotoURL ? (
              <img src={worker.profilePhotoURL} alt={worker.name} className="w-full h-full object-cover" />
            ) : (
              worker.initials
            )}
            
            {/* Availability Pulse */}
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-available rounded-full border-4 border-[#0F172A] animate-pulse shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
          </div>
          
          {worker.isVerified && (
            <div className="bg-[rgba(52,211,153,0.2)] text-[#34D399] px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-[rgba(52,211,153,0.5)]">
              <ShieldCheck size={14} /> {t('verified_label')}
            </div>
          )}
        </div>
        
        <div className="flex-grow space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-0.5">
                {worker.name}
              </h3>
              <div className="flex items-center gap-1 text-[#FCD34D]">
                <Star size={14} fill="currentColor" />
                <span className="text-xs font-black">{worker.rating}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-[rgba(37,99,235,0.3)] border border-[rgba(56,189,248,0.4)] rounded-lg text-[10px] font-black text-[#93C5FD] uppercase tracking-widest">
                {worker.category}
              </span>
              <span className="px-3 py-1 bg-[rgba(37,99,235,0.3)] border border-[rgba(56,189,248,0.4)] rounded-lg text-[10px] font-black text-[#93C5FD] uppercase tracking-widest">
                {worker.location}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pb-6 border-b border-white/10">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{language === 'urdu' ? 'قیمت' : language === 'roman' ? 'Keemat' : 'Hiring Cost'}</p>
              <p className="text-xl font-black text-[#FCD34D]">
                Rs. {worker.priceRange} <span className="text-white/30 font-medium text-xs">/ {language === 'urdu' ? 'وزٹ' : 'visit'}</span>
              </p>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">{language === 'urdu' ? 'تجربہ' : language === 'roman' ? 'Tajurba' : 'Excellence'}</p>
               <p className="text-xl font-black text-white">{worker.completedJobs}+ <span className="text-[10px] text-white/30">{language === 'urdu' ? 'کام' : 'jobs'}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              to={`/worker/${worker.id}`}
              className="btn-glass !py-3.5 !px-4 text-[10px] flex-1 text-center"
            >
              {t('view_profile')}
            </Link>
            <button 
              onClick={() => setIsBookingOpen(true)}
              className="btn-primary !py-3.5 !px-4 text-[10px] flex-1"
            >
              {t('btn_hire')}
            </button>
          </div>
        </div>
      </motion.div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        worker={bookingWorker}
      />
    </>
  );
}
