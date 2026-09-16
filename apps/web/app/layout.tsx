import type { Metadata } from 'next';
import { Inter, Rajdhani } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { CartProvider } from '@/context/CartContext';
import { WishlistProvider } from '@/context/WishlistContext';
import { CartDrawer } from '@/components/cart/CartDrawer';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-rajdhani',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Cantt Store — Military & Tactical Merchandise',
    template: '%s | Cantt Store',
  },
  description:
    'Premium military-inspired clothing, tactical gear, regimental badges, caps, and accessories. Shop authentic designs for defence personnel, veterans, and enthusiasts.',
  keywords: [
    'military store',
    'army merchandise',
    'tactical gear',
    'regimental badges',
    'army caps',
    'military clothing India',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Cantt Store',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${rajdhani.variable}`}>
      <body className="bg-background text-foreground antialiased font-sans">
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              {children}
              <CartDrawer />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
