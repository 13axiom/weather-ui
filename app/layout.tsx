import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import MobileThemeForcer from '@/components/MobileThemeForcer';
import { getThemeCssVars } from '@/lib/theme';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Running Portal',
  description: 'Weather, air quality and running calendar for St. Petersburg & Cyprus',
  viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cssVars = getThemeCssVars();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inject theme CSS custom properties — edit theme.config.json to change */}
        <style dangerouslySetInnerHTML={{ __html: cssVars }} />
      </head>
      <body className={`${inter.variable} font-sans`}>
        <Providers>
          {/* Forces dark theme on mobile (≤ 430 px) */}
          <MobileThemeForcer />
          {children}
        </Providers>
      </body>
    </html>
  );
}
