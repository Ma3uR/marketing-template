'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  Rocket,
  Target,
  Wallet,
  Cpu,
  Headphones,
  Zap,
  Briefcase,
  Laptop,
  Megaphone,
  GraduationCap,
  Crown,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import type { BenefitsContent, CurriculumContent, TargetAudienceContent, UspContent } from '@/types/content';

const BENEFIT_ICONS = [Rocket, Target, Wallet, Cpu, Headphones, Zap];
const PERSONA_ICONS = [Briefcase, Laptop, Megaphone, GraduationCap];
const USP_ICONS = [Clock, ShieldCheck, Crown];

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' },
  },
};

function GlassPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#1a0d2e]/50 backdrop-blur-xl border border-purple-500/20 rounded-3xl ${className}`}>
      {children}
    </div>
  );
}

interface CourseDetailsSectionProps {
  benefits: BenefitsContent;
  curriculum: CurriculumContent;
  targetAudience: TargetAudienceContent;
  usp: UspContent;
}

export function CourseDetailsSection({ benefits, curriculum, targetAudience, usp }: CourseDetailsSectionProps) {
  return (
    <>
      {/* Benefits */}
      <motion.section
        id="benefits"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="py-16 sm:py-24 container mx-auto px-6"
      >
        <div className="text-center mb-10 md:mb-14">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-[#fb7185] mb-3 block">
            Переваги
          </span>
          <h2 className="text-3xl md:text-6xl font-black mb-3 md:mb-4">{benefits.heading}</h2>
          <p className="text-white/50 max-w-2xl mx-auto text-sm md:text-base">{benefits.subtitle}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6 max-w-6xl mx-auto">
          {benefits.cards.map((card, i) => {
            const Icon = BENEFIT_ICONS[i] || Zap;
            return (
              <GlassPanel
                key={i}
                className="p-4 md:p-8 flex flex-col items-center text-center group hover:border-purple-500/40 transition-colors"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-[#fb7185]" />
                </div>
                <h3 className="text-sm md:text-lg font-bold mb-1 md:mb-2">{card.title}</h3>
                <p className="text-xs md:text-sm text-white/60 leading-relaxed">{card.description}</p>
              </GlassPanel>
            );
          })}
        </div>
      </motion.section>

      {/* Curriculum */}
      <motion.section
        id="curriculum"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="py-16 sm:py-24 container mx-auto px-6"
      >
        <div className="text-center mb-10 md:mb-14">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-[#d946ef] mb-3 block">
            Навчання
          </span>
          <h2 className="text-3xl md:text-6xl font-black mb-3 md:mb-4">{curriculum.heading}</h2>
          <p className="text-white/50 max-w-2xl mx-auto text-sm md:text-base">{curriculum.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 max-w-5xl mx-auto">
          {curriculum.modules.map((mod, i) => (
            <GlassPanel
              key={i}
              className="px-3 py-2 md:px-6 md:py-4 flex items-center gap-3 md:gap-5 group hover:translate-x-1 transition-transform"
            >
              <span className="text-xl md:text-4xl font-black text-white/10 group-hover:text-[#fb7185]/20 transition-colors flex-shrink-0">
                {String(i + 1).padStart(2, '0')}
              </span>
              <div className="min-w-0">
                <h3 className="text-sm md:text-lg font-bold">{mod.title}</h3>
                <p className="hidden md:block text-sm text-white/50">{mod.description}</p>
              </div>
              <ArrowRight className="ml-auto w-4 h-4 md:w-5 md:h-5 text-white/20 group-hover:text-[#fb7185] transition-colors flex-shrink-0" />
            </GlassPanel>
          ))}
        </div>
      </motion.section>

      {/* Target Audience */}
      <motion.section
        id="target-audience"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="py-16 sm:py-24 container mx-auto px-6"
      >
        <div className="text-center mb-10 md:mb-14">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-[#fb7185] mb-3 block">
            Аудиторія
          </span>
          <h2 className="text-3xl md:text-6xl font-black mb-3 md:mb-4">{targetAudience.heading}</h2>
          <p className="text-white/50 max-w-2xl mx-auto text-sm md:text-base">{targetAudience.subtitle}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 md:gap-6 max-w-6xl mx-auto">
          {targetAudience.cards.map((card, i) => {
            const Icon = PERSONA_ICONS[i] || Zap;
            return (
              <GlassPanel key={i} className="p-4 md:p-8 flex items-start gap-3 md:gap-6">
                <div className="p-2 md:p-3 bg-white/5 rounded-xl shrink-0">
                  <Icon className="w-4 h-4 md:w-6 md:h-6 text-[#d946ef]" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-sm md:text-xl font-bold mb-0.5 md:mb-2">{card.title}</h3>
                  <p className="text-xs md:text-sm text-white/50">{card.description}</p>
                </div>
              </GlassPanel>
            );
          })}
        </div>
      </motion.section>

      {/* USP / Why Us */}
      <motion.section
        id="usp"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="py-16 sm:py-24 container mx-auto px-6"
      >
        <div className="text-center mb-10 md:mb-14">
          <span className="text-xs font-black uppercase tracking-[0.3em] text-[#a855f7] mb-3 block">
            Результат
          </span>
          <h2 className="text-3xl md:text-6xl font-black mb-3 md:mb-4">{usp.heading}</h2>
          <p className="text-white/50 max-w-2xl mx-auto text-sm md:text-base">{usp.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 gap-3 md:gap-4 content-center">
            {usp.cards.map((card, i) => {
              const Icon = USP_ICONS[i] || Zap;
              return (
                <div key={i} className="flex flex-col gap-1.5 md:gap-2">
                  <div className="flex items-center gap-2 text-[#fb7185]">
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-black uppercase tracking-widest">{card.title}</span>
                  </div>
                  <p className="text-xs text-white/40">{card.description}</p>
                </div>
              );
            })}
          </div>
          <GlassPanel className="p-6 md:p-8 flex flex-col justify-center items-center text-center bg-gradient-to-br from-[#d946ef]/20 to-[#fb7185]/20 border-[#fb7185]/30">
            <h3 className="text-xl md:text-2xl font-black mb-3 md:mb-4">Готові почати?</h3>
            <p className="text-xs md:text-sm text-white/70 mb-6 md:mb-8 max-w-xs">
              Залишилось всього 8 місць на потік. Встигніть забронювати своє за спеціальною ціною.
            </p>
            <button
              onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
              className="w-full py-3 md:py-4 bg-white text-[#0f0a1f] rounded-2xl font-black text-base md:text-lg hover:scale-105 transition-transform shadow-xl shadow-white/10"
            >
              ЗАБРОНЮВАТИ МІСЦЕ
            </button>
          </GlassPanel>
        </div>
      </motion.section>
    </>
  );
}
