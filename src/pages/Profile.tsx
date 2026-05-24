import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { LogOut, User as UserIcon, ShieldCheck, Camera, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Profile() {
  const { user, role, logout, login } = useAuth();
  const { t } = useLanguage();
  const [isUploading, setIsUploading] = useState(false);

  const cameraInputRef = React.useRef<HTMLInputElement>(null);
  const galleryInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = async (file: File) => {
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
        
        // Update ustaad_users
        const users = JSON.parse(localStorage.getItem('ustaad_users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === user.id);
        if (userIndex !== -1) {
          users[userIndex].profilePhotoURL = base64data;
          localStorage.setItem('ustaad_users', JSON.stringify(users));
        }

        // Update ustaad_specialists if role is worker
        if (role === 'worker') {
          const specialists = JSON.parse(localStorage.getItem('ustaad_specialists') || '[]');
          const workerIndex = specialists.findIndex((w: any) => w.id === user.id);
          if (workerIndex !== -1) {
            specialists[workerIndex].profilePhotoURL = base64data;
            localStorage.setItem('ustaad_specialists', JSON.stringify(specialists));
          }
        }

        login({ ...user, profilePhotoURL: base64data });
        toast.success('Profile photo updated!');
        setIsUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="pt-32 pb-32 min-h-screen bg-transparent flex items-center justify-center px-6">
      <input 
        type="file" 
        ref={galleryInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        className="hidden" 
        accept="image/*" 
        capture="user"
        onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])} 
      />

      <div className="max-w-md w-full glass rounded-[3rem] p-10 border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <ShieldCheck size={120} />
        </div>
        
        <div className="flex flex-col items-center text-center">
          <div className="relative group mb-6">
            <div className="w-24 h-24 bg-accent rounded-[2.5rem] flex items-center justify-center text-primary text-4xl font-black shadow-xl shadow-accent/20 overflow-hidden">
              {isUploading ? (
                <div className="w-full h-full flex items-center justify-center bg-black/20">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              ) : user?.profilePhotoURL ? (
                <img src={user.profilePhotoURL} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                user?.fullName.charAt(0)
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 flex gap-1">
              <button 
                onClick={() => cameraInputRef.current?.click()}
                className="bg-accent text-primary-deeper p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera size={14} />
              </button>
              <button 
                onClick={() => galleryInputRef.current?.click()}
                className="bg-white/10 text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md"
              >
                <ImageIcon size={14} />
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter italic mb-1">{user?.fullName}</h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-8 px-4 py-1.5 bg-white/5 rounded-full">
            {role === 'customer' ? t('customerRole') : t('workerRole')}
          </p>
          
          <div className="w-full space-y-4 mb-10">
            <div className="p-4 rounded-2xl bg-white/5 text-left border border-white/5">
              <p className="text-[8px] font-black uppercase text-white/40 tracking-widest mb-1">{t('phoneLabel')}</p>
              <p className="font-bold text-white">+92 {user?.phone}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 text-left border border-white/5">
              <p className="text-[8px] font-black uppercase text-white/40 tracking-widest mb-1">{t('acc_status')}</p>
              <p className={user?.isVerified ? "font-bold text-green-500" : "font-bold text-amber-500"}>
                {user?.isVerified ? t('verified') : t('verif_pending')}
              </p>
            </div>
          </div>

          <button 
            onClick={logout}
            className="w-full py-5 bg-red-500/10 text-red-500 rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 hover:bg-red-500/20 transition-all uppercase tracking-widest border border-red-500/10"
          >
            <LogOut size={18} />
            {t('logout_btn')}
          </button>
        </div>
      </div>
    </div>
  );
}
