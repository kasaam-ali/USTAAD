import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, Users, Clock, Star, 
  CheckCircle2, AlertCircle, ArrowUpRight,
  Wallet, Briefcase, Calendar, MessageCircle,
  Plus, Camera, Image as ImageIcon, X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { toast } from 'react-hot-toast';

import WorkerBot from '../components/WorkerBot';

export default function WorkerDashboard() {
  const { user, login } = useAuth();
  const { language, t } = useLanguage();
  const [isAvailable, setIsAvailable] = useState(true);
  const [portfolio, setPortfolio] = useState<{url: string, caption?: string}[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const profileInputRef = React.useRef<HTMLInputElement>(null);
  const profileCameraRef = React.useRef<HTMLInputElement>(null);
  const portfolioInputRef = React.useRef<HTMLInputElement>(null);
  const portfolioCameraRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      if (user?.id) {
        const specialists = JSON.parse(localStorage.getItem('ustaad_specialists') || '[]');
        const currentWorker = specialists.find((w: any) => w.id === user.id);
        if (currentWorker) {
          setPortfolio(currentWorker.portfolio || []);
        }
      }
    };
    fetchPortfolio();
  }, [user?.id]);

  const handlePhotoUpload = async (file: File, type: 'profile' | 'portfolio') => {
    if (!user?.id) return;
    
    if (file.size > 2 * 1024 * 1024) {
      toast.error('File too large! Max 2MB allowed.');
      return;
    }

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        const specialists = JSON.parse(localStorage.getItem('ustaad_specialists') || '[]');
        const workerIndex = specialists.findIndex((w: any) => w.id === user.id);
        
        if (workerIndex !== -1) {
          if (type === 'profile') {
            specialists[workerIndex].profilePhotoURL = base64data;
            localStorage.setItem('ustaad_specialists', JSON.stringify(specialists));
            login({ ...user, profilePhotoURL: base64data });
            toast.success('Profile photo updated!');
          } else {
            const newItem = { url: base64data, caption: 'New Work Photo' };
            specialists[workerIndex].portfolio = [...(specialists[workerIndex].portfolio || []), newItem];
            localStorage.setItem('ustaad_specialists', JSON.stringify(specialists));
            setPortfolio(prev => [...prev, newItem]);
            toast.success('Added to portfolio!');
          }
        }
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Try again.');
      setIsUploading(false);
    }
  };

  const stats = [
    { label: t('earning_label'), value: '12,500', icon: <Wallet className="text-green-500" /> },
    { label: t('bookings_label'), value: '48', icon: <Briefcase className="text-blue-500" /> },
    { label: t('rating_label'), value: '4.9', icon: <Star className="text-yellow-500 fill-yellow-500" /> },
    { label: t('reviews_label'), value: '12', icon: <MessageCircle className="text-purple-500" /> }
  ];

  return (
    <div className="pt-24 pb-32 min-h-screen" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #0F172A 100%)' }}>
      <WorkerBot />
      <div className="max-w-7xl mx-auto px-6">
        {/* Verification Banner */}
        {!user?.isVerified && (
          <div className="mb-8 p-4 flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500" style={{ background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.4)', borderRadius: '12px', color: '#FCD34D' }}>
            <div className="w-12 h-12 flex items-center justify-center" style={{ color: '#F59E0B' }}>
              <AlertCircle size={24} />
            </div>
            <div>
              <p className="font-black text-xs uppercase tracking-widest" style={{ color: '#FCD34D' }}>
                {t('verif_pending')}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                {t('verif_msg')}
              </p>
            </div>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <input 
            type="file" 
            ref={profileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0], 'profile')} 
          />
          <input 
            type="file" 
            ref={profileCameraRef} 
            className="hidden" 
            accept="image/*" 
            capture="user"
            onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0], 'profile')} 
          />
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-3xl overflow-hidden glass border-2 border-white/20 shadow-2xl">
                {isUploading ? (
                  <div className="w-full h-full flex items-center justify-center bg-white/10">
                    <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : user?.profilePhotoURL ? (
                  <img src={user.profilePhotoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-primary/20 flex items-center justify-center text-accent font-black text-3xl">
                    {user?.fullName?.charAt(0)}
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 flex gap-1">
                <button 
                  onClick={() => profileCameraRef.current?.click()}
                  className="bg-accent text-primary-deeper p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Camera size={16} />
                </button>
                <button 
                  onClick={() => profileInputRef.current?.click()}
                  className="bg-white/10 text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
                >
                  <ImageIcon size={16} />
                </button>
              </div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black mb-2 uppercase italic tracking-tighter" style={{ color: '#FFFFFF' }}>
                {t('welcome_ustaad')}
              </h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                {user?.fullName} • Master Electrician
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 glass p-2 rounded-full border-white/10 shadow-lg">
            <span className="pl-4 text-[10px] font-black uppercase tracking-widest text-white/40">
              {isAvailable ? t('available_status') : t('offline_status')}
            </span>
            <button 
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-20 h-10 rounded-full transition-all relative ${isAvailable ? 'bg-accent shadow-lg shadow-accent/20' : 'bg-white/10'}`}
            >
              <motion.div 
                className="absolute top-1 left-1 w-8 h-8 bg-white rounded-full shadow-md"
                animate={{ x: isAvailable ? 40 : 0 }}
              />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="p-6 flex flex-col justify-between h-40"
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', borderRadius: '16px' }}
            >
              <div className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10">
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1 stat-label" style={{ color: '#FFFFFF' }}>{stat.label}</p>
                <p className="text-3xl uppercase tracking-tighter stat-value" style={{ color: '#FFFFFF', fontWeight: 600 }}>{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Recent Bookings & Portfolio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 shadow-2xl flex flex-col" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', borderRadius: '24px' }}>
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-xl font-black text-white uppercase tracking-widest">{t('new_bookings')}</h2>
               <button className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline">{t('view_all')}</button>
             </div>
             
             <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="p-5 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-accent transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-accent text-lg font-black">C{i}</div>
                      <div>
                        <p className="text-sm font-black text-white">Ahmed Ali</p>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Gulshan, Karachi • AC Repair</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-white">Rs. 1,500</p>
                       <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">{t('new_label')}</p>
                    </div>
                  </div>
                ))}
             </div>
          </div>

          <div className="p-8 shadow-2xl flex flex-col" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', borderRadius: '24px' }}>
             <div className="flex justify-between items-center mb-8">
               <h2 className="text-xl font-black text-white uppercase tracking-widest">{t('workPortfolio')}</h2>
               <button className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline">{t('view_all')}</button>
             </div>
             
             <div className="grid grid-cols-3 gap-3">
                <input 
                  type="file" 
                  ref={portfolioInputRef} 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0], 'portfolio')} 
                />
                <input 
                  type="file" 
                  ref={portfolioCameraRef} 
                  className="hidden" 
                  accept="image/*" 
                  capture="environment"
                  onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0], 'portfolio')} 
                />
                {portfolio.length > 0 ? portfolio.slice(0, 5).map((item, i) => (
                  <div key={i} className="aspect-square rounded-2xl overflow-hidden glass border border-white/10 hover:scale-105 transition-transform">
                    <img src={item.url} alt={`Portfolio ${i}`} className="w-full h-full object-cover" />
                  </div>
                )) : (
                  <div className="col-span-3 flex flex-col items-center justify-center py-8 text-white/20">
                    <ImageIcon size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-center">{t('minPhotosReq')}</p>
                  </div>
                )}
                {portfolio.length < 12 && (
                  <div className="flex gap-1 h-full">
                    <button 
                      onClick={() => portfolioCameraRef.current?.click()}
                      className="flex-1 aspect-square rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-2 hover:border-accent/40 transition-all group glass"
                    >
                      <Camera size={20} className="text-white/20 group-hover:text-accent" />
                    </button>
                    <button 
                      onClick={() => portfolioInputRef.current?.click()}
                      className="flex-1 aspect-square rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-2 hover:border-accent/40 transition-all group glass"
                    >
                      <ImageIcon size={20} className="text-white/20 group-hover:text-accent" />
                    </button>
                  </div>
                )}
             </div>
             
             <p className="mt-6 text-[10px] font-bold text-white/30 uppercase tracking-widest text-center italic">
                {t('portfolioSubtitle')}
             </p>
          </div>
        </div>

        {/* Weekly Growth Chart */}
        <div className="mt-8 p-8 shadow-2xl flex flex-col" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(20px)', borderRadius: '24px' }}>
           <div className="flex justify-between items-center mb-8">
             <h2 className="text-xl font-black text-white uppercase tracking-widest">{t('weekly_growth')}</h2>
             <TrendingUp className="text-accent" />
           </div>
           <div className="flex-1 flex items-end gap-3 justify-between pt-10">
              {[40, 70, 45, 90, 65, 80, 55].map((h, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: `${h}%` }}
                  className="w-full bg-accent/20 rounded-t-xl relative group"
                >
                  <div className="absolute inset-0 bg-accent rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              ))}
           </div>
           <div className="flex justify-between mt-4 text-[8px] font-black text-white/40 uppercase tracking-widest">
              <span>{t('mon')}</span><span>{t('tue')}</span><span>{t('wed')}</span><span>{t('thu')}</span><span>{t('fri')}</span><span>{t('sat')}</span><span>{t('sun')}</span>
           </div>
        </div>
      </div>
    </div>
  );
}
