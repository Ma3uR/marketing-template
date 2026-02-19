'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  CheckCircle2,
  TrendingUp,
  Instagram,
  Facebook,
  Bell,
  Star,
  ArrowRight,
  ShieldCheck,
  Zap,
  Target,
  Wallet,
  Cpu,
  Headphones,
  Rocket,
  Menu,
  X,
} from 'lucide-react';
import { PricingCard } from './PricingCard';
import { BackgroundEffects } from './BackgroundEffects';
import { useIsMobile } from '@/hooks/useIsMobile';
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion';
import type { Review, PricingTier } from '@/types/database';
import type { SiteContent } from '@/types/content';

const NavLink = ({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <a
    href={href}
    onClick={onClick}
    className="text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
  >
    {children}
  </a>
);

const BenefitCardComponent = ({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="bg-[#1a0d2e]/50 border border-purple-500/20 p-6 rounded-2xl backdrop-blur-sm hover:border-purple-500/40 transition-all group"
  >
    <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6 text-[#a855f7]" />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
  </motion.div>
);

const BENEFIT_ICONS = [Rocket, Target, Wallet, Cpu, Headphones, Zap];

interface MarketingCourseLandingProps {
  reviews: Review[];
  heroImageUrl?: string;
  instructorImageUrl?: string;
  pricingTiers: PricingTier[];
  content: SiteContent;
}

export function MarketingCourseLanding({ reviews, heroImageUrl, instructorImageUrl, pricingTiers, content }: MarketingCourseLandingProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const prefersReducedMotion = usePrefersReducedMotion();
  const shouldAnimate = !isMobile && !prefersReducedMotion;

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 20;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const { header, hero, benefits, about, pricing, reviews: reviewsContent, cta, footer } = content;

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '4.9';

  const sectionVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const createSlideVariants = (direction: 'left' | 'right') => ({
    hidden: {
      opacity: 0,
      scale: 0.9,
      x: direction === 'left' ? -100 : 100,
    },
    visible: {
      opacity: 1,
      scale: 1,
      x: 0,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  });

  const closeMobileMenu = () => setMobileMenuOpen(false);

  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
    closeMobileMenu();
  };

  return (
    <div className="min-h-screen bg-[#0f0a1f] text-white selection:bg-[#fb7185] selection:text-white overflow-x-hidden relative">
      <BackgroundEffects shouldAnimate={shouldAnimate} />

      {/* Header */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#0f0a1f]/80 backdrop-blur-md border-b border-white/5 py-4'
            : 'bg-transparent py-6'
        }`}
      >
        <div className="container mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-[#d946ef] to-[#fb7185] rounded-lg flex items-center justify-center font-bold">
              {header.logoLetter}
            </div>
            <span className="text-xl font-bold tracking-tight">
              {header.brandName}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8" aria-label="Основна навігація">
            <NavLink href="#benefits">{header.navBenefits}</NavLink>
            <NavLink href="#about">{header.navAbout}</NavLink>
            <NavLink href="#pricing">{header.navPricing}</NavLink>
            <NavLink href="#reviews">{header.navReviews}</NavLink>
            <button className="px-6 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-full text-sm font-semibold transition-all">
              {header.loginButton}
            </button>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Закрити меню' : 'Відкрити меню'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 z-40 bg-[#0f0a1f] flex flex-col items-center justify-center gap-8 md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Навігаційне меню"
          >
            <NavLink href="#benefits" onClick={closeMobileMenu}>
              {header.navBenefits}
            </NavLink>
            <NavLink href="#about" onClick={closeMobileMenu}>
              {header.navAbout}
            </NavLink>
            <NavLink href="#pricing" onClick={closeMobileMenu}>
              {header.navPricing}
            </NavLink>
            <NavLink href="#reviews" onClick={closeMobileMenu}>
              {header.navReviews}
            </NavLink>
            <button
              onClick={scrollToPricing}
              className="px-8 py-3 bg-gradient-to-r from-[#d946ef] to-[#fb7185] rounded-full font-bold"
            >
              {header.mobileCtaButton}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-20">
        {/* Hero Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          variants={sectionVariants}
          viewport={{ once: true, amount: 0.2 }}
          className="container mx-auto px-6 pt-8 pb-16 sm:pt-16 sm:pb-24 lg:pb-32 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12"
        >
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="flex-1 max-w-2xl text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium mb-6">
              <Star className="w-4 h-4 fill-purple-300" />
              <span>{hero.badge}</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 break-words">
              {hero.headingPrefix}{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#fb7185]">
                {hero.headingHighlight}
              </span>{' '}
              {hero.headingSuffix}
            </h1>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
              {hero.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={scrollToPricing}
                className="px-10 py-4 bg-gradient-to-r from-[#d946ef] to-[#fb7185] rounded-2xl font-bold text-lg hover:shadow-[0_0_40px_rgba(217,70,239,0.4)] transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                {hero.ctaButton} <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 ml-0 sm:ml-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-[#0f0a1f] bg-gray-600 flex items-center justify-center overflow-hidden relative"
                    >
                      <Image
                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                        alt={`Фото учня ${i}`}
                        fill
                        sizes="32px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <div className="flex text-yellow-500 mb-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-gray-400">{avgRating}/5 {hero.ratingText}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="flex-1 relative w-full max-w-md lg:max-w-none mx-auto"
          >
            <div className="relative z-10 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl aspect-[4/5] max-h-[600px]">
              <Image
                src={heroImageUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1288&auto=format&fit=crop'}
                alt="Маркетинг коуч"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
            {/* Floating UI Elements */}
            <motion.div
              animate={shouldAnimate ? { y: [0, -10, 0] } : undefined}
              transition={shouldAnimate ? { duration: 4, repeat: Infinity, ease: 'easeInOut' } : undefined}
              className="absolute -top-4 -right-2 sm:-top-6 sm:-right-6 bg-[#1a0d2e]/90 border border-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-md shadow-xl z-20"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <div className="text-[8px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    {hero.roiLabel}
                  </div>
                  <div className="text-sm sm:text-lg font-bold text-white">{hero.roiValue}</div>
                </div>
              </div>
              <div className="h-1 sm:h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-green-500" />
              </div>
            </motion.div>

            <motion.div
              animate={shouldAnimate ? { y: [0, 10, 0] } : undefined}
              transition={shouldAnimate ? { duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 } : undefined}
              className="absolute bottom-8 -left-2 sm:bottom-12 sm:-left-12 bg-[#1a0d2e]/90 border border-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-md shadow-xl z-20 flex items-center gap-3 sm:gap-4"
            >
              <Instagram className="w-6 h-6 sm:w-8 sm:h-8 text-[#d946ef]" />
              <div>
                <div className="text-[10px] sm:text-xs text-gray-400">{hero.leadsLabel}</div>
                <div className="text-sm sm:text-base font-bold">{hero.leadsValue}</div>
              </div>
            </motion.div>

            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-purple-600/20 blur-[100px] rounded-full" />
          </motion.div>
        </motion.section>

        {/* Benefits Grid */}
        <motion.section
          id="benefits"
          initial="hidden"
          whileInView="visible"
          variants={createSlideVariants('right')}
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 sm:py-24 lg:py-32 bg-[#1a0d2e]/30 relative overflow-hidden"
        >
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                {benefits.heading}
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                {benefits.subtitle}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.cards.map((card, i) => (
                <BenefitCardComponent
                  key={i}
                  icon={BENEFIT_ICONS[i] || Zap}
                  title={card.title}
                  description={card.description}
                  delay={i * 0.1}
                />
              ))}
            </div>
          </div>
        </motion.section>

        {/* About/Instructor Section */}
        <motion.section
          id="about"
          initial="hidden"
          whileInView="visible"
          variants={createSlideVariants('left')}
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 sm:py-24 lg:py-32 container mx-auto px-6 overflow-hidden"
        >
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="w-full max-w-sm mx-auto lg:mx-0 lg:w-2/5 relative"
            >
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#d946ef]/20 rounded-full blur-3xl" />
              <div className="relative rounded-3xl overflow-hidden aspect-[4/5] border border-white/10 z-10">
                <Image
                  src={instructorImageUrl || "https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?q=80&w=1280&auto=format&fit=crop"}
                  alt={`${about.name} - інструктор курсу`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover grayscale-[0.2]"
                />
              </div>
              <div className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-6 bg-gradient-to-tr from-[#d946ef] to-[#fb7185] p-4 sm:p-6 rounded-2xl z-20">
                <div className="text-2xl sm:text-3xl font-bold">{about.experienceYears}</div>
                <div className="text-[10px] sm:text-xs uppercase tracking-widest font-medium opacity-80">
                  {about.experienceLabel}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="lg:w-3/5"
            >
              <div className="text-[#fb7185] font-bold uppercase tracking-widest text-sm mb-4">
                {about.label}
              </div>
              <h2 className="text-4xl font-bold mb-6">
                {about.heading}
              </h2>
              <div className="space-y-6 text-gray-400 text-lg mb-8">
                <p>{about.bio}</p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#a855f7] w-5 h-5 flex-shrink-0" />
                    <span>{about.achievement1}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#a855f7] w-5 h-5 flex-shrink-0" />
                    <span>{about.achievement2}</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#a855f7] w-5 h-5 flex-shrink-0" />
                    <span>{about.achievement3}</span>
                  </li>
                </ul>
                <p className="italic border-l-2 border-[#fb7185] pl-6 py-2">
                  &ldquo;{about.quote}&rdquo;
                </p>
              </div>
              <button
                onClick={scrollToPricing}
                className="px-8 py-4 bg-gradient-to-r from-[#d946ef] to-[#fb7185] rounded-xl font-bold hover:scale-[1.02] transition-transform"
              >
                {about.ctaButton}
              </button>
            </motion.div>
          </div>
        </motion.section>

        {/* Pricing Section */}
        {pricingTiers.length > 0 && <motion.section
          id="pricing"
          initial="hidden"
          whileInView="visible"
          variants={createSlideVariants('right')}
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 sm:py-24 lg:py-32 bg-[#1a0d2e]/40 relative"
        >
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">
                {pricing.heading}
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                {pricing.subtitle}
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch max-w-6xl mx-auto">
              {pricingTiers.map((tier, i) => (
                <PricingCard
                  key={tier.slug}
                  tier={tier.slug}
                  title={tier.title}
                  price={tier.price}
                  originalPrice={tier.original_price}
                  features={tier.features}
                  isPopular={tier.is_popular}
                  urgency={tier.urgency ?? undefined}
                  delay={i * 0.15}
                />
              ))}
            </div>
          </div>
        </motion.section>}

        {/* Testimonials */}
        <motion.section
          id="reviews"
          initial="hidden"
          whileInView="visible"
          variants={createSlideVariants('left')}
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 sm:py-24 lg:py-32 container mx-auto px-6"
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{reviewsContent.heading}</h2>
            {reviews.length > 0 && (
              <div className="flex items-center justify-center gap-1 mb-8">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
                ))}
                <span className="ml-2 font-bold text-xl">{avgRating}/5</span>
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#1a0d2e]/60 border border-white/5 p-8 rounded-3xl relative"
              >
                <div className="flex items-center gap-4 mb-6">
                  {t.author_photo_url && (t.author_photo_url.startsWith('/') || t.author_photo_url.startsWith('http')) ? (
                    <div className="w-14 h-14 rounded-full border-2 border-[#a855f7] p-0.5 overflow-hidden relative">
                      <Image
                        src={t.author_photo_url}
                        alt={`Фото ${t.author_name}`}
                        fill
                        sizes="56px"
                        className="rounded-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full border-2 border-[#a855f7] bg-gradient-to-br from-[#d946ef] to-[#fb7185] flex items-center justify-center text-white font-bold text-lg">
                      {t.author_name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-lg">{t.author_name}</h4>
                    {t.business && (
                      <p className="text-sm text-gray-500">{t.business}</p>
                    )}
                  </div>
                </div>
                <div className="mb-4 text-gray-300 leading-relaxed italic">
                  &ldquo;{t.text}&rdquo;
                </div>
                {t.result && (
                  <div className="pt-4 border-t border-white/5">
                    <div className="text-[#fb7185] font-bold text-sm uppercase">
                      {t.result}
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial="hidden"
          whileInView="visible"
          variants={createSlideVariants('right')}
          viewport={{ once: true, amount: 0.2 }}
          className="py-16 sm:py-24 lg:py-32 px-6"
        >
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-[#3b1d8f] to-[#1a0d2e] rounded-[3rem] p-12 lg:p-20 text-center relative overflow-hidden border border-white/10"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-4xl lg:text-6xl font-bold mb-8 max-w-4xl mx-auto leading-tight">
                  {cta.heading}
                </h2>
                <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                  {cta.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <button
                    onClick={scrollToPricing}
                    className="px-12 py-5 bg-[#ffffff] text-[#0f0a1f] rounded-2xl font-bold text-xl hover:bg-gray-100 hover:scale-105 transition-all"
                  >
                    {cta.ctaButton}
                  </button>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-400">
                      {cta.guaranteeLabel}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-400 font-bold">
                      <ShieldCheck className="w-4 h-4" /> {cta.guaranteeBadge}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer
        initial="hidden"
        whileInView="visible"
        variants={createSlideVariants('left')}
        viewport={{ once: true, amount: 0.2 }}
        className="py-20 border-t border-white/5 relative z-10"
      >
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-tr from-[#d946ef] to-[#fb7185] rounded-lg flex items-center justify-center font-bold">
                  {header.logoLetter}
                </div>
                <span className="text-xl font-bold tracking-tight">
                  {footer.brandName}
                </span>
              </div>
              <p className="text-gray-500 max-w-xs leading-relaxed">
                {footer.description}
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-400">
                {footer.navHeading}
              </h5>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#benefits"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    {footer.navLink1}
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    {footer.navLink2}
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    {footer.navLink3}
                  </a>
                </li>
                <li>
                  <a
                    href="#reviews"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    {footer.navLink4}
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-400">
                {footer.contactsHeading}
              </h5>
              <ul className="space-y-4 text-gray-500">
                <li className="flex items-center gap-3">
                  <Bell className="w-4 h-4" /> {footer.email}
                </li>
                <li className="flex items-center gap-3">
                  <Instagram className="w-4 h-4" /> {footer.instagram}
                </li>
                <li className="flex items-center gap-3">
                  <Facebook className="w-4 h-4" /> {footer.facebook}
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-gray-600 text-sm">
            <div>&copy; {footer.copyright}</div>
            <nav className="flex items-center gap-8" aria-label="Правова інформація">
              <a href="/privacy" className="hover:text-gray-400">
                {footer.privacyLink}
              </a>
              <a href="/terms" className="hover:text-gray-400">
                {footer.offerLink}
              </a>
            </nav>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default MarketingCourseLanding;
