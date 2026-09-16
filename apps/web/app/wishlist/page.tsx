'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, ShoppingBag, Trash2, ArrowLeft, ShieldCheck, ShoppingCart } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';
import { useCart } from '@/context/CartContext';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function WishlistPage() {
  const { items, removeFromWishlist, totalWishlist } = useWishlist();
  const { addItem } = useCart();

  const handleMoveToCart = (item: any) => {
    addItem({
      id: item.id,
      productId: item.id,
      name: item.name,
      slug: item.slug,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      imageUrl: item.imageUrl,
      quantity: 1,
    });
    removeFromWishlist(item.id);
  };

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-screen py-8 md:py-12 bg-background">
        <div className="container-main max-w-5xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">My Wishlist</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-border/80 gap-4">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
                <span>Tactical Wishlist</span>
                <span className="text-xs px-2.5 py-1 rounded-full bg-surface-2 border border-border text-accent font-sans font-bold">
                  {totalWishlist} {totalWishlist === 1 ? 'item' : 'items'}
                </span>
              </h1>
              <p className="text-muted text-xs mt-1">
                Your saved military gear, clothing, badges, and tactical equipment
              </p>
            </div>

            <Link
              href="/shop"
              className="btn-secondary text-xs px-4 py-2 inline-flex items-center gap-2 self-start"
            >
              <ArrowLeft size={14} />
              <span>Continue Shopping</span>
            </Link>
          </div>

          {items.length === 0 ? (
            <div className="card p-12 text-center max-w-md mx-auto my-12">
              <div className="w-16 h-16 rounded-full bg-surface-2 border border-border flex items-center justify-center mx-auto mb-4 text-muted">
                <Heart size={28} />
              </div>
              <h2 className="font-display font-bold text-xl text-foreground mb-2">
                Your Wishlist is Empty
              </h2>
              <p className="text-xs text-muted mb-6 leading-relaxed">
                Save your preferred military t-shirts, tactical jackets, caps, and insignia here for fast deployment to your bag later.
              </p>
              <Link href="/shop" className="btn-primary inline-flex text-xs font-bold px-6 py-2.5">
                Explore Tactical Catalogue
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="card group overflow-hidden border border-border flex flex-col hover:border-olive/50 transition-all shadow-card"
                >
                  <div className="aspect-square bg-surface-2 relative overflow-hidden flex items-center justify-center">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <span className="text-5xl">🪖</span>
                    )}

                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-3 right-3 w-9 h-9 rounded-full bg-surface/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted hover:text-danger hover:border-danger/50 transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <Link
                        href={`/product/${item.slug}`}
                        className="font-bold text-sm text-foreground hover:text-accent line-clamp-2 transition-colors"
                      >
                        {item.name}
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="font-display font-bold text-base text-accent">
                          ₹{item.price.toLocaleString('en-IN')}
                        </span>
                        {item.compareAtPrice && item.compareAtPrice > item.price && (
                          <span className="text-xs text-muted line-through">
                            ₹{item.compareAtPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleMoveToCart(item)}
                      className="btn-primary w-full text-xs py-2.5 font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                      <ShoppingCart size={14} />
                      <span>Move to Cart</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
