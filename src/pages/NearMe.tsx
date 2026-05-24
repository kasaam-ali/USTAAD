import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Navigation, Phone, MessageCircle, MapPin, 
  X, User, ShieldCheck, Zap, Droplets, Hammer, 
  ChevronRight, ExternalLink, Star 
} from 'lucide-react';
import { MOCK_WORKERS } from '../constants';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface NearbyWorker {
  id: string;
  name: string;
  category: string;
  rating: number;
  totalRatings: number;
  pricePerHour: number;
  priceRange: string;
  initials: string;
  bgColor: string;
  isVerified: boolean;
  location: string;
  description: string;
  experience: string;
  completedJobs: number;
  image?: string;
  x: number;
  y: number;
}

export default function NearMe() {
  const { language, t } = useLanguage();
  const [isScanning, setIsScanning] = useState(false);
  const [foundWorkers, setFoundWorkers] = useState<NearbyWorker[]>([]);
  const [selectedWorker, setSelectedWorker] = useState<NearbyWorker | null>(null);

  const startScan = () => {
    setIsScanning(true);
    setFoundWorkers([]);
    setSelectedWorker(null);

    // Simulate finding workers after some delay
    setTimeout(() => {
      // Pick 4 diverse workers
      const selectedIndices = [0, 1, 9, 14]; // Ahmed (Electrician), Saeed (Plumber), Babar (Carpenter), Rizwan (Tailor)
      const rings = [
        { min: 40, max: 80 },   // Inner Ring
        { min: 100, max: 150 }, // Middle Ring
        { min: 180, max: 230 }  // Outer Ring
      ];

      const nearby = selectedIndices.map((idx, i) => {
        const worker = MOCK_WORKERS[idx];
        const ring = rings[i % rings.length];
        
        // Random angle for each worker
        const angle = Math.random() * Math.PI * 2;
        
        // Random distance within the assigned ring
        const distance = ring.min + Math.random() * (ring.max - ring.min);
        
        return {
          ...worker,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance,
        };
      });
      setFoundWorkers(nearby);
      setIsScanning(false);
      toast.success(language === 'urdu' ? 'خوش آمدید! آپ کے پاس کچھ ماہرین ملے ہیں' : language === 'roman' ? 'Khush amdeed! Aapke paas kuch mahreen milay hain.' : 'Success! Found experts near you.');
    }, 4000);
  };

  useEffect(() => {
    // Optional: Ask for permission first
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(() => {
        startScan();
      }, () => {
        toast.error("Location permission denied. Using default area.");
        startScan();
      });
    } else {
      startScan();
    }
  }, []);

  return (
    <div className="pt-28 pb-32 min-h-screen px-6 bg-transparent relative overflow-hidden flex flex-col items-center">
      <div className="max-w-4xl w-full text-center space-y-8 mb-20 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-3 px-6 py-2.5 glass border-accent/20 text-accent rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(56,189,248,0.2)]"
        >
          <Navigation size={14} className="animate-pulse" /> {t('live_radar')}
        </motion.div>
        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter uppercase italic italic">
          {t('near_me')}
        </h1>
        <p className="text-white/60 font-medium max-w-xl mx-auto text-lg leading-relaxed uppercase tracking-widest text-xs">
          {language === 'urdu' 
            ? 'اپنے قریب موجود ماہر کاریگروں کو لائیو دیکھیں اور براہ راست رابطہ کریں۔' 
            : language === 'roman'
            ? 'Apne qareeb maujood mahreen ko live dekhein.'
            : 'Find verified professionals currently active in your neighborhood with our real-time radar.'}
        </p>
      </div>

      {/* Radar Container */}
      <div className="relative w-[380px] h-[380px] md:w-[600px] md:h-[600px] flex items-center justify-center relative z-10">
        {/* Background Rings - CYAN STYLE */}
        <div className="radar-circle w-full h-full border-accent/10" />
        <div className="radar-circle w-[75%] h-[75%] border-accent/20 shadow-[inset_0_0_50px_rgba(56,189,248,0.05)]" />
        <div className="radar-circle w-[50%] h-[50%] border-accent/30 shadow-[inset_0_0_50px_rgba(56,189,248,0.1)]" />
        <div className="radar-circle w-[25%] h-[25%] border-accent/40 shadow-[inset_0_0_30px_rgba(56,189,248,0.2)]" />
        
        {/* Axis Lines */}
        <div className="absolute w-[110%] h-[1px] bg-white/5 rotate-45" />
        <div className="absolute w-[110%] h-[1px] bg-white/5 -rotate-45" />
        <div className="absolute w-full h-[1px] bg-accent/10" />
        <div className="absolute h-full w-[1px] bg-accent/10" />

        {/* Scan Animation */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute inset-0 z-0 origin-center"
            >
              <div className="absolute top-0 left-1/2 w-1/2 h-1/2 bg-gradient-to-tr from-accent/30 to-transparent origin-bottom-left rounded-tr-full blur-[2px]" />
              <div className="absolute top-0 left-1/2 w-[3px] h-1/2 bg-accent shadow-[0_0_30px_rgba(56,189,248,0.8)]" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Center Point - USER LOCATION */}
        <div className="relative z-10">
          <div className="w-6 h-6 bg-accent rounded-full shadow-[0_0_30px_rgba(56,189,248,1)] border-2 border-white" />
          <motion.div 
            animate={{ scale: [1, 3], opacity: [0.6, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -inset-2 bg-accent/40 rounded-full blur-[4px]"
          />
          <motion.div 
            animate={{ scale: [1, 5], opacity: [0.3, 0] }}
            transition={{ repeat: Infinity, duration: 3, delay: 0.5 }}
            className="absolute -inset-4 bg-accent/20 rounded-full blur-[8px]"
          />
        </div>

        {/* Found Workers Pins */}
        {foundWorkers.map((worker, i) => (
          <motion.button
            key={worker.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: i * 0.2, type: "spring", stiffness: 200, damping: 15 }}
            onClick={() => setSelectedWorker(worker)}
            className="absolute z-20 group cursor-pointer"
            style={{ 
              left: `calc(50% + ${worker.x}px)`,
              top: `calc(50% + ${worker.y}px)`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            <div className="relative flex flex-col items-center">
              {/* Glass Circle */}
              <div className={cn(
                "relative w-14 h-14 rounded-full border-[3px] shadow-[0_15px_30px_rgba(0,0,0,0.4)] flex items-center justify-center font-black text-white group-hover:scale-125 transition-all duration-300 backdrop-blur-[10px]",
                selectedWorker?.id === worker.id ? "scale-125" : "",
                worker.bgColor === 'blue' || worker.bgColor === 'teal' ? "border-available active:border-available" : "border-busy active:border-busy",
                "bg-white/10"
              )}>
                {worker.initials}
                
                {/* Status Dot */}
                <div className={cn(
                   "absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-primary-deeper",
                   worker.bgColor === 'blue' || worker.bgColor === 'teal' ? "bg-available" : "bg-busy"
                )} />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="mt-24 relative z-10">
        {!isScanning && (
          <button 
            onClick={startScan}
            className="btn-primary !px-12 !py-6 !rounded-[40px] text-xl uppercase tracking-widest gap-4 group"
          >
            <Navigation size={24} className="group-hover:rotate-45 transition-transform" /> 
            {t('scan_btn')}
          </button>
        )}
        
        {isScanning && (
          <div className="text-center space-y-6">
            <p className="text-accent font-black animate-pulse tracking-[0.4em] uppercase text-sm">{language === 'urdu' ? 'تلاش جاری ہے' : 'Deep Scan Active'}...</p>
            <div className="w-80 h-1.5 bg-white/10 rounded-full overflow-hidden mx-auto shadow-inner">
               <motion.div 
                 initial={{ x: "-100%" }}
                 animate={{ x: "100%" }}
                 transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                 className="w-1/2 h-full bg-accent shadow-[0_0_15px_rgba(56,189,248,0.8)]"
               />
            </div>
          </div>
        )}
      </div>

      {/* Selected Worker Info Panel - REDESIGNED */}
      <AnimatePresence>
        {selectedWorker && (
          <motion.div
            initial={{ opacity: 0, y: 100, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 100, x: "-50%" }}
            className="fixed bottom-32 left-1/2 w-full max-w-md px-6 z-50"
          >
            <div className="glass p-10 bg-primary-deeper/90 backdrop-blur-[30px] border-accent/30 relative overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/20 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2" />
              
              <button 
                onClick={() => setSelectedWorker(null)}
                className="absolute top-6 right-6 p-2 bg-white/5 border border-white/10 rounded-full text-white/50 hover:text-white transition-all"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-8 mb-10 relative z-10">
                <div className={cn(
                  "w-24 h-24 rounded-[30px] flex items-center justify-center text-4xl font-black text-white shadow-2xl border-2 border-accent/40",
                  MOCK_WORKERS.find(w => w.id === selectedWorker.id)?.bgColor === 'teal' ? "bg-teal-500" : "bg-blue-500"
                )}>
                  {selectedWorker.initials}
                </div>
                <div>
                  <h3 className="text-3xl font-black text-white mb-2 uppercase italic tracking-tighter italic">{selectedWorker.name}</h3>
                  <div className="flex items-center gap-2 text-accent font-black text-[10px] uppercase tracking-widest">
                    <ShieldCheck size={16} />
                    {t('verified_label')}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => toast.success(`Calling ${selectedWorker.name}...`)}
                  className="btn-primary !py-4 text-xs tracking-widest flex items-center justify-center gap-3"
                >
                  <Phone size={18} /> {t('btn_call')}
                </button>
                <button 
                  onClick={() => toast.success(`WhatsApp Chat: ${selectedWorker.name}...`)}
                  className="bg-available/20 text-available border border-available/30 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-available/30 transition-all flex items-center justify-center gap-3"
                >
                  <MessageCircle size={18} /> WhatsApp
                </button>
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-white/10">
                <div className="text-center">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{t('rating_label')}</p>
                  <p className="font-black text-white flex items-center justify-center gap-1.5 text-lg">
                    <Star size={16} className="text-accent-gold fill-accent-gold" /> {selectedWorker.rating}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{language === 'urdu' ? 'فاصلہ' : 'Coverage'}</p>
                  <p className="font-black text-accent text-lg">0.4 km</p>
                </div>
                <div className="text-center">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">{language === 'urdu' ? 'درجہ' : 'Rank'}</p>
                  <p className="font-black text-white text-lg">#{selectedWorker.completedJobs}</p>
                </div>
              </div>

              <Link 
                to={`/worker/${selectedWorker.id}`}
                className="w-full btn-glass !mt-8 !py-4 text-xs uppercase tracking-widest"
              >
                {t('view_profile')}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
