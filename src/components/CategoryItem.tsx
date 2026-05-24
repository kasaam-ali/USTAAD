import React from 'react';
import * as LucideIcons from 'lucide-react';
import { Category } from '../types';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

interface CategoryItemProps {
  category: Category;
}

export default function CategoryItem({ category }: CategoryItemProps) {
  // @ts-ignore
  const Icon = LucideIcons[category.icon];

  return (
    <Link to={`/services?category=${category.id}`}>
      <motion.div
        whileHover={{ 
          scale: 1.02, 
          y: -7,
          boxShadow: "0 0 25px rgba(245, 158, 11, 0.65), 0 0 55px rgba(245, 158, 11, 0.25), 0 18px 36px rgba(0, 0, 0, 0.4)",
          borderColor: "rgba(245, 158, 11, 0.8)",
          backgroundColor: "rgba(245, 158, 11, 0.06)",
        }}
        whileTap={{ scale: 0.99, y: -2 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className="p-10 rounded-[30px] flex flex-col items-center gap-6 text-center group relative overflow-hidden bg-[rgba(255,255,255,0.08)] border border-[rgba(255,255,255,0.15)] transition-all"
      >
        <div className="absolute -top-6 -right-6 p-2 opacity-5 scale-150 blur-[2px] group-hover:opacity-10 transition-opacity">
           {Icon && <Icon size={140} className="rotate-12" />}
        </div>

        <div className="w-24 h-24 bg-white/5 rounded-[20px] flex items-center justify-center text-[#38BDF8] group-hover:scale-110 transition-all duration-500 border border-white/10 shadow-[0_0_20px_rgba(56,189,248,0.2)]">
          {Icon && <Icon size={40} />}
        </div>
        
        <div className="relative z-10">
          <h3 className="font-black text-white text-2xl mb-3 tracking-tighter uppercase italic group-hover:text-accent transition-colors">
            {category.name}
          </h3>
          <span className="inline-block px-5 py-2 bg-[rgba(37,99,235,0.3)] text-[10px] font-black text-[#93C5FD] rounded-full uppercase tracking-[0.2em] border border-[rgba(56,189,248,0.4)] backdrop-blur-sm">
            {category.id.slice(0, 3)} Specialist
          </span>
        </div>
      </motion.div>
    </Link>
  );
}
