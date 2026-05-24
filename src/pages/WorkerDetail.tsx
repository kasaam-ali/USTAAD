import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Star, MapPin, ShieldCheck, Clock, ArrowLeft,
  Calendar, CheckCircle2, Languages, 
  Sparkles, Send, Globe, Camera, MessageCircle, ChevronRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { MOCK_WORKERS } from '../constants';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import VoiceButton from '../components/VoiceButton';
import BookingModal from '../components/BookingModal';

type TabType = 'about' | 'reviews' | 'photos';

export default function WorkerDetail() {
  const { id } = useParams();
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('about');
  const [aiInput, setAiInput] = useState('');
  const [isEstimating, setIsEstimating] = useState(false);
  const [translationResult, setTranslationResult] = useState<null | { title: string, problem: string, urgency: string, time: string }>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorker = async () => {
      setLoading(true);
      // First check mock
      const mock = MOCK_WORKERS.find(w => w.id === id);
      if (mock) {
        setWorker(mock);
        setLoading(false);
        return;
      }

      // If not in mock, check localStorage
      try {
        if (id) {
          const specialists = JSON.parse(localStorage.getItem('ustaad_specialists') || '[]');
          const currentWorker = specialists.find((w: any) => w.id === id);
          if (currentWorker) {
            setWorker(currentWorker);
          }
        }
      } catch (error) {
        console.error("Error fetching worker:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchWorker();
  }, [id]);

  const bgColorMap = {
    teal: 'bg-teal-500',
    coral: 'bg-orange-400',
    blue: 'bg-blue-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
  };

  if (loading) {
    return (
      <div className="pt-32 min-h-screen px-6 text-center">
        <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 font-black uppercase tracking-widest">Loading Specialist...</p>
      </div>
    );
  }

  if (!worker) {
    return (
      <div className="pt-32 min-h-screen px-6 text-center">
        <h1 className="text-3xl font-bold mb-4 text-white">{t('worker_not_found')}</h1>
        <Link to="/" className="text-accent underline">{t('back_home')}</Link>
      </div>
    );
  }

  const bookingWorker = {
    id: worker.id,
    name: worker.name || worker.fullName,
    category: worker.category || worker.trade,
    rating: worker.rating || 5.0,
    initials: worker.initials || (worker.fullName ? worker.fullName.charAt(0) : 'U'),
    bgColor: worker.bgColor || 'teal',
    priceRange: worker.priceRange || `${worker.minCharge || 500} - ${worker.hourlyRate || 1000}`
  };

  const handleAiTranslate = () => {
    if (!aiInput.trim()) return;
    setIsEstimating(true);
    setTranslationResult(null);
    
    // Simulate AI thinking
    setTimeout(() => {
      setIsEstimating(false);
      // Simulate translation logic based on input
      const input = aiInput.toLowerCase();
      let title = language === 'urdu' ? 'مرمت کی درخواست' : language === 'roman' ? 'Maramat ki request' : 'Repair Request — General';
      let problem = aiInput;
      let urgency = language === 'urdu' ? 'عام' : language === 'roman' ? 'Normal' : 'Medium';
      let time = '1–3 hours';

      if (input.includes('pan') || input.includes('leak') || input.includes('nala')) {
        title = language === 'urdu' ? 'پلمبنگ کا مسئلہ — ارجنٹ' : language === 'roman' ? 'Plumbing masla — Urgent' : 'Drain Blockage — Urgent';
        urgency = language === 'urdu' ? 'بہت زیادہ' : language === 'roman' ? 'Ziada' : 'High';
        time = '1–2 hours';
      } else if (input.includes('light') || input.includes('current') || input.includes('short')) {
        title = language === 'urdu' ? 'بجلی کا شاٹ — ارجنٹ' : language === 'roman' ? 'Bijli ka shot — Urgent' : 'Electrical Short Circuit — Urgent';
        urgency = language === 'urdu' ? 'بہت زیادہ' : language === 'roman' ? 'Ziada' : 'High';
        time = '2–3 hours';
      }

      setTranslationResult({ title, problem, urgency, time });
    }, 1500);
  };

  const reviews = [
    { id: 1, user: 'Ali R.', rating: 5, date: '2 days ago', text: language === 'urdu' ? 'بہت اچھا کام گیا! بہت پیشہ ور اور وقت کا پابند۔' : language === 'roman' ? 'Bohat acha kaam kiya! Professional banda hai.' : 'Zabardast kaam! Very professional and punctual.' },
    { id: 2, user: 'Sara K.', rating: 4, date: '1 week ago', text: language === 'urdu' ? 'اچھی سروس، وائرنگ کے مسائل جلدی حل ہو گئے۔' : language === 'roman' ? 'Achi service, masla jaldi hal ho gaya.' : 'Good service, fixed the wiring issues quickly.' },
    { id: 3, user: 'Umar J.', rating: 5, date: '2 weeks ago', text: language === 'urdu' ? 'گھریلو دیکھ بھال کے لیے انتہائی سفارش کی جاتی ہے۔' : language === 'roman' ? 'Highly recommended for home maintenance.' : 'Highly recommended for home maintenance.' },
  ];

  const photos = [
    'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=400&h=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?q=80&w=400&h=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=400&h=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1595841696677-6489ff3f8cd1?q=80&w=400&h=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1517646287270-a5a9ca602e5c?q=80&w=400&h=400&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1504148455328-c376907d081c?q=80&w=400&h=400&auto=format&fit=crop',
  ];

  return (
    <div className="pt-28 min-h-screen px-4 md:px-6 pb-20 bg-transparent">
      <div className="max-w-7xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-accent font-bold mb-8 hover:opacity-70">
          <ArrowLeft size={16} /> {t('back_to_home')}
        </Link>
        
        {/* TOP SECTION */}
        <div className="glass p-6 md:p-10 rounded-[2.5rem] mb-10 overflow-hidden relative shadow-2xl border-white/20">
          <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
            <Sparkles size={200} />
          </div>
          
          <div className="flex flex-col lg:flex-row gap-10 items-center lg:items-start relative z-10">
            {/* Avatar & Verified */}
            <div className="relative shrink-0">
               <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className={cn(
                  "w-48 h-48 rounded-[2.5rem] flex items-center justify-center text-white text-6xl font-bold shadow-2xl border-4 border-white/10 overflow-hidden",
                  !worker.profilePhotoURL && (bgColorMap[worker.bgColor] || 'bg-primary')
                )}
              >
                {worker.profilePhotoURL ? (
                  <img src={worker.profilePhotoURL} alt={worker.name} className="w-full h-full object-cover" />
                ) : (
                  worker.initials || (worker.fullName ? worker.fullName.charAt(0) : 'U')
                )}
              </motion.div>
              {worker.isVerified && (
                <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-bold border-4 border-[#0F172A] flex items-center gap-2">
                  <ShieldCheck size={14} />
                  {t('verified_label')}
                </div>
              )}
            </div>

            <div className="flex-1 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <h1 className={cn(
                    "font-bold text-white mb-2",
                    language === 'urdu' ? "text-5xl" : "text-4xl"
                  )}>
                    {worker.fullName || worker.name}
                  </h1>
                  <p className="text-lg text-accent font-bold uppercase tracking-widest flex items-center justify-center lg:justify-start gap-3">
                    {worker.trade || worker.category} {t('specialist_label')} · {worker.city || worker.location}
                  </p>
                </div>
                
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-2xl border border-emerald-200 dark:border-emerald-800/50">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-sm font-bold uppercase tracking-wider">{t('avail_today')}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 mt-8">
                <div className="flex items-center gap-1.5 text-yellow-500 font-bold text-xl">
                  <Star fill="currentColor" />
                  <span>{worker.rating}</span>
                  <span className="text-white/40 text-sm font-medium ml-1">({worker.totalRatings} {t('rating_label')})</span>
                </div>
                <div className="h-8 w-px bg-white/10 hidden sm:block" />
                <div className="flex items-center gap-2 text-white/60 font-bold">
                  <Clock size={20} />
                  <span>{worker.experience} {t('experience')}</span>
                </div>
                <div className="h-8 w-px bg-white/10 hidden sm:block" />
                <div className="flex items-center gap-2 text-accent font-black italic uppercase tracking-tighter">
                  <span className="text-[10px] text-white/40 not-italic uppercase tracking-widest mr-1">{t('price_label')}:</span>
                  {worker.priceRange?.includes('Rs.') ? worker.priceRange : `Rs. ${worker.priceRange || worker.minCharge || 500}+`}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-10">
                <button 
                  onClick={() => setIsBookingOpen(true)}
                  className="flex-[2] btn-primary py-4 text-xl shadow-xl shadow-primary/20 italic uppercase font-black"
                >
                  <Calendar size={22} />
                  {t('btn_book')}
                </button>
                <div className="flex flex-1 gap-2">
                  <a 
                    href={`tel:${worker.phone || '03001234567'}`}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-primary/20 text-white rounded-2xl font-bold hover:bg-primary/30 transition-all border border-white/5"
                  >
                    <Send size={20} className="rotate-45 text-accent" />
                    {t('call_btn')}
                  </a>
                  <a 
                    href={`https://wa.me/${worker.phone || '923001234567'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#25D366] text-white rounded-2xl font-bold hover:opacity-90 transition-all shadow-xl shadow-green-500/10"
                  >
                    <MessageCircle size={22} />
                    {t('whatsapp_btn')}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 items-start">
          {/* Main Content Areas (Tabs) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tab Headers */}
            <div className="glass p-2 rounded-2xl flex gap-2">
              {(['about', 'reviews', 'photos'] as TabType[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-3 rounded-xl font-bold text-sm transition-all capitalize flex items-center justify-center gap-2",
                    activeTab === tab 
                      ? "bg-primary text-white shadow-xl" 
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800"
                  )}
                >
                  {tab === 'about' && <Globe size={18} />}
                  {tab === 'reviews' && <Star size={18} />}
                  {tab === 'photos' && <Camera size={18} />}
                  {tab === 'about' ? t('about_tab') : tab === 'reviews' ? t('reviews_tab') : t('photos_tab')}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                {activeTab === 'about' && (
                  <motion.div
                    key="about"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-10 text-left"
                  >
                    <div className="glass p-8 rounded-[2rem] border-white/10">
                      <h3 className="text-2xl font-bold text-white mb-6 underline decoration-accent/30 decoration-4 underline-offset-8 uppercase italic tracking-tighter">{t('description')}</h3>
                      <p className="text-white/70 leading-loose text-lg">
                        {worker.about || worker.description || t('worker_no_description')}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="glass p-8 rounded-[2rem] border-white/10">
                        <h4 className="font-bold text-white/40 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                          <CheckCircle2 size={16} className="text-accent" />
                          Core Skills
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {(worker.trade || worker.category) && (
                            <span className="px-4 py-2 bg-accent/20 text-accent rounded-xl text-sm font-black border border-accent/20 shadow-sm uppercase italic">
                              {worker.trade || worker.category}
                            </span>
                          )}
                          {['Repairing', 'Installation', 'Safety Check'].map(skill => (
                            <span key={skill} className="px-4 py-2 bg-white/5 text-white/80 rounded-xl text-sm font-semibold border border-white/5 shadow-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="glass p-8 rounded-[2rem] border-white/10">
                        <h4 className="font-bold text-white/40 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                          <Languages size={16} className="text-accent" />
                          Languages
                        </h4>
                        <div className="flex gap-4">
                          {['Urdu', 'English', 'Punjabi'].map(lang => (
                             <div key={lang} className="flex flex-col items-center gap-2">
                               <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                 {lang[0]}
                               </div>
                               <span className="text-xs font-bold text-white">{lang}</span>
                             </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="glass p-8 rounded-[2rem] border-white/10">
                       <h4 className="font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest text-xs mb-6 flex items-center gap-2">
                          <MapPin size={16} className="text-accent" />
                          Service Areas
                        </h4>
                        <div className="flex flex-wrap gap-3">
                           {worker.serviceAreas && worker.serviceAreas.length > 0 ? worker.serviceAreas.map((area: string) => (
                             <div key={area} className="px-4 py-2 bg-white/5 rounded-xl flex items-center gap-3 text-gray-300 font-medium border border-white/5">
                               <div className="w-2 h-2 rounded-full bg-accent" />
                               {area}
                             </div>
                           )) : (worker.location ? [worker.location] : ['PECHS', 'Gulshan', 'DHA', 'North Nazimabad', 'Clifton']).map(area => (
                             <div key={area} className="px-4 py-2 bg-white/5 rounded-xl flex items-center gap-3 text-gray-300 font-medium border border-white/5">
                               <div className="w-2 h-2 rounded-full bg-accent" />
                               {area}
                             </div>
                           ))}
                        </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === 'reviews' && (
                  <motion.div
                    key="reviews"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8 text-left"
                  >
                    <div className="glass p-8 rounded-[2rem] border-white/10 flex flex-col md:flex-row gap-10 items-center">
                      <div className="text-center">
                        <div className="text-6xl font-bold text-accent mb-2">4.9</div>
                        <div className="flex text-yellow-500 mb-2">
                          {[...Array(5)].map((_, i) => <Star key={i} size={20} fill="currentColor" />)}
                        </div>
                        <p className="text-sm text-white/40 font-bold uppercase tracking-widest">{t('global_rating')}</p>
                      </div>
                      
                      <div className="flex-1 space-y-3 w-full">
                        {[5, 4, 3, 2, 1].map((stars) => (
                          <div key={stars} className="flex items-center gap-4">
                            <span className="text-sm font-bold w-4">{stars}</span>
                            <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-accent rounded-full transition-all duration-1000" 
                                style={{ width: stars === 5 ? '85%' : stars === 4 ? '10%' : '2%' }} 
                              />
                            </div>
                            <span className="text-xs font-bold text-white/40 w-10">
                              {stars === 5 ? '85%' : stars === 4 ? '10%' : '2%'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="glass p-6 rounded-3xl border-white/5 shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent font-bold">
                                 {rev.user[0]}
                               </div>
                               <div>
                                 <h4 className="font-bold text-white">{rev.user}</h4>
                                 <p className="text-xs text-white/40">{rev.date}</p>
                               </div>
                            </div>
                            <div className="flex text-yellow-500">
                              {[...Array(rev.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                            </div>
                          </div>
                          <p className="text-white/70 font-medium">{rev.text}</p>
                        </div>
                      ))}
                    </div>

                    <button className="w-full py-4 glass rounded-2xl font-bold text-primary dark:text-accent hover:bg-white/10 transition-all">
                      {t('load_more_reviews')}
                    </button>
                  </motion.div>
                )}

                {activeTab === 'photos' && (
                  <motion.div
                    key="photos"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-2 md:grid-cols-3 gap-4"
                  >
                    {worker.portfolio ? worker.portfolio.map((item: any, i: number) => (
                      <div key={i} className="group relative aspect-square glass rounded-3xl overflow-hidden cursor-pointer shadow-lg">
                         <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center backdrop-blur-[2px] p-2 text-center">
                            <span className="text-white text-[10px] font-bold uppercase tracking-widest leading-tight">{item.caption || `Work #${i + 1}`}</span>
                         </div>
                         <img 
                          src={item.url}
                          alt={`Work sample ${i+1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      </div>
                    )) : photos.map((url, i) => (
                      <div key={i} className="group relative aspect-square glass rounded-3xl overflow-hidden cursor-pointer shadow-lg">
                         <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center backdrop-blur-[2px]">
                            <span className="text-white text-xs font-bold uppercase tracking-widest">Work #{i+1}</span>
                         </div>
                         <img 
                          src={url}
                          alt={`Work sample ${i+1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        />
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* AI Price Estimator Sidebar */}
          <div className="lg:sticky lg:top-32 space-y-6">
             <div className="glass p-8 rounded-[2.5rem] shadow-2xl border-white/30 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-accent/20 rounded-full blur-3xl group-hover:bg-accent/40 transition-all duration-700" />
                
                <h3 className="text-2xl font-bold dark:text-white mb-4 flex items-center gap-3 italic uppercase italic tracking-tighter">
                  <Sparkles className="text-accent animate-pulse" />
                  {t('ai_translator_title')}
                </h3>
                
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-6 font-medium uppercase tracking-widest italic">
                  {t('ai_translator_desc')}
                </p>

                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={aiInput}
                      onChange={(e) => setAiInput(e.target.value)}
                      placeholder={t('ai_translator_placeholder')}
                      className="w-full h-32 p-4 bg-white/5 rounded-2xl border border-white/10 outline-none focus:ring-2 focus:ring-accent transition-all text-white font-medium resize-none shadow-inner"
                    />
                    <VoiceButton onResult={(text) => setAiInput(text)} className="absolute bottom-4 right-4" size={18} />
                  </div>
                  
                  <button
                    onClick={handleAiTranslate}
                    disabled={isEstimating || !aiInput.trim()}
                    className="w-full py-4 btn-primary shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed group uppercase tracking-widest font-black italic"
                  >
                    {isEstimating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('translating_label')}
                      </>
                    ) : (
                      <>
                        <Sparkles size={18} className="group-hover:scale-125 transition-transform" />
                        {t('generate_request_btn')}
                      </>
                    )}
                  </button>
                </div>

                <AnimatePresence>
                  {translationResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-6 pt-6 border-t border-white/10 overflow-hidden"
                    >
                      <div className="bg-accent/5 p-6 rounded-[2rem] border border-white/10 space-y-4 text-left">
                        <div>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{t('title_label')}</p>
                          <p className="text-sm font-bold text-white">{translationResult.title}</p>
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{t('problem_details_label')}</p>
                          <p className="text-sm text-white/70 font-medium">{translationResult.problem}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{t('urgency_label')}</p>
                            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-md text-[10px] font-bold">
                              {translationResult.urgency}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-1">{t('est_time_label')}</p>
                            <p className="text-sm font-bold text-white">{translationResult.time}</p>
                          </div>
                        </div>

                        <button 
                          onClick={() => toast.success(t('req_sent_success'))}
                          className="w-full mt-4 py-3 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                        >
                          {t('send_this_req')}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>

             <div className="glass p-8 rounded-[2.5rem] border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                   <div className="text-center flex-1 border-r border-gray-100 dark:border-slate-800">
                      <div className="text-2xl font-bold text-primary dark:text-accent">{worker.completedJobs}+</div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t('kaam_label')}</p>
                   </div>
                   <div className="text-center flex-1">
                      <div className="text-2xl font-bold text-primary dark:text-accent">99%</div>
                      <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{t('rating_label')}</p>
                   </div>
                </div>
                <Link to="/services" className="w-full flex items-center justify-between p-4 bg-white/5 rounded-2xl group">
                   <span className="text-sm font-black text-white uppercase italic tracking-tighter">{t('similar_ustaads')}</span>
                   <ChevronRight size={18} className="text-accent group-hover:translate-x-1 transition-transform" />
                </Link>
             </div>
          </div>
        </div>
      </div>

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        worker={bookingWorker}
      />
    </div>
  );
}
