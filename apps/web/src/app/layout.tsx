import type { Metadata } from 'next';
import { Albert_Sans } from 'next/font/google';
import { headers } from 'next/headers'; // added
import './globals.css';
import ContextProvider from '@/context';
import { Toaster } from 'sonner';

const albertSans = Albert_Sans({
  variable: '--font-albert-sans',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'autohodl.money',
  description: 'Save while you spend',
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
