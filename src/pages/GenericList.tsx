import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function GenericList({ title }: { title: string }) {
  const { language } = useLanguage();

  return (
    <div className="pt-32 pb-32 min-h-screen bg-transparent px-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-12 underline decoration-accent decoration-8 underline-offset-4">
          {title}
        </h1>
        
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map(i => (
            <Link 
              key={i} 
              to={`/booking/B${1000 + i}`}
              className="block p-8 glass rounded-[2.5rem] border-white/10 shadow-2xl hover:border-accent transition-all group"
            >
              <div className="flex justify-between items-center">
                 <div className="flex gap-6 items-center">
                    <div className="w-16 h-16 bg-white/10 rounded-3xl flex items-center justify-center text-accent">
                       <Briefcase size={32} />
                    </div>
                    <div>
                       <p className="text-sm font-black text-white uppercase tracking-widest mb-1">Fan Installation • Oct {20 + i}, 2023</p>
                       <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Gulshan-e-Iqbal, Karachi</p>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-xl font-black text-white uppercase tracking-tighter italic">Rs. 1,500</p>
                    <p className="text-[10px] font-black text-accent uppercase tracking-widest group-hover:translate-x-2 transition-transform">Details <ArrowRight size={10} className="inline ml-1" /></p>
                 </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
