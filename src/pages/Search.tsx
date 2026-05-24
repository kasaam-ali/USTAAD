import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search as SearchIcon, Filter, SlidersHorizontal, ArrowLeft, 
  Star, CheckCircle, Clock, Trash2, ChevronDown 
} from 'lucide-react';
import { MOCK_WORKERS, CATEGORIES } from '../constants';
import WorkerCard from '../components/WorkerCard';
import VoiceButton from '../components/VoiceButton';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

type SortOption = 'rating' | 'price-low' | 'price-high' | 'jobs';

export default function Search() {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || '';
  const initialSearch = searchParams.get('search') || '';
  
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  // Sync state with URL if it changes (e.g. navigation from Home)
  React.useEffect(() => {
    const q = searchParams.get('search');
    const cat = searchParams.get('category');
    if (q !== null) setSearchQuery(q);
    if (cat !== null) setSelectedCategory(cat);
  }, [searchParams]);
  const [minRating, setMinRating] = useState(0);
  const [maxPrice, setMaxPrice] = useState(5000);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('rating');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredWorkers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    
    // Keyword mapping for trades/categories
    const tradeKeywords: Record<string, string[]> = {
      'electrician': ['electrician', 'bijli', 'بجلی', 'bijli wala'],
      'plumber': ['plumber', 'pani', 'پلمبر', 'nalka'],
      'tailor': ['tailor', 'darzi', 'silai', 'درزی', 'silai karhai'],
      'carpenter': ['carpenter', 'barhahi', 'بڑھئی', 'lakri ka kam'],
      'painter': ['painter', 'rang saaz', 'رنگ ساز', 'rang wala'],
      'ac-tech': ['ac tech', 'ac', 'air conditioner', 'ac wala'],
      'cleaner': ['cleaner', 'صفائی', 'safai', 'safai wala'],
      'tiler': ['tiler', 'marble', 'tile wala']
    };

    let results = MOCK_WORKERS.filter(worker => {
      const matchesCategory = selectedCategory ? worker.category === selectedCategory : true;
      
      let matchesSearch = true;
      if (query) {
        // Check if query matches any category via keywords
        const matchedCategories = Object.entries(tradeKeywords)
          .filter(([_, keywords]) => keywords.some(k => query.includes(k) || k.includes(query)))
          .map(([cat]) => cat);

        matchesSearch = 
          worker.name.toLowerCase().includes(query) || 
          worker.description.toLowerCase().includes(query) ||
          worker.location.toLowerCase().includes(query) ||
          (worker.category && (worker.category.toLowerCase().includes(query) || matchedCategories.includes(worker.category))) ||
          (worker.trade && worker.trade.toLowerCase().includes(query));
      }

      const matchesRating = worker.rating >= minRating;
      const matchesPrice = worker.pricePerHour <= maxPrice;
      const matchesVerified = onlyVerified ? worker.isVerified : true;
      const matchesAvailable = true; // Simulated

      return matchesCategory && matchesSearch && matchesRating && matchesPrice && matchesVerified && matchesAvailable;
    });

    results.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price-low') return a.pricePerHour - b.pricePerHour;
      if (sortBy === 'price-high') return b.pricePerHour - a.pricePerHour;
      if (sortBy === 'jobs') return b.completedJobs - a.completedJobs;
      return 0;
    });

    return results;
  }, [searchQuery, selectedCategory, minRating, maxPrice, onlyVerified, onlyAvailable, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinRating(0);
    setMaxPrice(5000);
    setOnlyVerified(false);
    setOnlyAvailable(false);
    setSortBy('rating');
  };

  return (
    <div className="pt-28 pb-20 min-h-screen px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div className="space-y-4">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-primary dark:text-accent font-bold hover:gap-3 transition-all">
              <ArrowLeft size={16} /> {t('back_to_home')}
            </Link>
            <h1 className="text-5xl font-black dark:text-white tracking-tight italic uppercase">
              {t('search_experts')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium max-w-lg italic uppercase tracking-widest text-[10px]">
              {language === 'urdu' 
                ? 'اپنے کام کے لیے بہترین اور تصدیق شدہ ماہرین تلاش کریں۔' 
                : language === 'roman'
                ? 'Apne kaam ke liye behtreen mahreen talash karein.'
                : 'Explore and hire high-skilled, verified professionals for your home and business needs.'}
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group min-w-[280px]">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-accent transition-colors" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder')}
                className="w-full pl-12 pr-12 py-4 bg-white/5 rounded-2xl border border-white/10 shadow-2xl focus:ring-2 focus:ring-accent outline-none transition-all text-white font-medium italic"
              />
              <VoiceButton 
                onResult={(text) => setSearchQuery(text)} 
                className="absolute right-2 top-1/2 -translate-y-1/2" 
                size={18} 
              />
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white/40 uppercase tracking-widest hidden sm:inline">Sort</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-4 pr-10 py-4 bg-white/5 rounded-2xl border border-white/10 shadow-md outline-none focus:ring-2 focus:ring-accent font-bold text-sm text-white/70 cursor-pointer"
                >
                  <option value="rating">{language === 'urdu' ? 'بہترین ریٹنگ' : 'Top Rated'}</option>
                  <option value="price-low">{language === 'urdu' ? 'قیمت: کم سے زیادہ' : 'Price: Low to High'}</option>
                  <option value="price-high">{language === 'urdu' ? 'قیمت: زیادہ سے کم' : 'Price: High to Low'}</option>
                  <option value="jobs">{language === 'urdu' ? 'تجربہ کار' : 'Most Experienced'}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" size={16} />
              </div>
            </div>

            <button 
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={cn(
                "lg:hidden p-4 rounded-2xl border transition-all",
                isFilterOpen ? "bg-primary text-white border-primary" : "bg-white dark:bg-slate-900 border-gray-100 dark:border-slate-800 text-gray-600 dark:text-gray-300"
              )}
            >
              <Filter size={20} />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-10">
          <aside className={cn(
            "lg:col-span-1 space-y-6 lg:block",
            isFilterOpen ? "block" : "hidden"
          )}>
            {(selectedCategory || minRating > 0 || maxPrice < 5000 || onlyVerified || onlyAvailable) && (
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black uppercase text-gray-400 tracking-tighter">{t('active_filters')}</span>
                <button onClick={clearFilters} className="text-[10px] font-black underline text-red-500 hover:text-red-400 flex items-center gap-1 uppercase tracking-widest">
                  <Trash2 size={12} /> {t('clear')}
                </button>
              </div>
            )}

            <div className="bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] backdrop-blur-[20px] p-6 rounded-[2rem] shadow-sm">
              <h3 className="font-black text-sm mb-6 flex items-center gap-2 text-white uppercase tracking-widest">
                <Filter size={16} className="text-accent" />
                {t('skill_categories')}
              </h3>
              <div className="space-y-1 text-left">
                <button onClick={() => setSelectedCategory('')} className={cn("w-full text-left px-4 py-2.5 rounded-xl transition-all text-xs font-bold uppercase tracking-widest", selectedCategory === '' ? 'bg-gradient-to-br from-[#2563EB] to-[#38BDF8] text-white shadow-lg shadow-blue-500/20 scale-[1.02]' : 'text-[rgba(255,255,255,0.7)] hover:bg-white/5')}>{t('all_services')}</button>
                {CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={cn("w-full text-left px-4 py-2.5 rounded-xl transition-all text-xs font-bold uppercase tracking-widest", selectedCategory === cat.id ? 'bg-gradient-to-br from-[#2563EB] to-[#38BDF8] text-white shadow-lg shadow-blue-500/20 scale-[1.02]' : 'text-[rgba(255,255,255,0.7)] hover:bg-white/5')}>{cat.name}</button>
                ))}
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] backdrop-blur-[20px] p-6 rounded-[2rem] shadow-sm">
              <h3 className="font-black text-sm mb-6 text-white uppercase tracking-widest flex items-center gap-2">
                <Star size={16} className="text-[#FCD34D] fill-[#FCD34D]" />
                Minimum Rating
              </h3>
              <div className="flex gap-2">
                {[4, 4.5, 4.8].map(rating => (
                  <button key={rating} onClick={() => setMinRating(minRating === rating ? 0 : rating)} className={cn("flex-1 py-3 rounded-xl text-xs font-black border transition-all", minRating === rating ? "bg-gradient-to-br from-[#2563EB] to-[#38BDF8] border-transparent text-white shadow-lg" : "bg-[rgba(255,255,255,0.08)] border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.8)] hover:border-accent")}>{rating}+</button>
                ))}
              </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] backdrop-blur-[20px] p-6 rounded-[2rem] shadow-sm">
               <h3 className="font-black text-sm mb-6 text-white uppercase tracking-widest">Max Price (per hr)</h3>
               <input type="range" min="300" max="5000" step="100" value={maxPrice} onChange={(e) => setMaxPrice(parseInt(e.target.value))} className="w-full accent-accent mb-2" />
               <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-widest">
                 <span>Rs. 300</span>
                 <span className="text-accent">Rs. {maxPrice}</span>
               </div>
            </div>

            <div className="bg-[rgba(255,255,255,0.07)] border border-[rgba(255,255,255,0.12)] backdrop-blur-[20px] p-6 rounded-[2rem] shadow-sm space-y-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-[#34D399]" />
                    <span className="text-xs font-bold text-white">Verified Only</span>
                 </div>
                 <button onClick={() => setOnlyVerified(!onlyVerified)} className={cn("w-10 h-5 rounded-full transition-colors relative", onlyVerified ? "bg-[#34D399]" : "bg-white/10")}>
                   <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", onlyVerified ? "left-6" : "left-1")} />
                 </button>
               </div>

               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <Clock size={18} className="text-accent" />
                    <span className="text-xs font-bold text-white">Available Now</span>
                 </div>
                 <button onClick={() => setOnlyAvailable(!onlyAvailable)} className={cn("w-10 h-5 rounded-full transition-colors relative", onlyAvailable ? "bg-accent" : "bg-white/10")}>
                   <div className={cn("absolute top-1 w-3 h-3 bg-white rounded-full transition-all", onlyAvailable ? "left-6" : "left-1")} />
                 </button>
               </div>
            </div>
          </aside>

          <main className="lg:col-span-3">
             <div className="flex items-center justify-between mb-6">
                <p className="text-sm font-bold text-gray-500 dark:text-gray-400">
                  Showing <span className="text-gray-900 dark:text-white font-black">{filteredWorkers.length}</span> results
                </p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               <AnimatePresence mode="popLayout">
                 {filteredWorkers.map((worker, idx) => (
                   <motion.div key={worker.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ duration: 0.3, delay: idx * 0.05 }} >
                     <WorkerCard worker={worker} index={idx} />
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>

            {filteredWorkers.length === 0 && (
               <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-32 bg-white/5 rounded-[3rem] border border-dashed border-white/10" >
                 <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center text-white/10 mx-auto mb-8">
                   <SearchIcon size={48} />
                 </div>
                 <h3 className="text-3xl font-black text-white mb-2 uppercase italic">{t('no_results')}</h3>
                 <p className="text-white/40 font-medium mb-8 uppercase tracking-widest text-xs italic">{language === 'urdu' ? 'تلاش کی شرائط تبدیل کر کے دیکھیں' : 'Try adjusting your filters or search keywords to find what you need.'}</p>
                 <button onClick={clearFilters} className="px-10 py-4 bg-accent text-primary rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-accent/20" >{t('clear')}</button>
               </motion.div>
             )}
          </main>
        </div>
      </div>
    </div>
  );
}
