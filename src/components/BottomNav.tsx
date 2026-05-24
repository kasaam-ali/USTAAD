import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, Search, Briefcase, User, 
  Wallet, Star, MessageSquare 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { cn } from '../lib/utils';

export default function BottomNav() {
  const { role, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const location = useLocation();

  if (!isAuthenticated) return null;

  const customerLinks = [
    { to: '/home', icon: <Home size={24} />, label: t('nav_home') },
    { to: '/services', icon: <Search size={24} />, label: t('dhundho_label') },
    { to: '/bookings', icon: <Briefcase size={24} />, label: t('mere_kaam_label') },
    { to: '/profile', icon: <User size={24} />, label: t('nav_profile') },
  ];

  const workerLinks = [
    { to: '/worker-dashboard', icon: <Home size={24} />, label: t('nav_home') },
    { to: '/worker-bookings', icon: <Briefcase size={24} />, label: t('kaam_label') },
    { to: '/earnings', icon: <Wallet size={24} />, label: t('kamai_label') },
    { to: '/reviews', icon: <Star size={24} />, label: t('reviews_label') },
    { to: '/profile', icon: <User size={24} />, label: t('nav_profile') },
  ];

  const links = role === 'worker' ? workerLinks : customerLinks;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden pb-safe">
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        {links.map((link) => {
          const isActive = location.pathname === link.to;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => cn(
                "flex flex-col items-center gap-1.5 transition-all",
                isActive ? "text-accent scale-110" : "text-gray-400"
              )}
            >
              <div className={cn(
                "p-2 rounded-2xl transition-all",
                isActive ? "bg-accent/10 shadow-inner" : ""
              )}>
                {React.cloneElement(link.icon as React.ReactElement, {
                  size: 24,
                  className: isActive ? "fill-accent/20" : ""
                } as any)}
              </div>
              <span className="text-[8px] font-black uppercase tracking-widest">{link.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
