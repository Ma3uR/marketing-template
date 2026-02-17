import type {
  HeaderContent,
  HeroContent,
  BenefitsContent,
  AboutContent,
  PricingContent,
  ReviewsContent,
  CtaContent,
  FooterContent,
  SeoContent,
  SiteContent,
} from '@/types/content';

export const defaultHeader: HeaderContent = {
  logoLetter: 'Т',
  brandName: 'Таня Сідоренко',
  navBenefits: 'Переваги',
  navAbout: 'Про автора',
  navPricing: 'Тарифи',
  navReviews: 'Відгуки',
  loginButton: 'Увійти',
  mobileCtaButton: 'Почати навчання',
};

export const defaultHero: HeroContent = {
  badge: 'Вже навчились 500+ підприємців',
  headingPrefix: 'Перестань',
  headingHighlight: 'переплачувати',
  headingSuffix: 'за рекламу',
  subtitle:
    'Стань власним таргетологом за 14 днів. Навчись запускати рекламу, яка приносить реальні гроші, а не просто лайки.',
  ctaButton: 'Почати навчання',
  ratingText: 'рейтинг',
  roiLabel: 'ROI',
  roiValue: '+248%',
  leadsLabel: 'Нових лідів',
  leadsValue: '+1,240',
};

export const defaultBenefits: BenefitsContent = {
  heading: 'Що ти отримаєш на курсі',
  subtitle:
    'Покрокова програма, розроблена спеціально для власників малого та середнього бізнесу.',
  cards: [
    {
      title: 'Запускай рекламу сам',
      description:
        'Ти перестанеш залежати від підрядників та навчишся контролювати кожен клік.',
    },
    {
      title: 'Цільова аудиторія',
      description:
        'Навчимо знаходити саме тих людей, які готові купувати твій продукт тут і зараз.',
    },
    {
      title: 'Контроль бюджету',
      description:
        'Дізнайся, як не зливати гроші на неефективні оголошення та масштабувати успішні.',
    },
    {
      title: 'Алгоритми Facebook',
      description:
        'Зрозумієш внутрішню логіку соцмереж, щоб алгоритми працювали на тебе, а не навпаки.',
    },
    {
      title: '2 місяці підтримки',
      description:
        'Ти не залишишся сам на сам з питаннями — ми допоможемо на кожному етапі запуску.',
    },
    {
      title: 'Практичні навички',
      description:
        'Мінімум теорії, максимум практики. Створиш свою першу рекламну кампанію вже на курсі.',
    },
  ],
};

export const defaultAbout: AboutContent = {
  label: 'Про автора',
  heading: 'Ваша провідниця у світ прибуткової реклами',
  bio: 'Привіт! Я Таня Сідоренко, експерт із digital-маркетингу, і за останні 7 років я допомогла сотням бізнесів перестати зливати бюджети.',
  achievement1: '200+ успішних рекламних кампаній',
  achievement2: 'Працювала з брендами в 15 різних нішах',
  achievement3: 'Створила систему, яка зрозуміла навіть новачкам',
  quote:
    'Моя місія — дати підприємцям свободу та контроль над власним маркетингом.',
  ctaButton: 'Хочу навчатись у тебе',
  experienceYears: '7 років',
  experienceLabel: 'Досвіду в Digital',
};

export const defaultPricing: PricingContent = {
  heading: 'Обери свій формат навчання',
  subtitle:
    'Гнучкі тарифи для будь-якого етапу твого бізнесу — від старту до масштабів.',
};

export const defaultReviews: ReviewsContent = {
  heading: 'Що кажуть наші учні',
};

export const defaultCta: CtaContent = {
  heading: 'Готові створити потік клієнтів у свій бізнес?',
  subtitle:
    'Реєструйтеся сьогодні та отримайте бонусний модуль \u201cСекрети High-Click креативів\u201d безкоштовно.',
  ctaButton: 'Почати зараз',
  guaranteeLabel: 'Гарантія повернення коштів',
  guaranteeBadge: '100% Безпека',
};

export const defaultFooter: FooterContent = {
  brandName: 'Таня Сідоренко',
  description:
    'Навчаємо підприємців будувати системний маркетинг без зайвих витрат на агентства.',
  navHeading: 'Навігація',
  navLink1: 'Переваги',
  navLink2: 'Тарифи',
  navLink3: 'Про нас',
  navLink4: 'Контакти',
  contactsHeading: 'Контакти',
  email: 'tanya@svidorenko.ua',
  instagram: '@tanya_svidorenko',
  facebook: 'fb.com/tanya.svidorenko',
  copyright: '2026 Таня Сідоренко. Всі права захищені.',
  privacyLink: 'Політика конфіденційності',
  offerLink: 'Договір оферти',
};

export const defaultSeo: SeoContent = {
  title: 'Курс з таргетованої реклами | Таня Сідоренко',
  description:
    'Стань власним таргетологом за 14 днів. Навчись запускати рекламу, яка приносить реальні гроші, а не просто лайки.',
  keywords:
    'таргетована реклама, курс таргетолога, Facebook реклама, Instagram реклама, маркетинг курс, онлайн навчання',
  ogTitle: 'Курс з таргетованої реклами | Таня Сідоренко',
  ogDescription:
    'Стань власним таргетологом за 14 днів. Навчись запускати рекламу, яка приносить реальні гроші.',
};

export const defaultSiteContent: SiteContent = {
  header: defaultHeader,
  hero: defaultHero,
  benefits: defaultBenefits,
  about: defaultAbout,
  pricing: defaultPricing,
  reviews: defaultReviews,
  cta: defaultCta,
  footer: defaultFooter,
};
