
import type { Metadata } from 'next';
import { AppLayout } from '@/components/layout/app-layout';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { SessionProvider } from '@/context/session-context';
import { ThemeProvider } from '@/context/theme-provider';
import { AuthProvider } from '@/context/auth-context';

export const metadata: Metadata = {
  title: 'Inverness Eagles',
  description: 'Inverness Eagles Volleyball Club',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <SessionProvider>
              <AppLayout>{children}</AppLayout>
            </SessionProvider>
          </AuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
