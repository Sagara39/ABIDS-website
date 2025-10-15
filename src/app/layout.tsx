import type { Metadata } from 'next';
import { FirebaseClientProvider } from '@/firebase';
import { CartProvider } from '@/contexts/CartContext';
import { Toaster } from '@/components/ui/toaster';
import GlobalHeader from '@/components/GlobalHeader';
import './globals.css';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'ABIDS',
  description: 'A tablet-friendly customer UI for a college canteen.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <CartProvider>
            <GlobalHeader />
            <div className="pt-16">{children}</div>
            <Toaster />
            <div className="fixed bottom-4 right-4 z-50">
              <Link href="/balance">
                <Button size="lg" className="h-14 text-lg shadow-2xl w-48">
                  Check Balance
                </Button>
              </Link>
            </div>
          </CartProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
