import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Wrench, Facebook, Instagram, Twitter, 
  Youtube, Heart, Mail, Phone, MapPin 
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export default function Footer() {
  const { language, t } = useLanguage();

  return (
    <footer className="bg-gray-50 dark:bg-slate-900/50 pt-20 pb-10 px-6 border-t border-gray-100 dark:border-slate-800">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-primary/10 dark:bg-accent/20 rounded-xl flex items-center justify-center text-primary dark:text-accent group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                <Wrench size={22} className="rotate-45" />
              </div>
              <span className="text-2xl font-bold text-primary dark:text-accent font-sans">
                {language === 'urdu' ? 'اُستاد' : 'Ustaad'}
              </span>
            </Link>
            <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">
              {t('footer_desc')}
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Instagram, Twitter, Youtube].map((Icon, idx) => (
                <a key={idx} href="#" className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 flex items-center justify-center text-gray-400 hover:text-primary dark:hover:text-accent hover:border-primary transition-all">
                  <Icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest mb-8 dark:text-white">{t('quick_links')}</h3>
            <ul className="space-y-4">
              {[
                { name: t('about_us'), path: '#' },
                { name: t('nav_services'), path: '/services' },
                { name: t('nav_howitworks'), path: '/how-it-works' },
                { name: t('cities_label'), path: '#' },
                { name: t('privacy_policy'), path: '#' }
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent font-medium transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Top Categories */}
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest mb-8 dark:text-white">{t('top_services')}</h3>
            <ul className="space-y-4">
              {[
                { name: t('cat_electrician'), id: 'electrician' },
                { name: t('cat_plumber'), id: 'plumber' },
                { name: t('cat_carpenter'), id: 'carpenter' },
                { name: t('cat_tailor'), id: 'tailor' },
                { name: t('cat_actech'), id: 'ac-technician' }
              ].map(link => (
                <li key={link.id}>
                  <Link to={`/services?category=${link.id}`} className="text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-accent font-medium transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-black text-sm uppercase tracking-widest mb-8 dark:text-white">{t('contact_us_label')}</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-primary dark:text-accent shrink-0" />
                <span className="text-gray-500 dark:text-gray-400 font-medium">123 Business Avenue, Gulberg III, Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={20} className="text-primary dark:text-accent shrink-0" />
                <span className="text-gray-500 dark:text-gray-400 font-medium">+92 (042) 111-USTAAD</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={20} className="text-primary dark:text-accent shrink-0" />
                <span className="text-gray-500 dark:text-gray-400 font-medium">help@ustaadbhai.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-10 border-t border-gray-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
            © 2024 Ustaad Bhai. {t('rights_reserved')}.
          </p>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
            {t('made_with')} <Heart size={16} className="text-red-500 fill-red-500" /> in Pakistan
          </div>
        </div>
      </div>
    </footer>
  );
}
