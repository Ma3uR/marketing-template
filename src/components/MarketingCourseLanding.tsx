'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
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
import type { PricingTier } from '@/types/wayforpay';

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

const BenefitCard = ({
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

interface PricingData {
  tier: PricingTier;
  title: string;
  price: number;
  originalPrice: number;
  features: string[];
  isPopular: boolean;
  urgency?: string;
}

export function MarketingCourseLanding() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ['0%', '20%']);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const benefits = [
    {
      icon: Rocket,
      title: 'Запускай рекламу сам',
      description:
        'Ти перестанеш залежати від підрядників та навчишся контролювати кожен клік.',
    },
    {
      icon: Target,
      title: 'Цільова аудиторія',
      description:
        'Навчимо знаходити саме тих людей, які готові купувати твій продукт тут і зараз.',
    },
    {
      icon: Wallet,
      title: 'Контроль бюджету',
      description:
        'Дізнайся, як не зливати гроші на неефективні оголошення та масштабувати успішні.',
    },
    {
      icon: Cpu,
      title: 'Алгоритми Facebook',
      description:
        'Зрозумієш внутрішню логіку соцмереж, щоб алгоритми працювали на тебе, а не навпаки.',
    },
    {
      icon: Headphones,
      title: '2 місяці підтримки',
      description:
        'Ти не залишишся сам на сам з питаннями — ми допоможемо на кожному етапі запуску.',
    },
    {
      icon: Zap,
      title: 'Практичні навички',
      description:
        'Мінімум теорії, максимум практики. Створиш свою першу рекламну кампанію вже на курсі.',
    },
  ];

  const pricing: PricingData[] = [
    {
      tier: 'basic',
      title: 'Базовий',
      price: 799,
      originalPrice: 1200,
      features: [
        'Доступ до 12 модулів',
        'Шаблони стратегій',
        'Доступ до чату учнів',
        'Сертифікат про завершення',
      ],
      isPopular: false,
    },
    {
      tier: 'premium',
      title: 'Преміум',
      price: 7999,
      originalPrice: 12800,
      features: [
        'Все з Базового',
        '2 групові сесії зі мною',
        'Перевірка ДЗ кураторами',
        'Закритий чат з фахівцями',
        'Бонус: гайд по креативах',
        'Доступ на 12 місяців',
      ],
      isPopular: true,
    },
    {
      tier: 'vip',
      title: 'VIP',
      price: 12999,
      originalPrice: 19999,
      features: [
        'Все з Преміум',
        'Особистий менторинг (3 зустрічі)',
        'Аудит твоєї поточної реклами',
        'Розробка стратегії під ключ',
        'Пріоритетна підтримка 24/7',
      ],
      isPopular: false,
      urgency: 'Залишилось 3 місця',
    },
  ];

  const testimonials = [
    {
      name: 'Олена',
      business: 'Магазин декору',
      text: 'Зекономила 5000 грн на послугах таргетолога вже в перший місяць. Результати кращі, ніж були раніше!',
      result: 'Зекономила 5000 грн',
    },
    {
      name: 'Андрій',
      business: 'IT-консалтинг',
      text: 'Завдяки курсу ми масштабували продажі на 40%. Нарешті є чітка система, а не гадання на кавовій гущі.',
      result: '+40% до продажів',
    },
    {
      name: 'Марія',
      business: "Б'юті студія",
      text: 'Найкраща інвестиція року. Реклама окупилася вже на другому тижні навчання. Дякую за підтримку!',
      result: 'Окупність за 2 тижні',
    },
  ];

  const figureEightPath = {
    x: [
      '0%',
      '15%',
      '25%',
      '30%',
      '25%',
      '15%',
      '0%',
      '-15%',
      '-25%',
      '-30%',
      '-25%',
      '-15%',
      '0%',
    ],
    y: [
      '0%',
      '-20%',
      '-35%',
      '-40%',
      '-35%',
      '-20%',
      '0%',
      '20%',
      '35%',
      '40%',
      '35%',
      '20%',
      '0%',
    ],
  };

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
      {/* Animated Geometric Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(168, 85, 247, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(168, 85, 247, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        <motion.div
          className="absolute inset-0"
          animate={figureEightPath}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'linear',
          }}
          style={{
            background: `radial-gradient(
              circle 800px at 50% 50%,
              rgba(217, 70, 239, 0.15),
              rgba(168, 85, 247, 0.1) 30%,
              rgba(251, 113, 133, 0.08) 50%,
              transparent 70%
            )`,
          }}
        />
      </div>

      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <motion.div
          style={{ y: backgroundY }}
          className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-[#3b1d8f]/20 blur-[120px] rounded-full"
        />
        <motion.div
          style={{ y: backgroundY }}
          className="absolute top-[40%] -right-[10%] w-[40%] h-[40%] bg-[#d946ef]/10 blur-[120px] rounded-full"
        />
      </div>

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
              Т
            </div>
            <span className="text-xl font-bold tracking-tight">
              Таня Сідоренко
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <NavLink href="#benefits">Переваги</NavLink>
            <NavLink href="#about">Про автора</NavLink>
            <NavLink href="#pricing">Тарифи</NavLink>
            <NavLink href="#reviews">Відгуки</NavLink>
            <button className="px-6 py-2.5 bg-white/5 border border-white/10 hover:border-white/20 rounded-full text-sm font-semibold transition-all">
              Увійти
            </button>
          </nav>

          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
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
          >
            <NavLink href="#benefits" onClick={closeMobileMenu}>
              Переваги
            </NavLink>
            <NavLink href="#about" onClick={closeMobileMenu}>
              Про автора
            </NavLink>
            <NavLink href="#pricing" onClick={closeMobileMenu}>
              Тарифи
            </NavLink>
            <NavLink href="#reviews" onClick={closeMobileMenu}>
              Відгуки
            </NavLink>
            <button
              onClick={scrollToPricing}
              className="px-8 py-3 bg-gradient-to-r from-[#d946ef] to-[#fb7185] rounded-full font-bold"
            >
              Почати навчання
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
              <span>Вже навчились 500+ підприємців</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold leading-tight mb-6 break-words">
              Перестань{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d946ef] to-[#fb7185]">
                переплачувати
              </span>{' '}
              за рекламу
            </h1>
            <p className="text-lg text-gray-400 mb-10 leading-relaxed max-w-xl mx-auto lg:mx-0">
              Стань власним таргетологом за 14 днів. Навчись запускати рекламу,
              яка приносить реальні гроші, а не просто лайки.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <button
                onClick={scrollToPricing}
                className="px-10 py-4 bg-gradient-to-r from-[#d946ef] to-[#fb7185] rounded-2xl font-bold text-lg hover:shadow-[0_0_40px_rgba(217,70,239,0.4)] transition-all hover:scale-[1.02] flex items-center gap-2"
              >
                Почати навчання <ArrowRight className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3 ml-0 sm:ml-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full border-2 border-[#0f0a1f] bg-gray-600 flex items-center justify-center overflow-hidden"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={`https://i.pravatar.cc/100?img=${i + 10}`}
                        alt="avatar"
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
                  <span className="text-gray-400">4.9/5 рейтинг</span>
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
            <div className="relative z-10 rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1288&auto=format&fit=crop"
                alt="Marketing Coach"
                className="w-full h-auto object-cover max-h-[400px] sm:max-h-[500px] lg:max-h-[600px]"
              />
            </div>
            {/* Floating UI Elements */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-4 -right-2 sm:-top-6 sm:-right-6 bg-[#1a0d2e]/90 border border-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-md shadow-xl z-20"
            >
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                </div>
                <div>
                  <div className="text-[8px] sm:text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                    ROI
                  </div>
                  <div className="text-sm sm:text-lg font-bold text-white">+248%</div>
                </div>
              </div>
              <div className="h-1 sm:h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full w-3/4 bg-green-500" />
              </div>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1,
              }}
              className="absolute bottom-8 -left-2 sm:bottom-12 sm:-left-12 bg-[#1a0d2e]/90 border border-white/10 p-3 sm:p-4 rounded-2xl backdrop-blur-md shadow-xl z-20 flex items-center gap-3 sm:gap-4"
            >
              <Instagram className="w-6 h-6 sm:w-8 sm:h-8 text-[#d946ef]" />
              <div>
                <div className="text-[10px] sm:text-xs text-gray-400">Нових лідів</div>
                <div className="text-sm sm:text-base font-bold">+1,240</div>
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
                Що ти отримаєш на курсі
              </h2>
              <p className="text-gray-400 max-w-2xl mx-auto">
                Покрокова програма, розроблена спеціально для власників малого
                та середнього бізнесу.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits.map((benefit, i) => (
                <BenefitCard key={i} {...benefit} delay={i * 0.1} />
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1590650516494-0c8e4a4dd67e?q=80&w=1280&auto=format&fit=crop"
                  alt="Instructor"
                  className="w-full h-full object-cover grayscale-[0.2]"
                />
              </div>
              <div className="absolute -bottom-4 -right-2 sm:-bottom-6 sm:-right-6 bg-gradient-to-tr from-[#d946ef] to-[#fb7185] p-4 sm:p-6 rounded-2xl z-20">
                <div className="text-2xl sm:text-3xl font-bold">7 років</div>
                <div className="text-[10px] sm:text-xs uppercase tracking-widest font-medium opacity-80">
                  Досвіду в Digital
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
                Про автора
              </div>
              <h2 className="text-4xl font-bold mb-6">
                Ваша провідниця у світ прибуткової реклами
              </h2>
              <div className="space-y-6 text-gray-400 text-lg mb-8">
                <p>
                  Привіт! Я Таня Сідоренко, експерт із digital-маркетингу, і за
                  останні 7 років я допомогла сотням бізнесів перестати зливати
                  бюджети.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#a855f7] w-5 h-5" />
                    <span>200+ успішних рекламних кампаній</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#a855f7] w-5 h-5" />
                    <span>Працювала з брендами в 15 різних нішах</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <CheckCircle2 className="text-[#a855f7] w-5 h-5" />
                    <span>
                      Створила систему, яка зрозуміла навіть новачкам
                    </span>
                  </li>
                </ul>
                <p className="italic border-l-2 border-[#fb7185] pl-6 py-2">
                  &ldquo;Моя місія — дати підприємцям свободу та контроль над
                  власним маркетингом.&rdquo;
                </p>
              </div>
              <button
                onClick={scrollToPricing}
                className="px-8 py-4 bg-gradient-to-r from-[#d946ef] to-[#fb7185] rounded-xl font-bold hover:scale-[1.02] transition-transform"
              >
                Хочу навчатись у тебе
              </button>
            </motion.div>
          </div>
        </motion.section>

        {/* Pricing Section */}
        <motion.section
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
                Обери свій формат навчання
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto">
                Гнучкі тарифи для будь-якого етапу твого бізнесу — від старту до
                масштабів.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch max-w-6xl mx-auto">
              {pricing.map((tier, i) => (
                <PricingCard key={tier.tier} {...tier} delay={i * 0.15} />
              ))}
            </div>
          </div>
        </motion.section>

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
            <h2 className="text-4xl font-bold mb-4">Що кажуть наші учні</h2>
            <div className="flex items-center justify-center gap-1 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-6 h-6 text-yellow-500 fill-current" />
              ))}
              <span className="ml-2 font-bold text-xl">4.9/5</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="bg-[#1a0d2e]/60 border border-white/5 p-8 rounded-3xl relative"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full border-2 border-[#a855f7] p-0.5 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://i.pravatar.cc/150?u=${t.name}`}
                      alt={t.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg">{t.name}</h4>
                    <p className="text-sm text-gray-500">{t.business}</p>
                  </div>
                </div>
                <div className="mb-4 text-gray-300 leading-relaxed italic">
                  &ldquo;{t.text}&rdquo;
                </div>
                <div className="pt-4 border-t border-white/5">
                  <div className="text-[#fb7185] font-bold text-sm uppercase">
                    {t.result}
                  </div>
                </div>
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
                  Готові створити потік клієнтів у свій бізнес?
                </h2>
                <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
                  Реєструйтеся сьогодні та отримайте бонусний модуль
                  &ldquo;Секрети High-Click креативів&rdquo; безкоштовно.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <button
                    onClick={scrollToPricing}
                    className="px-12 py-5 bg-[#ffffff] text-[#0f0a1f] rounded-2xl font-bold text-xl hover:bg-gray-100 hover:scale-105 transition-all"
                  >
                    Почати зараз
                  </button>
                  <div className="text-left">
                    <div className="text-sm font-semibold text-gray-400">
                      Гарантія повернення коштів
                    </div>
                    <div className="flex items-center gap-1 text-sm text-green-400 font-bold">
                      <ShieldCheck className="w-4 h-4" /> 100% Безпека
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
                  Т
                </div>
                <span className="text-xl font-bold tracking-tight">
                  Таня Сідоренко
                </span>
              </div>
              <p className="text-gray-500 max-w-xs leading-relaxed">
                Навчаємо підприємців будувати системний маркетинг без зайвих
                витрат на агентства.
              </p>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-400">
                Навігація
              </h5>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#benefits"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    Переваги
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    Тарифи
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    Про нас
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-white transition-colors"
                  >
                    Контакти
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-6 uppercase text-xs tracking-widest text-gray-400">
                Контакти
              </h5>
              <ul className="space-y-4 text-gray-500">
                <li className="flex items-center gap-3">
                  <Bell className="w-4 h-4" /> tanya@svidorenko.ua
                </li>
                <li className="flex items-center gap-3">
                  <Instagram className="w-4 h-4" /> @tanya_svidorenko
                </li>
                <li className="flex items-center gap-3">
                  <Facebook className="w-4 h-4" /> fb.com/tanya.svidorenko
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-gray-600 text-sm">
            <div>&copy; 2026 Таня Сідоренко. Всі права захищені.</div>
            <div className="flex items-center gap-8">
              <a href="#" className="hover:text-gray-400">
                Політика конфіденційності
              </a>
              <a href="#" className="hover:text-gray-400">
                Договір оферти
              </a>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}

export default MarketingCourseLanding;
