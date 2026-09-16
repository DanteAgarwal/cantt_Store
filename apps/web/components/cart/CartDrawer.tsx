'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function CartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    updateQuantity,
    removeItem,
    totalItems,
    subtotal,
    freeShippingThreshold,
    freeShippingRemaining,
    shippingFee,
    total,
  } = useCart();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCart();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeCart]);

  if (!isOpen) return null;

  const freeShippingPct = Math.min(
    100,
    Math.round(((freeShippingThreshold - freeShippingRemaining) / freeShippingThreshold) * 100),
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity animate-fade-in"
      />

      {/* Slide-over panel */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-surface border-l border-border/80 shadow-2xl flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="text-accent" size={20} />
              <h2 className="font-display font-bold text-lg text-foreground">
                Your Shopping Bag
              </h2>
              <span className="badge badge-accent text-xs">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              onClick={closeCart}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted hover:text-foreground hover:bg-surface-2 transition-colors"
              aria-label="Close cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="px-5 py-3 bg-charcoal/80 border-b border-border/60">
            {freeShippingRemaining > 0 ? (
              <p className="text-xs text-muted mb-1.5">
                Add <span className="font-bold text-accent">₹{freeShippingRemaining}</span> more to unlock <span className="text-foreground font-semibold">FREE Delivery</span>
              </p>
            ) : (
              <p className="text-xs text-success font-semibold mb-1.5 flex items-center gap-1.5">
                <Truck size={14} /> You unlocked FREE Military Dispatch!
              </p>
            )}
            <div className="w-full h-1.5 bg-surface-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-500 rounded-full"
                style={{ width: `${freeShippingPct}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-border/40">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-2xl bg-surface-2 flex items-center justify-center text-3xl mb-4 text-muted">
                  🪖
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-1">
                  Your bag is empty
                </h3>
                <p className="text-xs text-muted max-w-xs mb-6">
                  Equip yourself with premium tactical combat wear, regiment caps & field gear.
                </p>
                <button
                  onClick={closeCart}
                  className="btn-primary text-xs px-6 py-2.5"
                >
                  Explore Catalogue
                </button>
              </div>
            ) : (
              items.map((item) => {
                const itemKey = item.variantId || item.productId;
                return (
                  <div key={itemKey} className="pt-4 first:pt-0 flex gap-3.5">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 rounded-xl bg-surface-2 border border-border/80 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl text-olive/60">👕</span>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/product/${item.slug}`}
                            onClick={closeCart}
                            className="text-xs font-semibold text-foreground hover:text-accent transition-colors line-clamp-1"
                          >
                            {item.name}
                          </Link>
                          <button
                            onClick={() => removeItem(itemKey)}
                            className="text-muted hover:text-danger p-1 transition-colors flex-shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        {/* Selected Attributes */}
                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {Object.entries(item.attributes).map(([k, v]) => (
                              <span
                                key={k}
                                className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-surface-2 border border-border/60 text-muted"
                              >
                                {k}: <span className="text-foreground">{v}</span>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Quantity & Price */}
                      <div className="flex items-center justify-between pt-2 mt-auto">
                        {/* Stepper */}
                        <div className="flex items-center border border-border rounded-lg bg-surface-2 text-xs font-semibold">
                          <button
                            onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors"
                          >
                            -
                          </button>
                          <span className="w-7 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Line Price */}
                        <div className="text-right">
                          <span className="text-sm font-bold text-accent">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                          {item.compareAtPrice && item.compareAtPrice > item.price && (
                            <span className="block text-[10px] text-muted line-through">
                              ₹{(item.compareAtPrice * item.quantity).toLocaleString('en-IN')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-border bg-surface-2/40 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-muted">
                  <span>Subtotal</span>
                  <span className="text-foreground font-semibold">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Delivery</span>
                  <span>
                    {shippingFee === 0 ? (
                      <span className="text-success font-semibold">FREE</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-border/60">
                  <span className="text-foreground">Estimated Total</span>
                  <span className="text-accent text-base font-display">
                    ₹{total.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-98"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={14} />
                </Link>

                <div className="flex items-center justify-between text-[11px] pt-1 text-muted">
                  <Link
                    href="/cart"
                    onClick={closeCart}
                    className="hover:underline font-medium hover:text-foreground"
                  >
                    View Full Cart
                  </Link>
                  <span className="flex items-center gap-1 text-[10px]">
                    <ShieldCheck size={12} className="text-accent" /> Official Merchandise
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
