import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { 
  Wrench, Lock, User as UserIcon, Camera,
  ArrowRight, ShieldCheck, Zap,
  Briefcase, Users, CheckCircle2,
  Eye, EyeOff, Mic, MessageCircle,
  ArrowLeft, Chrome, Plus, X, Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { TranslationKey } from '../lib/translations';
import { useAuth, User } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { cn } from '../lib/utils';
import CameraCapture from '../components/CameraCapture';
// Firebase removed, using localStorage

type AuthStep = 'auth' | 'forgot-phone' | 'forgot-otp' | 'forgot-new-password';

const TRADES = [
  { id: 'electrician', icon: '⚡', label: 'Electrician' },
  { id: 'plumber', icon: '💧', label: 'Plumber' },
  { id: 'tailor', icon: '🧵', label: 'Tailor' },
  { id: 'carpenter', icon: '🪵', label: 'Carpenter' },
  { id: 'painter', icon: '🎨', label: 'Painter' },
  { id: 'ac-tech', icon: '❄️', label: 'AC Tech' },
  { id: 'tiler', icon: '🏠', label: 'Tiler' },
  { id: 'cleaner', icon: '🧹', label: 'Cleaner' },
  { id: 'other', icon: '➕', label: 'Other' },
];

const CITIES = ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Peshawar', 'Quetta', 'Other'];

export default function Auth() {
  const { t, language, setLanguage } = useLanguage();
  const { login } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(searchParams.get('mode') !== 'signup');
  const [step, setStep] = useState<AuthStep>('auth');
  const [workerStep, setWorkerStep] = useState(1);
  const totalWorkerSteps = 7;
  
  const profileInputRef = useRef<HTMLInputElement>(null);
  const profileCameraInputRef = useRef<HTMLInputElement>(null);
  const portfolioInputRef = useRef<HTMLInputElement>(null);
  const portfolioCameraInputRef = useRef<HTMLInputElement>(null);

  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(null);
  const [portfolioItems, setPortfolioItems] = useState<{file: File, preview: string, caption: string}[]>([]);
  const [role, setRole] = useState<'customer' | 'worker' | null>(() => {
    const saved = localStorage.getItem('ustaad_role');
    return (saved === 'customer' || saved === 'worker') ? saved : null;
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isEasyMode, setIsEasyMode] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showProfileCamera, setShowProfileCamera] = useState(false);
  const [showPortfolioCamera, setShowPortfolioCamera] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    city: '',
    area: '',
    cnic: '',
    otp: ['', '', '', ''],
    newPassword: '',
    trade: '',
    experience: 5,
    serviceAreas: [] as string[],
    minCharge: 500,
    hourlyRate: 300,
    visitCharge: 200,
    hasProfilePhoto: false,
    hasCnicPhoto: false,
    description: '',
    agreeTerms: false,
  });

  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    setIsLogin(searchParams.get('mode') !== 'signup');
    if (searchParams.get('mode') === 'signup') {
      setWorkerStep(1);
    }
  }, [searchParams]);

  const handleProfilePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File too large! Max 2MB allowed.');
        return;
      }
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProfileCameraCapture = (file: File) => {
    setProfilePhoto(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePortfolioCameraCapture = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPortfolioItems(prev => [...prev, {
        file,
        preview: reader.result as string,
        caption: ''
      }]);
    };
    reader.readAsDataURL(file);
  };

  const handlePortfolioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (portfolioItems.length + files.length > 12) {
      toast.error(t('maxPhotosAllowed'));
      return;
    }
    
    files.forEach(file => {
      if (file.size > 2 * 1024 * 1024) {
        toast.error(`${file.name} is too large! Max 2MB.`);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setPortfolioItems(prev => [...prev, {
          file,
          preview: reader.result as string,
          caption: ''
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePortfolioItem = (index: number) => {
    setPortfolioItems(prev => prev.filter((_, i) => i !== index));
  };

  const updatePortfolioCaption = (index: number, caption: string) => {
    setPortfolioItems(prev => prev.map((item, i) => i === index ? { ...item, caption } : item));
  };

  const uploadPhotos = async (userId: string) => {
    let profileURL = '';
    const portfolioPhotos: { url: string; caption: string }[] = [];

    try {
      // Just return the previews (which are base64 from FileReader)
      if (profilePreview) {
        profileURL = profilePreview;
      }

      // Return portfolio items with their previews
      portfolioItems.forEach(item => {
        portfolioPhotos.push({ url: item.preview, caption: item.caption });
      });

      return { profileURL, portfolioPhotos };
    } catch (error) {
      console.error('Photo processing failed:', error);
      return { profileURL: '', portfolioPhotos: [] };
    }
  };

  const speak = (key: TranslationKey) => {
    const text = t(key);
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const urduVoice = voices.find(v => v.lang.includes('ur')) || voices.find(v => v.lang.includes('hi'));
    if (urduVoice) utterance.voice = urduVoice;
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceLogin = () => {
    speak('speakPhone');
    setIsListening(true);
    
    setTimeout(() => {
      setIsListening(false);
      setFormData(prev => ({ ...prev, phone: '3001234567' }));
      toast.success('Number captured!');
      speak('speakOTP');
    }, 3000);
  };

  const handleVoiceBio = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      toast.success('Voice Bio Recorded!');
      setWorkerStep(5);
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      toast.error(t('select_role_err'));
      return;
    }

    if (!isLogin && role === 'worker' && workerStep < totalWorkerSteps) {
      if (workerStep === 5 && portfolioItems.length < 2) {
        toast.error(t('minPhotosReq'));
        return;
      }
      setWorkerStep(workerStep + 1);
      return;
    }

    setIsLoading(true);
        const signup = async () => {
      try {
        const userId = Math.random().toString(36).substr(2, 9);
        let profileURL = '';
        let portfolioPhotos: { url: string; caption: string }[] = [];

        // Upload photos for both roles if profile photo selected
        if (profilePhoto) {
          const uploads = await uploadPhotos(userId);
          profileURL = uploads.profileURL;
          portfolioPhotos = uploads.portfolioPhotos;
        }

        const userData: User = {
          id: userId,
          fullName: formData.fullName || (role === 'customer' ? 'Ahmed Ali' : 'Ustaad Babar'),
          phone: formData.phone || '3001234567',
          role: role as any,
          isVerified: role === 'customer',
          profilePhotoURL: profileURL
        };

        // Save to localStorage
        const users = JSON.parse(localStorage.getItem('ustaad_users') || '[]');
        users.push(userData);
        localStorage.setItem('ustaad_users', JSON.stringify(users));

        if (role === 'worker') {
          const specialists = JSON.parse(localStorage.getItem('ustaad_specialists') || '[]');
          specialists.push({
            ...userData,
            name: formData.fullName,
            category: formData.trade,
            trade: formData.trade,
            experience: `${formData.experience} years`,
            portfolio: portfolioPhotos,
            minCharge: formData.minCharge,
            hourlyRate: formData.hourlyRate,
            visitCharge: formData.visitCharge,
            pricePerHour: formData.hourlyRate,
            priceRange: `Rs. ${formData.minCharge}+`,
            initials: formData.fullName.split(' ').map((n: any) => (n ? n[0] : '')).join('').toUpperCase(),
            bgColor: 'blue',
            location: `${formData.area}, ${formData.city}`,
            city: formData.city,
            area: formData.area,
            description: formData.description,
            completedJobs: 0,
            rating: 5.0,
            totalRatings: 0,
            phone: formData.phone,
            isVerified: false
          });
          localStorage.setItem('ustaad_specialists', JSON.stringify(specialists));
        }

        login(userData);
        toast.success(isLogin ? 'Logged in successfully!' : 'Account created successfully!');
        
        const redirectPath = role === 'worker' ? '/worker-dashboard' : '/home';
        navigate(redirectPath);
      } catch (err) {
        toast.error('Something went wrong');
      } finally {
        setIsLoading(false);
      }
    };

    signup();
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...formData.otp];
    newOtp[index] = value.slice(-1);
    setFormData({ ...formData, otp: newOtp });

    if (value && index < 3) {
      otpRefs[index + 1].current?.focus();
    }
  };

  const handleForgotFlow = (nextStep: AuthStep) => {
    setStep(nextStep);
    if (nextStep === 'forgot-phone') speak('speakPhone');
    if (nextStep === 'forgot-otp') speak('speakOTP');
  };

  const getPriceVerdict = (price: number, base: number) => {
    const ratio = price / base;
    if (ratio < 0.8) return { label: t('sasta'), color: 'text-green-500' };
    if (ratio > 1.4) return { label: t('mehnga'), color: 'text-red-500' };
    return { label: t('theek'), color: 'text-accent' };
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-transparent overflow-hidden">
      {/* LEFT SIDE: Branding - DARK GLASS PANORAMA */}
      <div className="hidden md:flex md:w-1/2 lg:w-2/5 h-full relative overflow-hidden bg-blue-950/40 items-center justify-center p-12 lg:p-24 min-h-screen border-r border-white/5">
        {/* Background elements */}
        <div className="absolute top-1/4 -left-20 w-80 h-80 bg-accent/20 blur-[100px] rounded-full animate-orb" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/20 blur-[120px] rounded-full animate-orb" style={{ animationDelay: '2s' }} />
        
        <div className="absolute inset-0 z-0 text-white flex items-center justify-center font-black text-[30rem] opacity-[0.02] select-none uppercase -rotate-12 pointer-events-none">
          Ustaad
        </div>
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1581244276891-6bc345f8b65a?auto=format&fit=crop&q=80&w=2070" 
            alt="Ustaad Background"
            className="w-full h-full object-cover opacity-10"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-deeper via-primary-dark/95 to-accent/10" />
        </div>

        <div className="relative z-10 w-full max-w-xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
          >
            <Link to="/" className="inline-flex items-center gap-3 mb-12 group">
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-[2rem] flex items-center justify-center text-white shadow-[0_0_40px_rgba(37,99,235,0.4)] group-hover:rotate-12 transition-all duration-500 logo-glow">
                <Wrench size={40} className="rotate-45" />
              </div>
              <span className="text-7xl font-black text-white tracking-tighter italic uppercase logo-glow">Ustaad</span>
            </Link>
            
            <h1 className="text-5xl lg:text-7xl font-black text-white leading-[0.9] mb-10 tracking-tighter uppercase italic">
              {t('hero_title')}
            </h1>
            
            <div className="space-y-6">
              {[
                { icon: <ShieldCheck className="text-available" />, text: t('verified_ustaad_pill') },
                { icon: <Zap className="text-accent-gold" />, text: t('behtreen_service_pill') },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-6 text-white/80 font-black bg-white/5 p-6 rounded-[2rem] backdrop-blur-xl border border-white/10 group hover:bg-white/10 transition-all cursor-default">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform border border-white/10">
                    {item.icon}
                  </div>
                  <span className="text-lg uppercase tracking-widest">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: Auth Content - DEEP BLUE GLASS CONTAINER */}
      <div className="w-full md:w-1/2 lg:w-3/5 p-6 md:p-12 lg:p-20 flex flex-col justify-center bg-transparent min-h-screen overflow-y-auto relative z-10">
        <div className="max-w-2xl w-full mx-auto">
          {/* Language Switcher - GLASS PILLS */}
          <div className="flex justify-center md:justify-end gap-3 mb-12">
            {(['english', 'urdu', 'roman'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={cn(
                  "px-5 py-2.5 rounded-full text-[10px] font-black tracking-[0.2em] transition-all border uppercase",
                  language === lang 
                    ? "bg-accent border-accent text-primary-deeper shadow-[0_0_20px_rgba(56,189,248,0.4)]" 
                    : "glass border-white/10 text-white/40 hover:text-white"
                )}
              >
                {lang}
              </button>
            ))}
          </div>

          <Link to="/" className="md:hidden flex items-center justify-center gap-3 mb-16">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-accent shadow-lg">
              <Wrench size={24} className="rotate-45" />
            </div>
            <span className="text-3xl font-black text-white italic tracking-tighter uppercase">Ustaad</span>
          </Link>

          {step === 'auth' ? (
            <>
              {/* TABS - GLASS STYLE */}
              <div className="flex mb-16 glass p-2 rounded-[2rem] border-white/10 relative">
                <button
                  onClick={() => { setIsLogin(true); navigate('/auth?mode=login'); setIsEasyMode(false); }}
                  className={cn(
                    "flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative z-10",
                    isLogin ? "text-primary-deeper" : "text-white/40 hover:text-white"
                  )}
                >
                  {t('loginTab')}
                </button>
                <button
                  onClick={() => { setIsLogin(false); navigate('/auth?mode=signup'); setIsEasyMode(false); }}
                  className={cn(
                    "flex-1 py-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative z-10",
                    !isLogin ? "text-primary-deeper" : "text-white/40 hover:text-white"
                  )}
                >
                  {t('signupTab')}
                </button>
                <motion.div
                  className="absolute inset-y-2 bg-accent rounded-[1.5rem] shadow-[0_0_20px_rgba(56,189,248,0.3)]"
                  animate={{ left: isLogin ? '8px' : 'calc(50% + 4px)', width: 'calc(50% - 12px)' }}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              </div>

              {/* Progress Bar (Worker Signup) */}
              {!isLogin && role === 'worker' && (
                <div className="mb-12">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">
                      {t('step')} {workerStep} / {totalWorkerSteps}: <span className="text-white ml-2">{
                        workerStep === 1 ? t('basicInfo') :
                        workerStep === 2 ? t('skillsTrade') :
                        workerStep === 3 ? t('pricing') :
                        workerStep === 4 ? t('profilePhoto') :
                        workerStep === 5 ? t('workPortfolio') :
                        workerStep === 6 ? t('voiceBio') : t('verification')
                      }</span>
                    </span>
                    {workerStep > 1 && (
                      <button 
                        onClick={() => setWorkerStep(workerStep - 1)}
                        className="text-[10px] font-black uppercase text-white/30 hover:text-accent transition-colors"
                      >
                         {t('back_btn')}
                      </button>
                    )}
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(workerStep / totalWorkerSteps) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* ROLE SELECTOR - LARGE GLASS CARDS */}
              {!isEasyMode && (
                <div className="mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mb-8 text-center uppercase tracking-widest">
                    {t('whoAreYou')}
                  </p>
                  <div className="grid grid-cols-2 gap-6">
                    {(['customer', 'worker'] as const).map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => { setRole(r); localStorage.setItem('ustaad_role', r); }}
                        className={cn(
                          "glass p-8 rounded-[30px] border-2 transition-all flex flex-col items-center gap-6 relative group overflow-hidden",
                          role === r 
                            ? "border-accent bg-accent/10 shadow-[0_0_30px_rgba(56,189,248,0.2)]" 
                            : "border-white/5 hover:border-white/20"
                        )}
                      >
                        {role === r && (
                           <motion.div 
                             layoutId="role-check"
                             className="absolute top-4 right-4 bg-accent text-primary-deeper rounded-full p-1.5 shadow-lg"
                           >
                             <CheckCircle2 size={16} />
                           </motion.div>
                        )}
                        <div className={cn(
                          "w-16 h-16 rounded-[20px] flex items-center justify-center transition-all duration-500 shadow-2xl",
                          role === r ? "bg-accent text-primary-deeper scale-110" : "bg-white/5 text-white/40"
                        )}>
                          {r === 'customer' ? <Users size={32} /> : <Briefcase size={32} />}
                        </div>
                        <span className={cn(
                          "block font-black text-xs uppercase tracking-[0.22em]",
                          role === r ? "text-white" : "text-white/40"
                        )}>
                          {r === 'customer' ? t('customerRole') : t('workerRole')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* EASY MODE TOGGLE FOR WORKERS */}
              {isLogin && role === 'worker' && !isEasyMode && (
                <button 
                  onClick={() => { setIsEasyMode(true); speak('easyLoginTitle'); }}
                  className="w-full mb-8 p-4 bg-accent/10 border-2 border-accent border-dashed rounded-[2rem] flex items-center justify-center gap-3 group hover:bg-accent/20 transition-all"
                >
                  <Mic size={20} className="text-accent group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-black uppercase tracking-widest text-accent italic">
                    {t('easy_login_prompt')} (Easy Login)
                  </span>
                </button>
              )}

              {isEasyMode ? (
                /* 4 EASY LOGIN CARDS */
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-2xl font-black dark:text-white uppercase italic tracking-tighter">{t('easyLoginTitle')}</h2>
                    <button onClick={() => setIsEasyMode(false)} className="text-[10px] font-black uppercase text-gray-400 hover:text-accent underline">
                      {isLogin ? t('loginTab') : t('signupTab')}
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Method 1: OTP Login (Recommended) */}
                    <button 
                      onClick={() => { handleForgotFlow('forgot-phone'); speak('otpLoginMethod'); }}
                      className="p-8 rounded-[3rem] border-2 border-accent bg-accent/5 shadow-xl shadow-accent/10 flex flex-col items-center gap-4 group relative overflow-hidden text-center"
                    >
                      <div className="absolute top-4 left-4 bg-accent text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest">{t('recommended')}</div>
                      <div className="w-20 h-20 bg-accent text-white rounded-[2rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <ShieldCheck size={40} />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-primary dark:text-white mb-1">{t('otpLoginMethod')}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('otpLarge')}</p>
                      </div>
                    </button>

                    {/* Method 2: Voice Login */}
                    <button 
                      onClick={() => { handleVoiceLogin(); speak('voiceLoginMethod'); }}
                      className="p-8 rounded-[3rem] border-2 border-gray-100 dark:border-slate-800 hover:border-accent flex flex-col items-center gap-4 group text-center"
                    >
                      <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 text-gray-400 group-hover:bg-accent/10 group-hover:text-accent rounded-[2rem] flex items-center justify-center transition-all">
                        <Mic size={40} />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-1">{t('voiceLoginMethod')}</p>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          {t('speakPhone')}
                        </p>
                      </div>
                    </button>

                    {/* Method 3: Face scan */}
                    <div className="p-8 rounded-[3rem] border-2 border-gray-100 dark:border-slate-800 opacity-60 flex flex-col items-center gap-4 text-center cursor-not-allowed">
                       <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 text-gray-300 rounded-[2rem] flex items-center justify-center">
                        <UserIcon size={40} />
                      </div>
                      <div>
                        <p className="text-sm font-black uppercase tracking-widest text-gray-400 mb-1">{t('faceLoginMethod')}</p>
                        <span className="inline-block bg-gray-100 dark:bg-slate-800 text-gray-400 px-2 py-0.5 rounded-full text-[8px] font-black uppercase">{t('comingSoon')}</span>
                      </div>
                    </div>

                    {/* Method 4: Help */}
                    <div className="relative group">
                      <button 
                        onClick={() => { setShowQR(!showQR); speak('helpMethod'); }}
                        className="w-full p-8 rounded-[3rem] border-2 border-gray-100 dark:border-slate-800 hover:border-accent flex flex-col items-center gap-4 group text-center"
                      >
                        <div className="w-20 h-20 bg-gray-50 dark:bg-slate-900 text-gray-400 group-hover:bg-accent/10 group-hover:text-accent rounded-[2rem] flex items-center justify-center transition-all">
                          <MessageCircle size={40} />
                        </div>
                        <div>
                          <p className="text-sm font-black uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-1">{t('helpMethod')}</p>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('audioGuide')}</p>
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {showQR && (
                          <motion.div 
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="absolute inset-0 bg-white dark:bg-slate-900 rounded-[3rem] p-6 flex flex-col items-center justify-center shadow-2xl border-2 border-accent z-20"
                          >
                            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">{t('scanQR')}</p>
                            <div className="w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
                               <div className="grid grid-cols-4 grid-rows-4 gap-1 w-24 h-24">
                                  {Array.from({length:16}).map((_,i) => <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? 'bg-primary' : 'bg-gray-100'}`} />)}
                               </div>
                            </div>
                            <button onClick={() => setShowQR(false)} className="text-[10px] font-black uppercase text-accent">
                              {t('close_btn')}
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className={cn("space-y-8 transition-all duration-500 relative z-10", !role && (isLogin ? "opacity-20 grayscale pointer-events-none" : "hidden"))}>
                  {isLogin ? (
                  /* LOGIN FORM */
                  <>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">
                        {role === 'worker' ? t('phoneLabel') : t('emailLabel')}
                      </label>
                      {role === 'worker' ? (
                        <div className="relative group flex items-center">
                          <div className="absolute left-8 flex items-center gap-3 pr-4 border-r border-white/10 text-white/40">
                            <span className="text-xl">🇵🇰</span>
                            <span className="font-black text-white/60 tracking-tighter text-lg">+92</span>
                          </div>
                          <input
                            type="tel"
                            required
                            placeholder="3XX XXXXXXX"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                            className="w-full pl-36 pr-8 py-6 glass border-white/5 rounded-[30px] font-black text-white outline-none focus:border-accent/50 focus:bg-white/5 transition-all tracking-[0.2em] text-xl shadow-inner italic"
                            style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                          />
                        </div>
                      ) : (
                        <div className="relative group">
                          <UserIcon className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={24} />
                          <input
                            type="email"
                            required
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full pl-20 pr-8 py-6 glass border-white/5 rounded-[30px] font-black text-white focus:border-accent/50 focus:bg-white/5 outline-none transition-all shadow-inner italic"
                            style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center px-2">
                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{t('passwordLabel')}</label>
                        <button type="button" onClick={() => handleForgotFlow('forgot-phone')} className="text-[10px] font-black text-accent uppercase tracking-widest hover:underline">{t('forgotPassword')}</button>
                      </div>
                      <div className="relative group">
                        <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-accent transition-colors" size={24} />
                        <input
                          type={showPassword ? "text" : "password"}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData({...formData, password: e.target.value})}
                          className="w-full pl-20 pr-16 py-6 glass border-white/5 rounded-[30px] font-black text-white focus:border-accent/50 focus:bg-white/5 outline-none transition-all shadow-inner tracking-[0.3em]"
                          style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-8 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                        >
                          {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 px-2">
                      <button
                        type="button"
                        onClick={() => setRememberMe(!rememberMe)}
                        className={cn(
                          "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center",
                          rememberMe ? "bg-accent border-accent text-primary-deeper shadow-[0_0_15px_rgba(56,189,248,0.4)]" : "border-white/10 glass"
                        )}
                      >
                        {rememberMe && <CheckCircle2 size={14} />}
                      </button>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{t('rememberMe')}</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary !w-full !py-6 !rounded-[40px] text-xl gap-4"
                    >
                      {isLoading ? <div className="w-8 h-8 border-4 border-primary-deeper border-t-transparent rounded-full animate-spin" /> : <>{t('loginTab')} <ArrowRight size={24} /></>}
                    </button>
                  </>
                ) : (
                  /* SIGNUP FORMS */
                  <>
                    {role === 'customer' ? (
                      /* CUSTOMER SIGNUP - GLASS STYLE */
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">{t('fullNameLabel')}</label>
                          <input
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                            className="w-full px-8 py-5 glass border-white/5 rounded-[30px] font-black text-white outline-none focus:border-accent/50 focus:bg-white/5 transition-all shadow-inner uppercase italic"
                            style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">{t('emailLabel')}</label>
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full px-8 py-5 glass border-white/5 rounded-[30px] font-black text-white outline-none focus:border-accent/50 focus:bg-white/5 transition-all shadow-inner italic"
                            style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                          />
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">{t('phoneLabel')} (Optional)</label>
                          <div className="relative group flex items-center">
                            <div className="absolute left-8 text-white/40 border-r border-white/10 pr-4 font-black">🇵🇰 +92</div>
                            <input
                              type="tel"
                              placeholder="3XX XXXXXXX"
                              value={formData.phone}
                              onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                              className="w-full pl-36 pr-8 py-5 glass border-white/5 rounded-[30px] font-black text-white outline-none focus:border-accent/50 focus:bg-white/5 transition-all shadow-inner tracking-[0.2em] italic"
                              style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                            />
                          </div>
                        </div>

                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30 ml-2">{t('cityLabel')}</label>
                          <select 
                            value={formData.city} 
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="w-full px-8 py-5 glass border-white/5 rounded-[30px] font-black text-white outline-none focus:border-accent/50 focus:bg-white/5 transition-all shadow-inner italic"
                            style={{ color: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                          >
                            <option value="" className="bg-primary-deeper">{t('select_city')}</option>
                            {CITIES.map(c => <option key={c} value={c} className="bg-primary-deeper">{c}</option>)}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">{t('passwordLabel')}</label>
                            <input
                              type="password"
                              required
                              value={formData.password}
                              onChange={(e) => setFormData({...formData, password: e.target.value})}
                              className="w-full px-8 py-5 glass border-white/5 rounded-[30px] font-black text-white outline-none focus:border-accent/50 focus:bg-white/5 transition-all shadow-inner tracking-[0.4em]"
                              style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                            />
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">{t('confirmPasswordLabel')}</label>
                            <input
                              type="password"
                              required
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                              className="w-full px-8 py-5 glass border-white/5 rounded-[30px] font-black text-white outline-none focus:border-accent/50 focus:bg-white/5 transition-all shadow-inner tracking-[0.4em]"
                              style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-4 p-6 glass border border-white/10 rounded-[30px]">
                          <input 
                            type="file" 
                            ref={profileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleProfilePhotoSelect} 
                          />
                          <input 
                            type="file" 
                            ref={profileCameraInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            capture="user"
                            onChange={handleProfilePhotoSelect} 
                          />
                          <div className="w-20 h-20 bg-white/5 rounded-2xl flex items-center justify-center text-white/20 border-2 border-dashed border-white/10 group overflow-hidden">
                            {profilePreview ? <img src={profilePreview} className="w-full h-full object-cover" alt="Profile" /> : <UserIcon size={40} />}
                          </div>
                          <div>
                            <div className="flex gap-4">
                              <button
                                type="button"
                                onClick={() => setShowProfileCamera(true)}
                                className="text-xs font-black text-accent uppercase tracking-widest hover:underline"
                              >
                                {t('takePhoto')}
                              </button>
                              <button 
                                type="button" 
                                onClick={() => profileInputRef.current?.click()}
                                className="text-xs font-black text-white/60 uppercase tracking-widest hover:underline"
                              >
                                {t('chooseGallery')}
                              </button>
                            </div>
                            <p className="text-[10px] text-white/30 font-bold uppercase tracking-widest mt-1">
                               {t('camera_access_req')}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 px-2">
                          <button
                            type="button"
                            onClick={() => setFormData({...formData, agreeTerms: !formData.agreeTerms})}
                            className={cn(
                              "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center shrink-0",
                              formData.agreeTerms ? "bg-accent border-accent text-primary-deeper" : "border-white/10 glass"
                            )}
                          >
                            {formData.agreeTerms && <CheckCircle2 size={14} />}
                          </button>
                          <span className="text-[10px] font-black uppercase tracking-widest text-white/40 leading-tight">
                            {t('agreeTerms')}
                          </span>
                        </div>

                        <button
                          type="submit"
                          disabled={!formData.agreeTerms}
                          className="btn-primary !w-full !py-6 !rounded-[40px] text-lg uppercase tracking-widest mt-6 disabled:opacity-30 disabled:grayscale"
                        >
                          {t('createAccountBtn')}
                        </button>
                      </div>
                    ) : (
                      /* WORKER SIGNUP (MULTI-STEP) */
                      <div className="space-y-6">
                        {workerStep === 1 && (
                          <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('fullNameLabel')}</label>
                              <input type="text" required className="w-full px-6 py-5 bg-gray-50 dark:bg-slate-900 rounded-3xl font-bold outline-none border border-gray-100 focus:border-accent" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('phoneLabel')}</label>
                              <div className="relative flex items-center">
                                <div className="absolute left-6 text-gray-400 border-r border-gray-200 pr-3 font-bold">🇵🇰 +92</div>
                                <input 
                                  type="tel" 
                                  required 
                                  className="w-full pl-32 pr-6 py-5 bg-gray-50 dark:bg-slate-900 rounded-3xl font-bold outline-none border border-gray-100 focus:border-accent" 
                                  value={formData.phone}
                                  onChange={e => setFormData({...formData, phone: e.target.value})}
                                  style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }} 
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('cityLabel')}</label>
                                <select 
                                  className="w-full px-6 py-5 bg-gray-50 dark:bg-slate-900 rounded-3xl font-bold outline-none border border-gray-100 focus:border-accent" 
                                  value={formData.city}
                                  onChange={e => setFormData({...formData, city: e.target.value})}
                                  style={{ color: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                                >
                                  <option value="">{t('select_city')}</option>
                                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('areaMohalla')}</label>
                                <input 
                                  type="text" 
                                  placeholder="Area" 
                                  className="w-full px-6 py-5 bg-gray-50 dark:bg-slate-900 rounded-3xl font-bold outline-none border border-gray-100 focus:border-accent" 
                                  value={formData.area}
                                  onChange={e => setFormData({...formData, area: e.target.value})}
                                  style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }} 
                                />
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('cnicNumber')}</label>
                              <input 
                                type="text" 
                                required 
                                placeholder="XXXXX-XXXXXXX-X" 
                                className="w-full px-6 py-5 bg-gray-50 dark:bg-slate-900 rounded-3xl font-bold outline-none border border-gray-100 focus:border-accent tracking-widest" 
                                value={formData.cnic}
                                onChange={e => setFormData({...formData, cnic: e.target.value})}
                                style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }} 
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('description')}</label>
                              <textarea
                                placeholder={language === 'urdu' ? 'اپنی مہارت اور تجربہ یہاں لکھیں' : language === 'roman' ? 'Apni skills aur tajurba yahan likhen' : 'Describe your skills, experience and services'}
                                className="w-full px-6 py-5 bg-gray-50 dark:bg-slate-900 rounded-3xl font-bold outline-none border border-gray-100 focus:border-accent min-h-[120px]"
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                              />
                            </div>
                            <div
                              onClick={() => setShowProfileCamera(true)}
                              className="p-8 border-4 border-dashed border-gray-100 dark:border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center gap-4 bg-gray-50/50 hover:bg-gray-50 transition-all cursor-pointer group"
                            >
                               <div className="w-20 h-20 bg-accent text-white rounded-3xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                  <Camera size={40} />
                               </div>
                               <span className="text-sm font-black uppercase tracking-widest text-primary dark:text-accent">
                                 {t('take_profile_photo')}
                               </span>
                               <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                                 {t('req_verification')}
                               </p>
                            </div>
                          </div>
                        )}

                        {workerStep === 2 && (
                          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                             <div>
                               <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1 mb-4 block">{t('selectTrade')}</label>
                               <div className="grid grid-cols-3 gap-3">
                                  {TRADES.map(trade => (
                                    <button
                                      key={trade.id}
                                      type="button"
                                      onClick={() => setFormData({...formData, trade: trade.id})}
                                      className={cn(
                                        "p-4 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-2 relative",
                                        formData.trade === trade.id ? "border-accent bg-accent/5 shadow-lg" : "border-gray-100 dark:border-slate-800"
                                      )}
                                    >
                                      <span className="text-3xl">{trade.icon}</span>
                                      <span className={cn("text-[10px] font-black uppercase tracking-tighter", formData.trade === trade.id ? "text-primary dark:text-white" : "text-gray-400")}>{trade.label}</span>
                                    </button>
                                  ))}
                               </div>
                             </div>

                             <div className="space-y-4">
                               <div className="flex justify-between items-center">
                                 <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('experience')}</label>
                                 <span className="text-xl font-black text-accent">{formData.experience} {t('years_label')}</span>
                               </div>
                               <input 
                                 type="range" 
                                 min="1" 
                                 max="25" 
                                 value={formData.experience} 
                                 onChange={e => setFormData({...formData, experience: parseInt(e.target.value)})}
                                 className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full appearance-none accent-accent cursor-pointer"
                               />
                             </div>

                             <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{t('service_areas_label')}</label>
                                <div className="flex flex-wrap gap-2">
                                  {['Area 1', 'Area 2', 'Area 3', 'Area 4', 'Area 5'].map(area => (
                                    <button
                                      key={area}
                                      type="button"
                                      onClick={() => {
                                        const areas = formData.serviceAreas.includes(area) ? formData.serviceAreas.filter(a => a !== area) : [...formData.serviceAreas, area];
                                        setFormData({...formData, serviceAreas: areas});
                                      }}
                                      className={cn(
                                        "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border-2",
                                        formData.serviceAreas.includes(area) ? "bg-accent border-accent text-white shadow-lg" : "bg-gray-50 border-gray-100 text-gray-400"
                                      )}
                                    >
                                      {area}
                                    </button>
                                  ))}
                                </div>
                             </div>
                          </div>
                        )}

                        {workerStep === 3 && (
                          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
                             {[
                               { id: 'minCharge', label: t('minCharge'), base: 500 },
                               { id: 'hourlyRate', label: t('hourlyRate'), base: 300 },
                               { id: 'visitCharge', label: t('visitCharge'), base: 200 },
                             ].map((priceItem) => {
                               const verdict = getPriceVerdict((formData as any)[priceItem.id], priceItem.base);
                               return (
                                 <div key={priceItem.id} className="space-y-4">
                                   <div className="flex justify-between items-end">
                                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-1">{priceItem.label}</label>
                                      <div className="text-right">
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest block mb-1", verdict.color)}>{verdict.label}</span>
                                        <span className="text-2xl font-black text-primary dark:text-white">Rs. {(formData as any)[priceItem.id]}</span>
                                      </div>
                                   </div>
                                   <input 
                                     type="range" 
                                     min="100" 
                                     max="2000" 
                                     step="50"
                                     value={(formData as any)[priceItem.id]} 
                                     onChange={e => setFormData({...formData, [priceItem.id]: parseInt(e.target.value)})}
                                     className="w-full h-3 bg-gray-100 dark:bg-slate-800 rounded-full appearance-none accent-accent cursor-pointer"
                                   />
                                   <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase tracking-widest px-1">
                                      <span>{t('sasta')}</span>
                                      <span>{t('mehnga')}</span>
                                   </div>
                                 </div>
                               );
                             })}
                          </div>
                        )}

                        {workerStep === 4 && (
                          <div className="space-y-10 py-10 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
                            <input 
                              type="file" 
                              ref={profileInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              onChange={handleProfilePhotoSelect} 
                            />
                            <input 
                              type="file" 
                              ref={profileCameraInputRef} 
                              className="hidden" 
                              accept="image/*" 
                              capture="user"
                              onChange={handleProfilePhotoSelect} 
                            />
                            <div className="relative inline-block">
                              <div
                                onClick={() => setShowProfileCamera(true)}
                                className={cn(
                                  "w-56 h-56 rounded-full border-4 border-dashed flex items-center justify-center cursor-pointer transition-all overflow-hidden group",
                                  profilePreview ? "border-accent" : "border-white/10 hover:border-accent/40"
                                )}
                              >
                                {profilePreview ? (
                                  <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="text-center">
                                    <Camera size={64} className="text-white/20 group-hover:text-accent/40 transition-colors mx-auto mb-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30">{t('addProfilePhoto')}</span>
                                  </div>
                                )}
                              </div>
                              {profilePreview && (
                                <button 
                                  onClick={() => { setProfilePhoto(null); setProfilePreview(null); }}
                                  className="absolute bottom-4 right-4 bg-red-500 text-white p-2 rounded-full shadow-lg"
                                >
                                  <X size={20} />
                                </button>
                              )}
                            </div>
                            <div>
                               <h3 className="text-xl font-black text-white italic tracking-tighter uppercase mb-2">{t('profilePhoto')}</h3>
                               <div className="flex justify-center gap-3 mt-6">
                                 <button 
                                   type="button"
                                   onClick={() => profileInputRef.current?.click()}
                                   className="px-6 py-3 glass border-white/5 rounded-full text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2"
                                 >
                                   <ImageIcon size={14} /> {t('chooseGallery')}
                                 </button>
                                 <button
                                   type="button"
                                   onClick={() => setShowProfileCamera(true)}
                                   className="px-6 py-3 bg-accent text-primary-deeper rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
                                 >
                                   <Camera size={14} /> {t('takePhoto')}
                                 </button>
                               </div>
                            </div>
                          </div>
                        )}

                        {workerStep === 5 && (
                          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                             <div className="text-center md:text-left mb-6">
                                <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter mb-2">Apna kaam dikhayein</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('portfolioSubtitle')}</p>
                             </div>

                             <input 
                               type="file" 
                               ref={portfolioInputRef} 
                               className="hidden" 
                               accept="image/*" 
                               multiple 
                               onChange={handlePortfolioSelect} 
                             />
                             <input 
                               type="file" 
                               ref={portfolioCameraInputRef} 
                               className="hidden" 
                               accept="image/*" 
                               capture="environment"
                               onChange={handlePortfolioSelect} 
                             />

                             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {portfolioItems.map((item, index) => (
                                  <div key={index} className="relative aspect-square rounded-3xl overflow-hidden glass border border-white/10 group">
                                     <img src={item.preview} alt="Work" className="w-full h-full object-cover" />
                                     <button 
                                       onClick={() => removePortfolioItem(index)}
                                       className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity"
                                     >
                                       <X size={14} />
                                     </button>
                                     <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                                        <input 
                                          type="text" 
                                          placeholder="Add caption..." 
                                          value={item.caption}
                                          onChange={(e) => updatePortfolioCaption(index, e.target.value)}
                                          className="w-full bg-transparent border-none text-[10px] text-white outline-none placeholder:text-white/40"
                                        />
                                     </div>
                                  </div>
                                ))}
                                {portfolioItems.length < 12 && (
                                  <div className="flex gap-2">
                                    <button 
                                      onClick={() => portfolioInputRef.current?.click()}
                                      className="flex-1 aspect-square rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-accent/40 transition-all group glass"
                                    >
                                      <ImageIcon size={24} className="text-white/20 group-hover:text-accent" />
                                      <span className="text-[8px] font-black uppercase tracking-widest text-white/20 group-hover:text-white">{t('chooseGallery')}</span>
                                    </button>
                                    <button
                                      onClick={() => setShowPortfolioCamera(true)}
                                      className="flex-1 aspect-square rounded-3xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-accent/40 transition-all group glass"
                                    >
                                      <Camera size={24} className="text-white/20 group-hover:text-accent" />
                                      <span className="text-[8px] font-black uppercase tracking-widest text-white/20 group-hover:text-white">{t('takePhoto')}</span>
                                    </button>
                                  </div>
                                )}
                             </div>
                             
                             <div className="flex justify-between items-center px-2">
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest",
                                  portfolioItems.length < 2 ? "text-red-500" : "text-green-500"
                                )}>
                                  {portfolioItems.length} / 12 photos
                                </span>
                                <span className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">
                                  {t('minPhotosReq')}
                                </span>
                             </div>
                          </div>
                        )}

                        {workerStep === 6 && (
                          <div className="space-y-10 py-10 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
                             <div className="space-y-4">
                               <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">{t('recordBio')}</p>
                               <button 
                                 type="button" 
                                 onClick={handleVoiceBio}
                                 className={cn(
                                   "w-32 h-32 rounded-full border-8 transition-all flex items-center justify-center mx-auto relative",
                                   isRecording ? "bg-red-500 border-red-200 animate-pulse scale-110" : "bg-accent border-accent/20 shadow-2xl shadow-accent/40"
                                 )}
                               >
                                  <Mic size={48} className="text-white" />
                                  {isRecording && <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-20" />}
                               </button>
                               <p className={cn("text-xs font-black uppercase tracking-widest", isRecording ? "text-red-500" : "text-gray-400")}>
                                  {isRecording ? (language === 'urdu' ? 'ریکارڈ ہو رہا ہے...' : language === 'roman' ? 'Recording ho rahi hai...' : 'Recording... (Speak now)') : (language === 'urdu' ? 'ریکارڈ کرنے کے لیے دبائیں' : language === 'roman' ? 'Record karne ke liye dabayein' : 'Tap to start recording')}
                               </p>
                             </div>
                             <div>
                                <button type="button" onClick={() => setWorkerStep(7)} className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-accent decoration-accent decoration-2 underline-offset-4">
                                  {language === 'urdu' ? 'چھوڑ دیں' : language === 'roman' ? 'Chorh dein' : 'Skip'}
                                </button>
                             </div>
                          </div>
                        )}

                        {workerStep === 7 && (
                          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                             <div className="text-center md:text-left mb-6">
                                <h3 className="text-xl font-black dark:text-white uppercase italic tracking-tighter mb-2">{t('verification')}</h3>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t('verificationNote')}</p>
                             </div>

                             <div className="grid grid-cols-2 gap-4">
                                {['Front Side', 'Back Side'].map(side => (
                                  <button
                                    key={side}
                                    type="button"
                                    className="aspect-video bg-gray-50 dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center gap-2 hover:bg-gray-100 transition-all group"
                                  >
                                     <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-accent">
                                        <Users size={20} />
                                     </div>
                                     <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                                       {side === 'Front Side' ? (language === 'urdu' ? 'سامنے کی تصویر' : language === 'roman' ? 'Samnay ki photo' : 'Front Side') : (language === 'urdu' ? 'پیچھے کی تصویر' : language === 'roman' ? 'Peechay ki photo' : 'Back Side')}
                                     </span>
                                  </button>
                                ))}
                             </div>

                             <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-3xl border border-amber-100 dark:border-amber-900/30 flex gap-4">
                                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/40 rounded-xl flex items-center justify-center text-amber-600 shrink-0">
                                   <Lock size={18} />
                                </div>
                                <p className="text-[10px] font-bold text-amber-900/60 dark:text-amber-500 leading-relaxed uppercase tracking-wider">
                                  {language === 'urdu' ? 'آپ کا ڈیٹا محفوظ ہے۔ ہم صرف آپ کی شناخت کی تصدیق کے لیے یہ دستاویزات استعمال کریں گے۔' : language === 'roman' ? 'Aap ka data mehfooz hai. Hum sirf aap ki identity verify karne ke liye ye documents use karenge.' : 'Your data is secure. These documents are only used for identity verification.'}
                                </p>
                             </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full py-5 bg-primary text-white rounded-[2.5rem] font-black text-lg shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                        >
                          {workerStep === totalWorkerSteps ? t('createAccountBtn') : (language === 'urdu' ? 'اگلا مرحلہ' : language === 'roman' ? 'Agla Marhala' : 'Next Step') + ' →'}
                        </button>
                      </div>
                    )}
                  </>
                )}

                {!isEasyMode && (
                  <div className="space-y-4 pt-8">
                    <div className="flex items-center gap-6 py-4">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em]">{t('or')}</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <button 
                        type="button"
                        onClick={() => toast.success('Connecting to Google...')}
                        className="w-full py-5 glass border-white/5 rounded-[25px] flex items-center justify-center gap-4 font-black text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-all hover:bg-white/5"
                      >
                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-6 h-6 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100" />
                        Google
                      </button>
                      <button 
                        type="button"
                        onClick={() => toast.success('Connecting to FB...')}
                        className="w-full py-5 glass border-white/5 rounded-[25px] flex items-center justify-center gap-4 font-black text-[10px] uppercase tracking-widest text-white/50 hover:text-white transition-all hover:bg-white/5"
                      >
                        <svg className="w-6 h-6 fill-white/50" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        Facebook
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-10">
                  <button
                    type="button"
                    onClick={handleVoiceLogin}
                    className={cn(
                      "w-full py-6 rounded-[30px] font-black text-xs uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all relative overflow-hidden group",
                      isListening ? "bg-red-500/20 text-red-500 animate-pulse border-2 border-red-500/30" : "glass border-white/5 text-accent hover:border-accent/40"
                    )}
                  >
                    <Mic size={24} className={isListening ? "animate-bounce" : "group-hover:scale-110 transition-transform"} />
                    {isListening ? (language === 'urdu' ? 'سن رہا ہوں...' : language === 'roman' ? 'Sun raha hoon...' : 'Listening...') : t('voiceLogin')}
                    {isListening && <div className="absolute inset-0 bg-red-500/10 animate-ping pointer-events-none" />}
                  </button>
                </div>

                <p className="text-center text-[10px] font-black text-white/30 uppercase tracking-[0.3em] py-12">
                  {isLogin ? t('noAccount') : t('hasAccount')}{" "}
                  <button 
                    type="button"
                    onClick={() => { 
                      setIsLogin(!isLogin); 
                      navigate(`/auth?mode=${isLogin ? 'signup' : 'login'}`);
                      if (isLogin) setWorkerStep(1);
                    }}
                    className="text-accent hover:text-white transition-colors underline underline-offset-8 ml-2"
                  >
                    {isLogin ? (language === 'urdu' ? 'نیا اکاؤنٹ بنائیں' : language === 'roman' ? 'Naya account banayein' : 'Register Now') : (language === 'urdu' ? 'لاگ ان کریں' : language === 'roman' ? 'Login karein' : 'Login Now')}
                  </button>
                </p>
              </form>
            )}
          </>
        ) : (
          /* FORGOT PASSWORD FLOW */
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-10"
          >
            <button 
              onClick={() => setStep('auth')}
              className="flex items-center gap-2 text-white/40 hover:text-accent font-black text-[10px] uppercase tracking-widest transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              {t('back_btn')}
            </button>

            <div className="text-center md:text-left">
              <h2 className="text-4xl font-black text-white mb-4 uppercase italic tracking-tighter italic underline decoration-accent/40 decoration-8 underline-offset-[10px]">
                {step === 'forgot-phone' ? t('forgotPassword') : step === 'forgot-otp' ? t('otpTitle') : t('newPasswordTitle')}
              </h2>
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest leading-relaxed">
                {step === 'forgot-phone' ? t('forgot_phone_prompt') : step === 'forgot-otp' ? t('otpSent') : t('new_password_prompt')}
              </p>
            </div>

            {step === 'forgot-phone' && (
              <div className="space-y-6">
                {role === 'worker' ? (
                  <div className="relative group flex items-center">
                    <div className="absolute left-8 flex items-center gap-3 pr-4 border-r border-white/10 text-white/40">
                      <span className="text-xl">🇵🇰</span>
                      <span className="font-black text-white/60 tracking-tighter text-lg">+92</span>
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="3XX XXXXXXX"
                      autoFocus
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10)})}
                      className="w-full pl-36 pr-8 py-6 glass border-white/5 rounded-[30px] font-black text-white outline-none focus:border-accent/50 text-2xl tracking-[0.2em] shadow-inner italic"
                      style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                    />
                  </div>
                ) : (
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-2">{t('emailLabel')}</label>
                     <input
                       type="email"
                       required
                       autoFocus
                       placeholder="your@email.com"
                       value={formData.email}
                       onChange={(e) => setFormData({...formData, email: e.target.value})}
                       className="w-full px-8 py-6 glass border-white/5 rounded-[30px] font-black text-white outline-none focus:border-accent/50 shadow-inner italic"
                       style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                     />
                  </div>
                )}

                <button
                  onClick={() => {
                    if (role === 'worker') {
                      handleForgotFlow('forgot-otp');
                    } else {
                      toast.success(t('checkEmail'));
                      speak('checkEmail');
                    }
                  }}
                  className="btn-primary !w-full !py-6 !rounded-[40px] text-lg uppercase tracking-widest"
                >
                  {role === 'worker' ? t('send_code_btn') : t('send_link_btn')}
                </button>
              </div>
            )}

            {step === 'forgot-otp' && (
              <div className="space-y-12">
                <div className="flex justify-between gap-4 px-2">
                  {formData.otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={otpRefs[i]}
                      type="tel"
                      inputMode="numeric"
                      maxLength={1}
                      autoFocus={i === 0}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-20 h-28 text-center text-5xl font-black glass border-white/5 rounded-[30px] text-white outline-none focus:border-accent focus:bg-white/5 transition-all shadow-inner italic"
                      style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                    />
                  ))}
                </div>
                <button
                  onClick={() => {
                     if (role === 'worker') {
                       login({ id: 'w1', fullName: 'Ustaad', phone: formData.phone, role: 'worker', isVerified: true });
                       navigate('/worker-dashboard');
                     } else {
                       handleForgotFlow('forgot-new-password');
                     }
                  }}
                  className="btn-primary !w-full !py-6 !rounded-[40px] text-lg uppercase tracking-widest"
                >
                  {role === 'worker' ? t('loginTab') : t('verify_continue_btn')}
                </button>
                <p className="text-center text-[10px] font-black uppercase text-white/30 tracking-[0.3em]">{t('code_not_received')} <button className="text-accent hover:underline" onClick={() => speak('otpSent')}>{t('resend_btn')}</button></p>
              </div>
            )}

            {step === 'forgot-new-password' && (
              <div className="space-y-6">
                 <div className="relative group">
                  <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20" size={24} />
                  <input
                    type="password"
                    placeholder="Enter New Password"
                    className="w-full pl-20 pr-8 py-6 glass rounded-[30px] font-black text-white border-white/5 outline-none focus:border-accent/50 shadow-inner tracking-[0.4em]"
                    style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                  />
                </div>
                <div className="relative group">
                  <Lock className="absolute left-8 top-1/2 -translate-y-1/2 text-white/20" size={24} />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full pl-20 pr-8 py-6 glass rounded-[30px] font-black text-white border-white/5 outline-none focus:border-accent/50 shadow-inner tracking-[0.4em]"
                    style={{ color: '#FFFFFF', WebkitTextFillColor: '#FFFFFF', background: 'rgba(0, 0, 0, 0.35)', border: '1px solid rgba(255, 255, 255, 0.25)' }}
                  />
                </div>
                <button
                  onClick={() => { toast.success('Password updated!'); setStep('auth'); }}
                  className="btn-primary !w-full !py-6 !rounded-[40px] text-lg uppercase tracking-widest"
                >
                  {t('confirmBtn')}
                </button>
              </div>
            )}

            <div className="flex items-center justify-center pt-12">
               <button onClick={() => speak(step === 'forgot-phone' ? 'speakPhone' : 'speakOTP')} className="flex items-center gap-4 text-accent font-black text-[10px] uppercase tracking-[0.2em] glass px-8 py-4 rounded-full border-white/5 hover:bg-white/5 transition-all">
                  <Mic size={20} /> {t('listen_guide_again')}
               </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>

    {/* Camera Modals */}
    <CameraCapture
      isOpen={showProfileCamera}
      onClose={() => setShowProfileCamera(false)}
      onCapture={handleProfileCameraCapture}
      title={language === 'urdu' ? 'پروفائل فوٹو' : language === 'roman' ? 'Profile Photo' : 'Take Profile Photo'}
    />

    <CameraCapture
      isOpen={showPortfolioCamera}
      onClose={() => setShowPortfolioCamera(false)}
      onCapture={handlePortfolioCameraCapture}
      title={language === 'urdu' ? 'کام کی تصویر' : language === 'roman' ? 'Kaam ki Photo' : 'Take Work Photo'}
    />
  </div>
);
}
