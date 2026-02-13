import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import { Analytics } from '@vercel/analytics/react';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SolFloLab - Solana Payment Links',
  description: 'Create payment links and get paid in SOL or USDC in seconds.',
  icons: {
    icon: '/favicon.svg',
    apple: '/logo-icon-512.png',
  },
  manifest: '/manifest.json',
  themeColor: '#00D26A',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SolFloLab',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Analytics />
      </body>
    </html>
  );
}
