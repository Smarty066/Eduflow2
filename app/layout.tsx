import type { Metadata } from 'next';
import { Inter, Outfit, Geist } from 'next/font/google';
import './globals.css';
import FirebaseProvider from '@/components/FirebaseProvider';
import ChatBot from '@/components/ChatBot';
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

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
    <html lang="en" className={cn(outfit.variable, "font-sans", geist.variable)}>
      <body suppressHydrationWarning className="font-sans antialiased bg-slate-50 text-slate-900">
        <FirebaseProvider>
          {children}
          <ChatBot context={typeof window !== 'undefined' && window.location.pathname.includes('/reader/') ? "You are helping a student with a specific handout. Provide answers based on the handout content if possible." : undefined} />
        </FirebaseProvider>
      </body>
    </html>
  );
}
