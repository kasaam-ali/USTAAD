import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ArrowRight, ShieldCheck, Zap, Users, Star, Mic, Cpu } from 'lucide-react';
import { CATEGORIES, MOCK_WORKERS } from '../constants';
import CategoryItem from '../components/CategoryItem';
import WorkerCard from '../components/WorkerCard';
import VoiceButton from '../components/VoiceButton';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import BookingModal from '../components/BookingModal';

export default function Home() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/services');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  const trendingTags = ['Electrician', 'Plumber', 'Darzi', 'Carpenter', 'Painter'];

  const spotlightWorker = MOCK_WORKERS.find(w => w.id === 'w10') || MOCK_WORKERS[0];

  const handleHireSpotlight = () => {
    setSelectedWorker({
      id: spotlightWorker.id,
      name: spotlightWorker.name,
      category: spotlightWorker.category,
      rating: spotlightWorker.rating,
      initials: spotlightWorker.initials,
      bgColor: spotlightWorker.bgColor,
      priceRange: spotlightWorker.priceRange
    });
    setIsBookingOpen(true);
  };

  return (
    <div className="pt-0 min-h-screen relative">
      {/* HERO SECTION */}
      <section className="h-screen min-h-[700px] relative overflow-hidden flex items-center justify-center">
        {/* Layer 1: Background Image */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1621905235277-3e1b7829281c?auto=format&fit=crop&q=80&w=2070" 
            alt="Ustaad Bhai Team"
            className="w-full h-full object-cover object-center blur-[1.5px]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Layer 2: Deep Blue Overlay */}
        <div 
          className="absolute inset-0 z-10" 
          style={{ background: 'linear-gradient(135deg, rgba(15,23,42,0.85) 0%, rgba(30,58,138,0.75) 100%)' }}
        />

        {/* Layer 3: Content */}
        <div className="max-w-7xl mx-auto px-6 relative z-30 text-center text-white pt-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-[8px] px-[20px] py-[8px] bg-white/10 border border-sky-400/40 rounded-full text-[13px] font-medium text-[#38BDF8] mb-[24px] mx-auto">
              <ShieldCheck size={16} />
              <span>{language === 'urdu' ? 'پاکستان کا نمبر 1 مرکز' : language === 'roman' ? 'Pakistan ka no. 1 markaz' : 'Pakistan\'s Premier Professional Network'}</span>
            </div>
            
            <h1 className="text-[43px] md:text-[86px] font-black leading-[0.95] mb-8 tracking-tighter italic max-w-5xl mx-auto italic">
              {t('hero_title')}
            </h1>
            
            <p className="text-xl text-white/70 mb-14 max-w-2xl mx-auto leading-relaxed font-medium tracking-widest">
              {t('hero_subtitle')}
            </p>
            
            <div className="w-full max-w-3xl mx-auto bg-white/12 backdrop-blur-[24px] p-2.5 rounded-[50px] flex flex-col md:flex-row items-stretch md:items-center gap-3 shadow-[0_32px_64px_rgba(0,0,0,0.5)] border border-white/20">
              <div className="relative flex-1">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-white/50" size={24} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('search_placeholder')}
                  className="w-full pl-20 pr-8 py-6 bg-transparent text-white placeholder-white/40 font-bold outline-none text-xl"
                />
              </div>
              <div className="flex items-center gap-3 pr-3">
                <VoiceButton onResult={(text) => setSearchQuery(text)} size={26} />
                <button 
                  onClick={handleSearch}
                  className="btn-primary !px-12 !py-6 !rounded-[40px] text-xl"
                >
                  {t('search_btn')}
                </button>
              </div>
            </div>

            {/* Category Pills */}
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <p className="w-full text-[10px] font-black uppercase tracking-widest text-white/30 mb-2">{t('trending_now')}</p>
              {['Electrician', 'Plumber', 'Darzi', 'Carpenter', 'Painter'].map((tag) => (
                <button 
                  key={tag}
                  className="px-6 py-3 glass border-white/5 text-white/50 text-[10px] font-black uppercase tracking-[0.2em] hover:btn-primary !border-none transition-all glass-hover"
                >
                  {tag}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CATEGORY GRID */}
      <section className="px-6 py-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="text-left">
              <p className="text-accent font-black uppercase tracking-widest text-xs mb-4">{t('all_services')}</p>
              <h2 className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tighter leading-none italic">{t('skill_categories')}</h2>
              <p className="text-white/60 max-w-xl font-medium text-lg leading-relaxed">{t('step_01_desc')}</p>
            </div>
            <Link to="/services" className="btn-glass !py-4 !px-10 text-sm uppercase tracking-widest">
               {t('learn_more')}
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {CATEGORIES.map((cat) => (
              <CategoryItem key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      </section>

      {/* Top Rated This Week Banner - High Contrast */}
      <section className="px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-primary text-white rounded-[4rem] p-12 flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-accent/20 blur-[100px] rounded-full translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 blur-[80px] rounded-full -translate-x-1/3 translate-y-1/3" />
            
            <div className="flex-1 space-y-8 relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-1 bg-accent text-primary rounded-full text-[10px] font-black uppercase tracking-widest">
                <Star size={12} className="fill-primary" /> {t('specialist_label')}
              </div>
              <h2 className="text-5xl md:text-7xl font-black leading-none tracking-tight">
                {language === 'urdu' ? 'اس ہفتے کے بہترین استاد' : language === 'roman' ? 'Expert of the week' : 'Expert of the Week'}
              </h2>
              <p className="text-xl text-white/70 font-medium max-w-xl">
                 {language === 'urdu' 
                  ? 'ان ماہرین نے مسلسل بہترین کارکردگی دکھائی ہے اور 5 سٹار ریٹنگ حاصل کی ہے۔' 
                  : language === 'roman'
                  ? 'In mahreen ne musalsal behtreen karkardagi dikhayi hai.'
                  : 'Meet the professionals who are setting new standards of service excellence in Pakistan.'}
              </p>
              
              <div className="flex items-center gap-6 pt-4">
                 <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-sm">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Success Rate</p>
                    <p className="text-2xl font-black text-accent">99.8%</p>
                 </div>
                 <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-sm">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">On-Time Arrival</p>
                    <p className="text-2xl font-black text-accent">100%</p>
                 </div>
              </div>
            </div>

            <div className="lg:w-[400px] w-full relative z-10 group/spotlight">
               <div className="glass p-10 rounded-[3.5rem] shadow-2xl scale-105 border border-white/20 glass-hover group-hover/spotlight:-translate-y-4 transition-all duration-500">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-24 h-24 rounded-[2rem] bg-accent text-primary flex items-center justify-center text-4xl font-black mb-6 shadow-xl shadow-accent/20">BA</div>
                    <h4 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">Babar Azam</h4>
                    <p className="text-sm text-white/40 font-bold mb-8 uppercase tracking-widest">Master Carpenter • Lahore</p>
                    
                    <div className="flex w-full divide-x divide-white/5 mb-8 border-y border-white/5 py-6">
                       <div className="flex-1 px-2">
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Rating</p>
                          <p className="text-xl font-black text-white">5.0 ⭐</p>
                       </div>
                       <div className="flex-1 px-2">
                          <p className="text-[10px] font-black text-white/30 uppercase tracking-widest mb-1">Jobs</p>
                          <p className="text-xl font-black text-white">1.5k+</p>
                       </div>
                    </div>

                    <button 
                      onClick={handleHireSpotlight}
                      className="btn-primary !w-full !rounded-2xl"
                    >
                      {t('btn_hire')}
                    </button>
                  </div>
               </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Workers */}
      <section className="px-6 py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-accent font-bold uppercase tracking-widest text-xs mb-2">
                {language === 'urdu' ? 'اعلیٰ ٹیلنٹ' : language === 'roman' ? 'Aala Talent' : 'Top Talent'}
              </p>
              <h2 className="text-3xl md:text-4xl font-bold dark:text-white">
                {language === 'urdu' ? 'قریبی ماہرین' : language === 'roman' ? 'Qareeb ke mahreen' : 'Nearby Experts'}
              </h2>
            </div>
            <Link to="/near-me" className="text-primary dark:text-accent font-bold flex items-center gap-2 hover:underline">
              {language === 'urdu' ? 'راڈار پر دیکھیں' : language === 'roman' ? 'Radar par dekhein' : 'View on Radar'} <ArrowRight size={18} />
            </Link>
          </div>
          
          <div className="flex overflow-x-auto pb-8 -mx-6 px-6 md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 md:overflow-visible md:px-0 md:mx-0 scrollbar-hide">
            {MOCK_WORKERS.map((worker, idx) => (
              <WorkerCard key={worker.id} worker={worker} index={idx} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto rounded-[2rem] bg-primary relative overflow-hidden p-12 text-center text-white shadow-2xl shadow-primary/30">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(29,158,117,0.4),transparent)]" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6 relative z-10 leading-tight italic">
            {language === 'urdu' ? 'کیا آپ ایک ہنر مند پیشہ ور ہیں؟' : 'Are you a skilled professional?'}
            <br/>
            {language === 'urdu' ? 'تحریک میں شامل ہوں۔' : 'Join the movement.'}
          </h2>
          <p className="text-lg text-white/80 mb-10 relative z-10 max-w-2xl mx-auto">
            {language === 'urdu' ? 'استاد کمیونٹی کا حصہ بنیں اور پاکستان کے جدید ترین پلیٹ فارم کے ساتھ اپنا کاروبار بڑھانا شروع کریں۔' : 'Become a part of the Ustaad community and start growing your business with the most futuristic platform in Pakistan.'}
          </p>
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/join" className="bg-white text-primary px-8 py-4 rounded-2xl font-bold hover:bg-accent hover:text-white transition-all">
              {t('worker_signup')}
            </Link>
            <Link to="/how-it-works" className="text-white font-semibold flex items-center gap-2 hover:underline">
              {t('learn_more')} <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {selectedWorker && (
        <BookingModal 
          isOpen={isBookingOpen} 
          onClose={() => {
            setIsBookingOpen(false);
            setSelectedWorker(null);
          }} 
          worker={selectedWorker}
        />
      )}
    </div>
  );
}
