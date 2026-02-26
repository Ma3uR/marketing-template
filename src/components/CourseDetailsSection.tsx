'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, useScroll, useTransform, useMotionValueEvent, type MotionValue } from 'framer-motion';
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

const SNAP_POINTS = [0, 0.25, 0.50, 0.75];

const SECTIONS = [
  { hash: '#benefits', label: 'Що ти отримаєш' },
  { hash: '#curriculum', label: 'Програма курсу' },
  { hash: '#target-audience', label: 'Для кого курс' },
  { hash: '#usp', label: 'Чому ми' },
] as const;

function GlassPanel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-[#1a0d2e]/50 backdrop-blur-xl border border-purple-500/20 rounded-3xl ${className}`}>
      {children}
    </div>
  );
}

function SectionContent({
  children,
  progress,
  inputRange,
  outputRange,
}: {
  children: React.ReactNode;
  progress: MotionValue<number>;
  inputRange: number[];
  outputRange: number[];
}) {
  const opacity = useTransform(progress, inputRange, outputRange);
  const scale = useTransform(opacity, [0, 1], [0.95, 1]);
  const y = useTransform(opacity, [0, 1], [30, 0]);
  const zIndex = useTransform(opacity, (v: number) => (v > 0.5 ? 20 : 10));
  const pointerEvents = useTransform(opacity, (v: number) => (v > 0.5 ? 'auto' : 'none'));

  return (
    <motion.div
      style={{ opacity, scale, y, zIndex, pointerEvents: pointerEvents as unknown as undefined }}
      className="absolute inset-0 w-full h-full flex items-center justify-center p-4 md:p-8"
    >
      <div className="max-w-6xl w-full flex flex-col justify-center">{children}</div>
    </motion.div>
  );
}

interface CourseDetailsSectionProps {
  benefits: BenefitsContent;
  curriculum: CurriculumContent;
  targetAudience: TargetAudienceContent;
  usp: UspContent;
}

export function CourseDetailsSection({ benefits, curriculum, targetAudience, usp }: CourseDetailsSectionProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isSnapping = useRef(false);

  const { scrollYProgress } = useScroll({
    target: outerRef,
    offset: ['start start', 'end end'],
  });

  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.08], [1, 0]);

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    let index = 0;
    if (latest >= 0.75) index = 3;
    else if (latest >= 0.5) index = 2;
    else if (latest >= 0.25) index = 1;
    setActiveIndex(index);
  });

  useEffect(() => {
    const hash = SECTIONS[activeIndex].hash;
    if (window.location.hash !== hash) {
      history.replaceState(null, '', hash);
    }
  }, [activeIndex]);

  const scrollToSnapPoint = useCallback((percentage: number) => {
    if (!outerRef.current) return;
    const containerTop = outerRef.current.offsetTop;
    const scrollableDistance = outerRef.current.scrollHeight - window.innerHeight;
    window.scrollTo({ top: containerTop + scrollableDistance * percentage, behavior: 'smooth' });
  }, []);

  // Scroll snap: after user stops scrolling, snap to nearest section
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const snapToNearest = () => {
      if (isSnapping.current || !outerRef.current) return;

      const progress = scrollYProgress.get();
      // Don't snap at extremes — let user enter/exit the section freely
      if (progress < 0.02 || progress > 0.88) return;

      const nearest = SNAP_POINTS.reduce((prev, curr) =>
        Math.abs(curr - progress) < Math.abs(prev - progress) ? curr : prev
      );

      // Already at a snap point
      if (Math.abs(progress - nearest) < 0.02) return;

      isSnapping.current = true;
      scrollToSnapPoint(nearest);
      setTimeout(() => { isSnapping.current = false; }, 1000);
    };

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(snapToNearest, 150);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [scrollYProgress, scrollToSnapPoint]);

  const handleDotClick = (index: number) => {
    isSnapping.current = true;
    scrollToSnapPoint(SNAP_POINTS[index]);
    setTimeout(() => { isSnapping.current = false; }, 1000);
  };

  return (
    <div ref={outerRef} className="relative" style={{ height: '400vh' }}>
      {/* Anchor targets for nav links */}
      <div id="benefits" className="absolute top-0" />
      <div id="curriculum" className="absolute" style={{ top: '25%' }} />
      <div id="target-audience" className="absolute" style={{ top: '50%' }} />

      {/* Sticky viewport */}
      <div className="sticky top-16 h-[calc(100dvh-4rem)] overflow-hidden">
        {/* Navigation dots */}
        <nav
          aria-label="Course content sections"
          className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-6"
        >
          {SECTIONS.map((section, i) => (
            <div key={section.hash} className="relative group flex items-center justify-end">
              <span className="absolute right-8 text-xs font-bold uppercase tracking-widest text-white/40 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity whitespace-nowrap">
                {section.label}
              </span>
              <button
                onClick={() => handleDotClick(i)}
                aria-label={section.label}
                aria-current={activeIndex === i ? 'true' : 'false'}
                className="relative w-2 h-2 rounded-full bg-white/20 border border-white/10 hover:scale-150 transition-transform"
              >
                <span
                  className={`absolute inset-0 rounded-full bg-gradient-to-b from-[#d946ef] to-[#fb7185] transition-all duration-300 ${
                    activeIndex === i
                      ? 'opacity-100 scale-150 shadow-[0_0_15px_rgba(217,70,239,0.6)]'
                      : 'opacity-0 scale-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </nav>

        {/* Panel 1: Benefits — starts visible (opacity 1 at progress 0) */}
        <SectionContent
          progress={scrollYProgress}
          inputRange={[0, 0.18, 0.25]}
          outputRange={[1, 1, 0]}
        >
          <div className="text-center mb-6 md:mb-10">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#fb7185] mb-3 block">
              Переваги
            </span>
            <h2 className="text-3xl md:text-6xl font-black mb-2 md:mb-4">{benefits.heading}</h2>
            <p className="text-white/50 max-w-2xl mx-auto text-sm md:text-base">{benefits.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
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
                  <p className="text-xs md:text-sm text-white/60 leading-relaxed line-clamp-2 md:line-clamp-none">
                    {card.description}
                  </p>
                </GlassPanel>
              );
            })}
          </div>
        </SectionContent>

        {/* Panel 2: Curriculum — fully visible at snap point 0.25 */}
        <SectionContent
          progress={scrollYProgress}
          inputRange={[0.20, 0.25, 0.45, 0.50]}
          outputRange={[0, 1, 1, 0]}
        >
          <div className="text-center mb-6 md:mb-10">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#d946ef] mb-3 block">
              Навчання
            </span>
            <h2 className="text-3xl md:text-6xl font-black mb-2 md:mb-4">{curriculum.heading}</h2>
            <p className="text-white/50 max-w-2xl mx-auto text-sm md:text-base">{curriculum.subtitle}</p>
          </div>
          <div className="space-y-2 md:space-y-4 max-w-4xl mx-auto w-full">
            {curriculum.modules.map((mod, i) => (
              <GlassPanel
                key={i}
                className="px-4 py-3 md:px-8 md:py-6 flex items-center gap-4 md:gap-6 group hover:translate-x-2 transition-transform"
              >
                <span className="text-2xl md:text-5xl font-black text-white/10 group-hover:text-[#fb7185]/20 transition-colors flex-shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm md:text-2xl font-bold mb-0.5 md:mb-1">{mod.title}</h3>
                  <p className="text-xs md:text-sm text-white/50 line-clamp-1 md:line-clamp-none">
                    {mod.description}
                  </p>
                </div>
                <ArrowRight className="ml-auto w-4 h-4 md:w-6 md:h-6 text-white/20 group-hover:text-[#fb7185] transition-colors flex-shrink-0" />
              </GlassPanel>
            ))}
          </div>
        </SectionContent>

        {/* Panel 3: Target Audience — fully visible at snap point 0.50 */}
        <SectionContent
          progress={scrollYProgress}
          inputRange={[0.45, 0.50, 0.70, 0.75]}
          outputRange={[0, 1, 1, 0]}
        >
          <div className="text-center mb-6 md:mb-10">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#fb7185] mb-3 block">
              Аудиторія
            </span>
            <h2 className="text-3xl md:text-6xl font-black mb-2 md:mb-4">{targetAudience.heading}</h2>
            <p className="text-white/50 max-w-2xl mx-auto text-sm md:text-base">{targetAudience.subtitle}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 md:gap-6">
            {targetAudience.cards.map((card, i) => {
              const Icon = PERSONA_ICONS[i] || Zap;
              return (
                <GlassPanel key={i} className="p-4 md:p-8 flex items-start gap-3 md:gap-6">
                  <div className="p-2 md:p-3 bg-white/5 rounded-xl shrink-0">
                    <Icon className="w-4 h-4 md:w-6 md:h-6 text-[#d946ef]" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-sm md:text-xl font-bold mb-0.5 md:mb-2">{card.title}</h3>
                    <p className="text-xs md:text-sm text-white/50 line-clamp-2 md:line-clamp-none">
                      {card.description}
                    </p>
                  </div>
                </GlassPanel>
              );
            })}
          </div>
        </SectionContent>

        {/* Panel 4: USP / Why Us — fully visible at snap point 0.75, stays visible */}
        <SectionContent
          progress={scrollYProgress}
          inputRange={[0.70, 0.75, 1.0]}
          outputRange={[0, 1, 1]}
        >
          <div className="text-center mb-6 md:mb-10">
            <span className="text-xs font-black uppercase tracking-[0.3em] text-[#a855f7] mb-3 block">
              Результат
            </span>
            <h2 className="text-3xl md:text-6xl font-black mb-2 md:mb-4">{usp.heading}</h2>
            <p className="text-white/50 max-w-2xl mx-auto text-sm md:text-base">{usp.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-5xl mx-auto w-full">
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
        </SectionContent>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: scrollHintOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 pointer-events-none z-10"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30">
            Гортай вниз
          </span>
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-0.5 h-12 bg-gradient-to-b from-white/20 to-transparent rounded-full"
          />
        </motion.div>
      </div>
    </div>
  );
}
