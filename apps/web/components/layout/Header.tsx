'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown, Shield } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useWishlist } from '@/context/WishlistContext';

const navCategories = [
  {
    name: 'Clothing',
    href: '/category/military-t-shirts',
    children: [
      { name: 'T-Shirts', href: '/category/military-t-shirts' },
      { name: 'Jackets', href: '/category/military-tactical-jackets' },
      { name: 'Sweaters', href: '/category/military-sweaters-jerseys' },
      { name: 'Thermal Wear', href: '/category/thermal-inner-wear' },
    ],
  },
  {
    name: 'Caps & Headwear',
    href: '/category/military-caps-headwear',
    children: [
      { name: 'Beret Caps', href: '/category/army-beret-cap' },
      { name: 'Regimental Caps', href: '/category/regimental-caps' },
    ],
  },
  { name: 'Tactical Gear', href: '/category/tactical-gear', children: [] },
  { name: 'Badges & Patches', href: '/category/regimental-badges-patches', children: [] },
  { name: 'Bags', href: '/category/military-bags-backpacks', children: [] },
];

export function Header() {
  const router = useRouter();
  const { openCart, totalItems } = useCart();
  const { totalWishlist } = useWishlist();
  const { user, profile, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setSearchOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border shadow-md">
      <div className="container-main">
        <div className="flex items-center h-16 gap-4">

          {/* Mobile menu button */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded bg-olive flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm">CS</span>
            </div>
            <span className="font-display font-bold text-xl text-foreground tracking-wide hidden sm:block">
              CANTT <span className="text-accent">STORE</span>
            </span>
          </Link>

          {/* Category dropdown (desktop) */}
          <div className="hidden md:block group relative">
            <button className="flex items-center gap-1 px-3 py-2 text-sm text-muted hover:text-foreground transition-colors">
              <span>Categories</span>
              <ChevronDown size={14} className="group-hover:rotate-180 transition-transform duration-200" />
            </button>
            {/* Mega menu */}
            <div className="absolute top-full left-0 mt-0 w-64 bg-surface border border-border rounded-b-lg shadow-card hidden group-hover:block z-50">
              {navCategories.map((cat) => (
                <div key={cat.name} className="group/item relative">
                  <Link
                    href={cat.href}
                    className="flex items-center justify-between px-4 py-3 text-sm text-muted hover:text-foreground hover:bg-surface-2 border-b border-border/50 transition-colors"
                  >
                    <span>{cat.name}</span>
                    {cat.children.length > 0 && <ChevronDown size={12} className="-rotate-90" />}
                  </Link>
                  {cat.children.length > 0 && (
                    <div className="absolute left-full top-0 w-48 bg-surface border border-border rounded-lg shadow-card hidden group-hover/item:block">
                      {cat.children.map((child) => (
                        <Link
                          key={child.name}
                          href={child.href}
                          className="block px-4 py-3 text-sm text-muted hover:text-foreground hover:bg-surface-2 border-b border-border/30 transition-colors"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-xl hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search military products, categories, regiments..."
                className="input pl-9 pr-4 py-2 text-sm w-full"
                aria-label="Search products"
              />
            </form>
          </div>

          {/* Right icons */}
          <div className="ml-auto flex items-center gap-1">
            {/* Mobile search toggle */}
            <button
              className="md:hidden btn-ghost p-2"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* Admin Portal Shortcut if Admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-olive/20 text-accent border border-olive/40 hover:bg-olive/30 transition-colors"
                title="Admin Command Dashboard"
              >
                <Shield size={13} />
                <span>Admin</span>
              </Link>
            )}

            {/* Account / Sign In */}
            {user ? (
              <Link
                href="/account"
                className="btn-ghost p-1.5 flex items-center gap-1.5 text-xs font-semibold text-foreground rounded-lg"
                aria-label="My Account"
                title={profile?.fullName || user.email || 'Account'}
              >
                <div className="w-7 h-7 rounded-full bg-olive text-white flex items-center justify-center text-xs font-bold font-display shadow-sm">
                  {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden xl:inline max-w-[90px] truncate">
                  {profile?.fullName?.split(' ')[0] || 'Account'}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="btn-ghost px-2.5 py-1.5 text-xs font-semibold flex items-center gap-1.5 text-muted hover:text-foreground rounded-lg"
                aria-label="Sign In"
              >
                <User size={18} />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="btn-ghost p-2 relative text-muted hover:text-foreground"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {totalWishlist > 0 && (
                <span className="absolute top-1 right-1 bg-danger text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center animate-scale-in">
                  {totalWishlist}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={openCart}
              className="relative flex items-center gap-2 px-3 py-2 bg-olive hover:bg-olive-dark text-white rounded transition-colors shadow-sm"
              aria-label="Open Cart"
            >
              <ShoppingCart size={18} className="text-white" />
              <span className="text-white text-sm font-semibold hidden sm:block">Cart</span>
              {/* Cart count badge */}
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-black text-xs font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center animate-scale-in">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile search bar */}
        {searchOpen && (
          <div className="md:hidden pb-3 animate-slide-up">
            <form onSubmit={handleSearch} className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                className="input pl-9 text-sm w-full"
                autoFocus
              />
            </form>
          </div>
        )}

        {/* Desktop nav links */}
        <nav className="hidden md:flex items-center gap-1 border-t border-border/50 pb-0 overflow-x-auto">
          <Link href="/shop" className="px-3 py-2.5 text-sm text-muted hover:text-foreground hover:text-accent transition-colors whitespace-nowrap">
            All Products
          </Link>
          {navCategories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="px-3 py-2.5 text-sm text-muted hover:text-accent transition-colors whitespace-nowrap"
            >
              {cat.name}
            </Link>
          ))}
          <Link href="/shop?tag=para" className="px-3 py-2.5 text-sm text-accent font-medium hover:text-accent-light transition-colors whitespace-nowrap">
            Shop by Regiment
          </Link>
          <Link href="/bulk-orders" className="px-3 py-2.5 text-sm text-muted hover:text-foreground transition-colors whitespace-nowrap">
            Bulk Orders
          </Link>
        </nav>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-surface border-t border-border animate-slide-up">
          <nav className="container-main py-4 flex flex-col gap-1">
            <Link href="/shop" className="px-4 py-3 text-sm text-muted hover:text-foreground hover:bg-surface-2 rounded transition-colors">All Products</Link>
            {navCategories.map((cat) => (
              <Link key={cat.name} href={cat.href} className="px-4 py-3 text-sm text-muted hover:text-foreground hover:bg-surface-2 rounded transition-colors">
                {cat.name}
              </Link>
            ))}
            <Link href="/account/orders" className="px-4 py-3 text-sm text-muted hover:text-foreground hover:bg-surface-2 rounded transition-colors">My Orders</Link>
            <Link href="/bulk-orders" className="px-4 py-3 text-sm text-accent font-medium hover:bg-surface-2 rounded transition-colors">Bulk & Custom Orders</Link>
          </nav>
        </div>
      )}
    </header>
  );
}
