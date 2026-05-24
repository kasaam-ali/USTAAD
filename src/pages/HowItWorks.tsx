import React from 'react';
import { motion } from 'motion/react';
import { MessageSquare, UserCheck, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { Link } from 'react-router-dom';

export default function HowItWorks() {
  const { language, t } = useLanguage();

  const steps = [
    {
      id: 1,
      icon: MessageSquare,
      title: t('step_01'),
      desc: t('step_01_desc'),
      gradient: 'from-[#A855F7] to-[#7C3AED]'
    },
    {
      id: 2,
      icon: UserCheck,
      title: t('step_02'),
      desc: t('step_02_desc'),
      gradient: 'from-[#2563EB] to-[#1E40AF]'
    },
    {
      id: 3,
      icon: Sparkles,
      title: t('step_03'),
      desc: t('step_03_desc'),
      gradient: 'from-[#06B6D4] to-[#0891B2]'
    },
    {
      id: 4,
      icon: CheckCircle2,
      title: t('step_04'),
      desc: t('step_04_desc'),
      gradient: 'from-[#22C55E] to-[#16A34A]'
    }
  ];

  return (
    <div className="pt-28 pb-32 min-h-screen px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-black uppercase tracking-[0.2em] mb-6"
          >
            {language === 'urdu' ? '4 آسان مراحل' : language === 'roman' ? '4 asaan kadam' : 'Simple 4-Step Process'}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-6xl md:text-7xl font-black text-white mb-8 tracking-tighter italic uppercase"
          >
            {t('how_title')}
          </motion.h1>
        </div>

        {/* Timeline Section */}
        <div className="relative max-w-5xl mx-auto">
          {/* Vertical Center Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 bg-gradient-to-b from-transparent via-[#38BDF8] via-[#2563EB] to-transparent opacity-50 hidden md:block" />

          <div className="space-y-12 md:space-y-0">
            {steps.map((step, idx) => {
              const isLeft = idx % 2 === 0;
              return (
                <div key={step.id} className="relative md:flex items-center justify-between md:mb-32 last:mb-0">
                  {/* Dot on Line */}
                  <div className="hidden md:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
                    <div className="w-3.5 h-3.5 bg-[#38BDF8] border-[3px] border-[#0F172A] rounded-full relative">
                      <div className="absolute inset-0 bg-[#38BDF8] rounded-full animate-ping opacity-75" />
                    </div>
                  </div>

                  {/* Left Side Content */}
                  <div className="md:w-[45%]">
                    {isLeft ? (
                      <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="group relative"
                      >
                        <div className="text-right pr-0 md:pr-12 py-8 rounded-[2rem] transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] md:hover:bg-white/5">
                          <div className="flex justify-end gap-4 mb-4">
                            <div className="order-1 text-right">
                              <span className="text-[#38BDF8] text-xs font-semibold tracking-widest block mb-1 uppercase tracking-widest">{language === 'urdu' ? 'مرحلہ' : 'STEP'} 0{step.id}</span>
                              <h3 className="text-2xl font-semibold text-white tracking-tight uppercase italic">{step.title}</h3>
                            </div>
                            <div className={`w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg shrink-0 order-2`}>
                              <step.icon size={24} />
                            </div>
                          </div>
                          <p className="text-white/55 text-sm md:text-md leading-relaxed font-medium mb-6">
                            {step.desc}
                          </p>
                          <div className="inline-flex items-center gap-2 text-[#38BDF8] text-xs font-bold uppercase tracking-widest cursor-pointer hover:underline hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all">
                            {t('learn_more')} <ArrowRight size={14} />
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </div>

                  {/* Spacer for Mobile */}
                  <div className="md:hidden h-12 flex items-center justify-center">
                    <div className="w-[1px] h-full bg-white/10" />
                  </div>

                  {/* Right Side Content */}
                  <div className="md:w-[45%]">
                    {!isLeft ? (
                      <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="group relative"
                      >
                        <div className="text-left pl-0 md:pl-12 py-8 rounded-[2rem] transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] md:hover:bg-white/5">
                          <div className="flex justify-start gap-4 mb-4">
                            <div className={`w-[52px] h-[52px] rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center text-white shadow-lg shrink-0`}>
                              <step.icon size={24} />
                            </div>
                            <div>
                              <span className="text-[#38BDF8] text-xs font-semibold tracking-widest block mb-1 uppercase tracking-widest">{language === 'urdu' ? 'مرحلہ' : 'STEP'} 0{step.id}</span>
                              <h3 className="text-2xl font-semibold text-white tracking-tight uppercase italic">{step.title}</h3>
                            </div>
                          </div>
                          <p className="text-white/55 text-sm md:text-md leading-relaxed font-medium mb-6">
                            {step.desc}
                          </p>
                          <div className="inline-flex items-center gap-2 text-[#38BDF8] text-xs font-bold uppercase tracking-widest cursor-pointer hover:underline hover:drop-shadow-[0_0_10px_rgba(56,189,248,0.5)] transition-all">
                            {t('learn_more')} <ArrowRight size={14} />
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="mt-40 p-12 glass rounded-[4rem] text-center relative overflow-hidden border-white/10 shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
          
          <h2 className="text-5xl font-black mb-6 tracking-tight relative z-10 text-white italic uppercase">{t('ready_btn')}?</h2>
          <p className="text-white/50 mb-10 text-lg font-medium relative z-10">{t('hero_subtitle')}</p>
          <Link 
            to="/services" 
            className="btn-primary !px-12 !py-5 !text-xl relative z-10"
          >
            {t('ready_btn')} <ArrowRight size={20} />
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
