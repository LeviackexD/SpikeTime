
import type { Metadata } from 'next';
import { Poppins, Caveat } from 'next/font/google';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import { SessionProvider } from '@/context/session-context';
import { ThemeProvider } from '@/context/theme-provider';
import { AuthProvider } from '@/context/auth-context';
import { LanguageProvider } from '@/context/language-context';
import { VolleyballIcon } from '@/components/icons/volleyball-icon';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-poppins',
  weight: ['400', '600', '700'],
});

const caveat = Caveat({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-caveat',
  weight: ['400', '700'],
});

export const metadata: Metadata = {
  title: 'SpikeTime - Inverness Eagles',
  description: 'Volleyball session management for the Inverness Eagles club.',
  manifest: '/manifest.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body className={`${poppins.variable} ${caveat.variable} font-body antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <LanguageProvider>
            <AuthProvider>
              <SessionProvider>
                <AppLayout>{children}</AppLayout>
              </SessionProvider>
            </AuthProvider>
            <Toaster />
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
