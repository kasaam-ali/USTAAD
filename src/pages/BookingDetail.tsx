import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Calendar, Clock, MapPin, Phone, 
  CheckCircle2, ArrowLeft, ShieldCheck 
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

export default function BookingDetail() {
  const { id } = useParams();
  const { role } = useAuth();
  const { language, t } = useLanguage();

  return (
    <div className="pt-24 pb-32 min-h-screen bg-transparent">
      <div className="max-w-3xl mx-auto px-6">
        <Link to={role === 'worker' ? '/worker-dashboard' : '/home'} className="flex items-center gap-2 text-white/40 hover:text-accent font-black text-[10px] uppercase tracking-widest transition-colors mb-8">
          <ArrowLeft size={16} />
          {t('back_to_dashboard')}
        </Link>

        <div className="glass rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden">
          <div className="bg-primary-dark p-8 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <ShieldCheck size={120} />
            </div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">{t('booking_id')}</p>
                <h1 className="text-3xl font-black uppercase tracking-tighter italic">#{id}</h1>
              </div>
              <div className="bg-accent text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                {t('confirmed_status')}
              </div>
            </div>
            <div className="flex gap-8">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{t('date_label')}</p>
                  <p className="font-bold flex items-center gap-2 text-sm"><Calendar size={14} /> Oct 24, 2023</p>
               </div>
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-1">{t('time_label')}</p>
                  <p className="font-bold flex items-center gap-2 text-sm"><Clock size={14} /> 10:30 AM</p>
               </div>
            </div>
          </div>

          <div className="p-8 space-y-10">
            {/* Status Steps */}
            <div className="flex justify-between relative px-4">
               <div className="absolute top-1/2 left-8 right-8 h-0.5 bg-white/5 z-0" />
               {[
                 { label: 'Booked', done: true },
                 { label: 'On Way', done: true },
                 { label: 'Started', done: false },
                 { label: 'Done', done: false },
               ].map((step, i) => (
                 <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-4 ${step.done ? 'bg-accent border-accent/20 text-primary' : 'bg-[#0F172A] border-white/10 text-white/20'}`}>
                       {step.done ? <CheckCircle2 size={14} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <span className={`text-[8px] font-black uppercase tracking-widest ${step.done ? 'text-white' : 'text-white/20'}`}>{step.label}</span>
                 </div>
               ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
               <div className="space-y-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white underline decoration-accent decoration-4 underline-offset-4">
                    {role === 'worker' ? 'Customer Details' : 'Worker Details'}
                  </h3>
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-accent text-xl font-black border border-white/5">
                        {role === 'worker' ? 'AA' : 'BA'}
                     </div>
                     <div>
                        <p className="font-black text-white">{role === 'worker' ? 'Ahmed Ali' : 'Babar Azam'}</p>
                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest flex items-center gap-1">
                           <Phone size={10} /> +92 300 1234567
                        </p>
                     </div>
                  </div>
                  <div className="flex items-start gap-3">
                     <MapPin className="text-accent shrink-0 mt-1" size={18} />
                     <p className="text-sm font-bold text-white/60 leading-relaxed uppercase tracking-widest">
                        House 123, Street 4, Phase 5, DHA, Karachi
                     </p>
                  </div>
               </div>

               <div className="space-y-6 bg-white/5 p-6 rounded-3xl border border-white/5">
                  <h3 className="text-sm font-black uppercase tracking-widest text-white">{t('price_summary')}</h3>
                  <div className="space-y-3">
                     <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        <span>{t('service_charge')}</span>
                        <span>Rs. 1,500</span>
                     </div>
                     <div className="flex justify-between text-[10px] font-bold text-white/40 uppercase tracking-widest">
                        <span>{t('visit_fee')}</span>
                        <span>Rs. 200</span>
                     </div>
                     <div className="h-px bg-white/5 my-2" />
                     <div className="flex justify-between font-black text-lg text-white uppercase tracking-tighter italic">
                        <span>{t('total_label')}</span>
                        <span className="text-accent">Rs. 1,700</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="pt-6">
               <button className="w-full py-5 bg-accent text-primary rounded-[2rem] font-black text-lg shadow-xl shadow-accent/20 hover:scale-[1.02] transition-all uppercase tracking-tighter italic">
                  {role === 'worker' ? 'Update Status' : 'Contact Support'}
               </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
