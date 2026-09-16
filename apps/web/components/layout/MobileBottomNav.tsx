'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, ShoppingCart, Heart, User } from 'lucide-react';
import { clsx } from 'clsx';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

export function MobileBottomNav() {
  const pathname = usePathname();
  const { openCart, totalItems } = useCart();
  const { totalWishlist } = useWishlist();
  const { user } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-surface/95 backdrop-blur-md border-t border-border pb-safe">
      <div className="flex items-center justify-around">
        <Link
          href="/"
          className={clsx(
            'flex flex-col items-center justify-center py-2.5 px-2 flex-1 gap-1 transition-colors relative',
            pathname === '/' ? 'text-accent' : 'text-muted hover:text-foreground'
          )}
          aria-label="Home"
        >
          <Home size={20} strokeWidth={pathname === '/' ? 2.5 : 1.5} />
          <span className="text-[11px] font-medium">Home</span>
          {pathname === '/' && (
            <span className="absolute top-0 w-8 h-0.5 bg-accent rounded-full" />
          )}
        </Link>

        <Link
          href="/shop"
          className={clsx(
            'flex flex-col items-center justify-center py-2.5 px-2 flex-1 gap-1 transition-colors relative',
            pathname.startsWith('/shop') || pathname.startsWith('/category') ? 'text-accent' : 'text-muted hover:text-foreground'
          )}
          aria-label="Shop"
        >
          <ShoppingBag size={20} strokeWidth={pathname.startsWith('/shop') ? 2.5 : 1.5} />
          <span className="text-[11px] font-medium">Shop</span>
          {(pathname.startsWith('/shop') || pathname.startsWith('/category')) && (
            <span className="absolute top-0 w-8 h-0.5 bg-accent rounded-full" />
          )}
        </Link>

        {/* Cart Drawer Trigger */}
        <button
          onClick={openCart}
          className="flex flex-col items-center justify-center py-2.5 px-2 flex-1 gap-1 transition-colors text-muted hover:text-foreground relative"
          aria-label="Cart"
        >
          <div className="relative">
            <ShoppingCart size={20} strokeWidth={1.5} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-accent text-black text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center animate-scale-in">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium">Bag</span>
        </button>

        <Link
          href="/wishlist"
          className={clsx(
            'flex flex-col items-center justify-center py-2.5 px-2 flex-1 gap-1 transition-colors relative',
            pathname === '/wishlist' ? 'text-accent' : 'text-muted hover:text-foreground'
          )}
          aria-label="Wishlist"
        >
          <div className="relative">
            <Heart size={20} strokeWidth={pathname === '/wishlist' ? 2.5 : 1.5} />
            {totalWishlist > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-danger text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center animate-scale-in">
                {totalWishlist}
              </span>
            )}
          </div>
          <span className="text-[11px] font-medium">Saved</span>
          {pathname === '/wishlist' && (
            <span className="absolute top-0 w-8 h-0.5 bg-accent rounded-full" />
          )}
        </Link>

        <Link
          href={user ? '/account' : '/login'}
          className={clsx(
            'flex flex-col items-center justify-center py-2.5 px-2 flex-1 gap-1 transition-colors relative',
            pathname.startsWith('/account') || pathname.startsWith('/login') ? 'text-accent' : 'text-muted hover:text-foreground'
          )}
          aria-label={user ? 'Account' : 'Sign In'}
        >
          <User size={20} strokeWidth={pathname.startsWith('/account') || pathname.startsWith('/login') ? 2.5 : 1.5} />
          <span className="text-[11px] font-medium">{user ? 'Account' : 'Sign In'}</span>
          {(pathname.startsWith('/account') || pathname.startsWith('/login')) && (
            <span className="absolute top-0 w-8 h-0.5 bg-accent rounded-full" />
          )}
        </Link>
      </div>
    </nav>
  );
}
