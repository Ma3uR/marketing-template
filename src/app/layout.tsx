import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Курс з таргетованої реклами | Таня Свідоренко',
  description:
    'Стань власним таргетологом за 14 днів. Навчись запускати рекламу, яка приносить реальні гроші, а не просто лайки.',
  keywords: [
    'таргетована реклама',
    'курс таргетолога',
    'Facebook реклама',
    'Instagram реклама',
    'маркетинг курс',
    'онлайн навчання',
  ],
  openGraph: {
    title: 'Курс з таргетованої реклами | Таня Свідоренко',
    description:
      'Стань власним таргетологом за 14 днів. Навчись запускати рекламу, яка приносить реальні гроші.',
    locale: 'uk_UA',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
