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
  TargetAudienceContent,
  UspContent,
  CurriculumContent,
} from '@/types/content';

export const defaultHeader: HeaderContent = {
  logoLetter: 'Т',
  brandName: 'Таня Сідоренко',
  navBenefits: 'Переваги',
  navCurriculum: 'Програма',
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
  name: 'Таня Сідоренко',
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
  caseStudy1Client: 'Інтернет-магазин одягу',
  caseStudy1Result: 'Зменшили вартість ліда з 25₴ до 8₴ за 3 тижні',
  caseStudy2Client: 'Стоматологічна клініка',
  caseStudy2Result: 'Збільшили кількість записів на 180% за місяць',
  caseStudy3Client: 'Онлайн-школа англійської',
  caseStudy3Result: 'ROI рекламних кампаній зріс до 340%',
  videoUrl: '',
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

export const defaultTargetAudience: TargetAudienceContent = {
  heading: 'Для кого цей курс',
  subtitle: 'Курс підходить кожному, хто хоче навчитися залучати клієнтів через таргетовану рекламу',
  cards: [
    {
      title: 'Підприємець',
      description:
        'Хочеш самостійно запускати рекламу і не переплачувати агенціям? Цей курс дасть тобі повний контроль над маркетинговим бюджетом.',
    },
    {
      title: 'Фрілансер',
      description:
        'Мрієш додати таргет до своїх послуг і заробляти більше? Отримай навички, які клієнти готові оплачувати.',
    },
    {
      title: 'SMM-менеджер',
      description:
        'Хочеш вирости від постингу до повноцінного digital-маркетолога? Таргет — твій наступний рівень.',
    },
    {
      title: 'Зміна кар\'єри',
      description:
        'Шукаєш нову професію з високим попитом? Таргетолог — одна з найзатребуваніших спеціальностей у digital.',
    },
  ],
};

export const defaultUsp: UspContent = {
  heading: 'Чому обирають наш курс',
  subtitle: 'Унікальні переваги, яких немає в жодного конкурента',
  cards: [
    {
      title: '14 днів інтенсиву',
      description:
        'Те, що інші розтягують на 2-2.5 місяці, ми конденсуємо в 14 інтенсивних днів практичного навчання.',
    },
    {
      title: 'Гарантія повернення коштів',
      description:
        'Якщо перший урок не виправдає твоїх очікувань — ми повернемо кошти без зайвих питань.',
    },
    {
      title: 'VIP персональне менторство',
      description:
        'Персональний доступ до інструктора, ексклюзивна підтримка та індивідуальна стратегія для твого бізнесу.',
    },
  ],
};

export const defaultCurriculum: CurriculumContent = {
  heading: 'Програма курсу',
  subtitle:
    'Покрокова програма з 7 модулів — від основ до запуску прибуткових кампаній',
  modules: [
    {
      title: 'Основи таргетованої реклами',
      description:
        'Як працює рекламний аукціон, структура кабінету, типи кампаній та їх цілі.',
    },
    {
      title: 'Аналіз цільової аудиторії',
      description:
        'Сегментація аудиторії, створення портрета клієнта, інструменти дослідження.',
    },
    {
      title: 'Створення рекламних креативів',
      description:
        'Формули заголовків, дизайн банерів, A/B тестування візуалів та текстів.',
    },
    {
      title: 'Налаштування Facebook Ads Manager',
      description:
        'Піксель, конверсії, каталог, ретаргетинг та lookalike аудиторії.',
    },
    {
      title: 'Бюджетування та оптимізація',
      description:
        'Розподіл бюджету, ставки, масштабування успішних кампаній.',
    },
    {
      title: 'Аналітика та звітність',
      description:
        'Ключові метрики, UTM-мітки, Google Analytics та оцінка ROI.',
    },
    {
      title: 'Запуск реальної кампанії',
      description:
        'Практичне завдання: створення та запуск рекламної кампанії для свого бізнесу.',
    },
  ],
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
  usp: defaultUsp,
  benefits: defaultBenefits,
  about: defaultAbout,
  pricing: defaultPricing,
  reviews: defaultReviews,
  cta: defaultCta,
  footer: defaultFooter,
  targetAudience: defaultTargetAudience,
  curriculum: defaultCurriculum,
};
