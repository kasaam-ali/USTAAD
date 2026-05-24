import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Search, Menu, X, Wrench, Languages, LogOut, User, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import BookingNotification from './BookingNotification';

export default function Navbar() {
  const { language, setLanguage, t } = useLanguage();
  const { user, isAuthenticated, logout, role } = useAuth();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  const languages = [
    { code: 'english', name: 'English' },
    { code: 'urdu', name: 'اردو' },
    { code: 'roman', name: 'Roman' },
  ];

  const navLinks = role === 'worker' ? [
    { name: t('nav_home'), path: '/worker-dashboard' },
    { name: t('nav_dashboard'), path: '/worker-bookings' },
    { name: t('nav_profile'), path: '/profile' },
  ] : [
    { name: t('nav_home'), path: isAuthenticated ? '/home' : '/' },
    { name: t('nav_services'), path: '/services' },
    { name: t('nav_nearme'), path: '/near-me' },
    { name: t('nav_howitworks'), path: '/how-it-works' },
  ];

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        isScrolled 
          ? 'bg-[#0F172A]/80 backdrop-blur-[20px] border-b border-white/10 py-3' 
          : 'bg-transparent py-6'
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-accent shadow-[0_0_20px_rgba(56,189,248,0.3)] border border-accent/30 group-hover:scale-110 transition-all duration-300">
            <Wrench size={24} className="rotate-45" />
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "font-black text-white logo-glow tracking-tighter uppercase leading-none",
              language === 'urdu' ? "text-3xl" : "text-2xl"
            )}>
              {language === 'urdu' ? 'اُستاد' : 'Ustaad'}
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={cn(
                'text-sm font-bold uppercase tracking-widest transition-all relative group/link nav-link-hover',
                location.pathname === link.path 
                  ? 'text-[#FCD34D] [text-shadow:0_0_10px_rgba(245,158,11,0.8)]' 
                  : 'text-white/70 hover:text-white'
              )}
            >
              {link.name}
              <span className={cn(
                "absolute -bottom-2 left-0 h-0.5 bg-accent transition-all duration-300",
                location.pathname === link.path ? "w-full" : "w-0 group-hover/link:w-full"
              )} />
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <div className="relative hidden lg:block">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white/70 hover:text-white hover:bg-white/10 transition-all"
            >
              <Languages size={14} className="text-accent" />
              {languages.find(l => l.code === language)?.name}
            </button>
            
            <AnimatePresence>
              {showLangMenu && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-3 w-44 bg-[#0F172A]/98 backdrop-blur-[20px] border border-white/25 rounded-[14px] p-2 z-50 shadow-[0_8px_32px_rgba(0,0,0,0.6)]"
                >
                  <div className="flex flex-col gap-1">
                    {languages.map((lang, idx) => (
                      <React.Fragment key={lang.code}>
                        <button
                          onClick={() => {
                            setLanguage(lang.code as any);
                            setShowLangMenu(false);
                          }}
                          className={cn(
                            "w-full px-4 py-2.5 text-left text-[13px] font-bold transition-all",
                            language === lang.code 
                              ? "bg-gradient-to-r from-blue-600 to-sky-400 text-white rounded-[8px] shadow-lg shadow-blue-500/20" 
                              : "text-white/90 hover:bg-white/10 hover:text-white rounded-[8px]"
                          )}
                        >
                          {lang.name}
                        </button>
                        {idx < languages.length - 1 && (
                          <div className="h-px bg-white/5 mx-2 my-0.5" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-3 bg-white/5 border border-white/10 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all hidden sm:block"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {role === 'worker' && isAuthenticated && (
            <div className="hidden sm:block">
              <BookingNotification />
            </div>
          )}
          
          <div className="hidden sm:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-4 bg-white/5 border border-white/10 p-1.5 pl-4 rounded-2xl">
                <div className="text-right hidden lg:block">
                  <p className="text-[10px] font-black uppercase text-white tracking-widest">{user?.fullName}</p>
                  <p className="text-[8px] font-black uppercase text-accent tracking-tighter">{t('nav_profile')}</p>
                </div>
                <button 
                  onClick={logout}
                  className="p-2.5 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <>
                <Link to="/auth?mode=login" className="btn-glass !py-2.5 !px-5 text-sm uppercase tracking-widest">
                  {t('nav_login')}
                </Link>
                <Link to="/auth?mode=signup" className="btn-primary !py-2.5 !px-6 text-sm uppercase tracking-widest">
                  {t('btn_signup')}
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 bg-white/5 border border-white/10 rounded-xl text-white"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 mt-4 mx-4 glass rounded-2xl p-6 md:hidden overflow-hidden shadow-2xl"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-lg font-black uppercase tracking-widest text-gray-400 hover:text-accent transition-colors"
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated ? (
                <button 
                  onClick={() => { logout(); setIsMenuOpen(false); }}
                  className="text-lg font-black text-red-500 border-t border-gray-100 pt-4 text-left uppercase tracking-widest"
                >
                  {language === 'urdu' ? 'لاگ آؤٹ' : 'Logout'}
                </button>
              ) : (
                <>
                  <Link 
                    to="/auth?mode=login" 
                    onClick={() => setIsMenuOpen(false)}
                    className="text-lg font-black text-primary border-t border-gray-100 pt-4 uppercase tracking-widest"
                  >
                    {t('nav_login')}
                  </Link>
                  <Link 
                    to="/auth?mode=signup" 
                    onClick={() => setIsMenuOpen(false)}
                    className="bg-accent text-primary px-6 py-4 rounded-xl text-center font-black uppercase tracking-widest shadow-xl shadow-accent/20"
                  >
                    {t('btn_signup')}
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
