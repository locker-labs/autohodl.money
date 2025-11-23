import type { Metadata } from 'next';
import { Albert_Sans } from 'next/font/google';
import { headers } from 'next/headers'; // added
import { Toaster } from 'sonner';
import ContextProvider from '@/context';
import './globals.css';

const albertSans = Albert_Sans({
  variable: '--font-albert-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://autohodl.money'),
  title: {
    default: 'AutoHODL',
    template: '%s | AutoHODL',
  },
  description: 'Save while you spend. Automatically round up your transactions and save the spare change.',
  keywords: ['DeFi', 'Savings', 'Crypto', 'Roundups', 'AutoHODL', 'Ethereum', 'Linea', 'Sepolia', 'Invest', 'Yield'],
  authors: [{ name: 'AutoHODL Team' }],
  openGraph: {
    title: 'AutoHODL',
    description: 'Save while you spend. Automatically round up your transactions and save the spare change.',
    url: 'https://autohodl.money',
    siteName: 'AutoHODL',
    locale: 'en_US',
    type: 'website',
    images: [
      {
        url: '/hero.landing.png',
        width: 1200,
        height: 630,
        alt: 'AutoHODL Preview',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AutoHODL',
    description: 'Save while you spend. Automatically round up your transactions and save the spare change.',
    images: ['/hero.landing.png'],
  },
  appleWebApp: {
    title: 'AutoHODL',
  },
  icons: {
    icon: '/web-app-manifest-192x192.png',
    apple: '/web-app-manifest-192x192.png',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersData = await headers();
  const cookies = headersData.get('cookie');

  return (
    <html lang='en'>
      <body className={`${albertSans.variable} font-sans antialiased`}>
        <ContextProvider cookies={cookies}>{children}</ContextProvider>
        <Toaster position='top-center' />
      </body>
    </html>
  );
}
