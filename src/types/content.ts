export interface HeaderContent {
  logoLetter: string;
  brandName: string;
  navBenefits: string;
  navAbout: string;
  navPricing: string;
  navReviews: string;
  loginButton: string;
  mobileCtaButton: string;
}

export interface HeroContent {
  badge: string;
  headingPrefix: string;
  headingHighlight: string;
  headingSuffix: string;
  subtitle: string;
  ctaButton: string;
  ratingText: string;
  roiLabel: string;
  roiValue: string;
  leadsLabel: string;
  leadsValue: string;
}

export interface BenefitCard {
  title: string;
  description: string;
}

export interface BenefitsContent {
  heading: string;
  subtitle: string;
  cards: BenefitCard[];
}

export interface AboutContent {
  name: string;
  label: string;
  heading: string;
  bio: string;
  achievement1: string;
  achievement2: string;
  achievement3: string;
  quote: string;
  ctaButton: string;
  experienceYears: string;
  experienceLabel: string;
}

export interface PricingContent {
  heading: string;
  subtitle: string;
}

export interface ReviewsContent {
  heading: string;
}

export interface CtaContent {
  heading: string;
  subtitle: string;
  ctaButton: string;
  guaranteeLabel: string;
  guaranteeBadge: string;
}

export interface FooterContent {
  brandName: string;
  description: string;
  navHeading: string;
  navLink1: string;
  navLink2: string;
  navLink3: string;
  navLink4: string;
  contactsHeading: string;
  email: string;
  instagram: string;
  facebook: string;
  copyright: string;
  privacyLink: string;
  offerLink: string;
}

export interface SeoContent {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
}

export interface SiteContent {
  header: HeaderContent;
  hero: HeroContent;
  benefits: BenefitsContent;
  about: AboutContent;
  pricing: PricingContent;
  reviews: ReviewsContent;
  cta: CtaContent;
  footer: FooterContent;
}
