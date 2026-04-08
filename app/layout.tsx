import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import FirebaseProvider from '@/components/FirebaseProvider';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'EduFlow | Virtual Classroom',
  description: 'A premium virtual classroom SaaS for handout management, AI summaries, audio reading, and live online teaching.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body suppressHydrationWarning className="font-sans antialiased bg-slate-50 text-slate-900">
        <FirebaseProvider>
          {children}
        </FirebaseProvider>
      </body>
    </html>
  );
}
