export interface HeaderContent {
  logoLetter: string;
  brandName: string;
  navBenefits: string;
  navCurriculum: string;
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
  caseStudy1Client: string;
  caseStudy1Result: string;
  caseStudy2Client: string;
  caseStudy2Result: string;
  caseStudy3Client: string;
  caseStudy3Result: string;
  videoUrl: string;
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

export interface PersonaCard {
  title: string;
  description: string;
}

export interface TargetAudienceContent {
  heading: string;
  subtitle: string;
  cards: PersonaCard[];
}

export interface UspCard {
  title: string;
  description: string;
}

export interface UspContent {
  heading: string;
  subtitle: string;
  cards: UspCard[];
}

export interface CurriculumModule {
  title: string;
  description: string;
}

export interface CurriculumContent {
  heading: string;
  subtitle: string;
  modules: CurriculumModule[];
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
  usp: UspContent;
  benefits: BenefitsContent;
  about: AboutContent;
  pricing: PricingContent;
  reviews: ReviewsContent;
  cta: CtaContent;
  footer: FooterContent;
  targetAudience: TargetAudienceContent;
  curriculum: CurriculumContent;
}
