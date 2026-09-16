'use client';

import Link from 'next/link';
import { useState } from 'react';
import {
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  ArrowLeft,
  Tag,
  CheckCircle2,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useCart } from '@/context/CartContext';

export default function CartPage() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    totalItems,
    subtotal,
    freeShippingThreshold,
    freeShippingRemaining,
    shippingFee,
    total,
  } = useCart();

  const [promoCode, setPromoCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoSuccess, setPromoSuccess] = useState('');
  const [promoError, setPromoError] = useState('');

  const freeShippingPct = Math.min(
    100,
    Math.round(((freeShippingThreshold - freeShippingRemaining) / freeShippingThreshold) * 100),
  );

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const cleanCode = promoCode.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === 'DEFENCE10' || cleanCode === 'JAIHIND') {
      const disc = Math.round(subtotal * 0.1);
      setDiscountAmount(disc);
      setPromoSuccess(`Special ${cleanCode} applied: 10% discount (-₹${disc.toLocaleString('en-IN')})`);
    } else {
      setPromoError('Invalid coupon code. Try "DEFENCE10" for 10% off.');
    }
  };

  const finalTotal = Math.max(0, total - discountAmount);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 container-main py-8 md:py-12 pb-24 md:pb-12">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-muted mb-6">
          <Link href="/" className="hover:text-accent">
            Home
          </Link>
          <span>/</span>
          <span className="text-foreground">Shopping Cart</span>
        </div>

        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-8 flex items-center gap-3">
          <span>Shopping Cart</span>
          <span className="badge badge-accent text-xs">
            {totalItems} {totalItems === 1 ? 'item' : 'items'}
          </span>
        </h1>

        {items.length === 0 ? (
          <div className="max-w-md mx-auto text-center py-16 px-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-surface-2 border border-border flex items-center justify-center text-4xl mb-6 text-muted">
              🪖
            </div>
            <h2 className="font-display font-bold text-xl text-foreground mb-2">
              Your bag is currently empty
            </h2>
            <p className="text-sm text-muted mb-8 leading-relaxed">
              Explore our wide range of authentic regimental t-shirts, tactical jackets, beret caps, and army field gear.
            </p>
            <Link href="/shop" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold">
              <span>Explore Catalogue</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Cart Items (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Free Delivery Bar */}
              <div className="p-4 rounded-xl bg-surface border border-border/80">
                <div className="flex items-center justify-between text-xs mb-2">
                  {freeShippingRemaining > 0 ? (
                    <span className="text-muted">
                      Add <strong className="text-accent">₹{freeShippingRemaining}</strong> more for{' '}
                      <strong className="text-foreground">FREE Military Dispatch</strong>
                    </span>
                  ) : (
                    <span className="text-success font-semibold flex items-center gap-1.5">
                      <Truck size={14} /> You have unlocked FREE Delivery!
                    </span>
                  )}
                  <span className="font-bold text-accent">{freeShippingPct}%</span>
                </div>
                <div className="w-full h-2 bg-surface-2 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-500 rounded-full"
                    style={{ width: `${freeShippingPct}%` }}
                  />
                </div>
              </div>

              {/* Items Card */}
              <div className="rounded-2xl bg-surface border border-border overflow-hidden divide-y divide-border/60 shadow-card">
                {items.map((item) => {
                  const itemKey = item.variantId || item.productId;
                  return (
                    <div key={itemKey} className="p-4 md:p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                      {/* Thumbnail */}
                      <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-surface-2 border border-border/80 overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl text-olive/50">👕</span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.slug}`}
                          className="font-semibold text-sm md:text-base text-foreground hover:text-accent transition-colors line-clamp-1"
                        >
                          {item.name}
                        </Link>

                        {/* Selected Attributes */}
                        {item.attributes && Object.keys(item.attributes).length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {Object.entries(item.attributes).map(([k, v]) => (
                              <span
                                key={k}
                                className="px-2 py-0.5 rounded text-xs bg-surface-2 border border-border/60 text-muted"
                              >
                                {k}: <strong className="text-foreground">{v}</strong>
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="text-xs text-muted mt-1">
                          Unit Price: ₹{item.price.toLocaleString('en-IN')}
                        </div>
                      </div>

                      {/* Quantity Stepper & Price */}
                      <div className="flex items-center justify-between w-full sm:w-auto gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                        {/* Stepper */}
                        <div className="flex items-center border border-border rounded-lg bg-surface-2">
                          <button
                            onClick={() => updateQuantity(itemKey, item.quantity - 1)}
                            className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors font-bold"
                            aria-label="Decrease quantity"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(itemKey, item.quantity + 1)}
                            className="w-8 h-8 flex items-center justify-center text-muted hover:text-foreground hover:bg-surface transition-colors font-bold"
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right min-w-[80px]">
                          <span className="font-display font-bold text-base md:text-lg text-accent">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(itemKey)}
                          className="p-1.5 text-muted hover:text-danger rounded-lg hover:bg-surface-2 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Actions below items */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/shop"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-accent transition-colors"
                >
                  <ArrowLeft size={14} />
                  <span>Continue Shopping</span>
                </Link>
                <button
                  onClick={clearCart}
                  className="text-xs text-muted hover:text-danger transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Right Column: Summary & Checkout (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Promo Code Box */}
              <div className="p-5 rounded-2xl bg-surface border border-border shadow-card">
                <h2 className="text-xs font-bold uppercase tracking-wider text-foreground mb-3 flex items-center gap-1.5">
                  <Tag size={14} className="text-accent" />
                  <span>Coupon & Defence Discount</span>
                </h2>
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter DEFENCE10"
                    className="input text-xs uppercase flex-1"
                  />
                  <button type="submit" className="btn-secondary text-xs px-4 py-2 font-bold">
                    Apply
                  </button>
                </form>
                {promoSuccess && (
                  <p className="text-xs text-success mt-2 flex items-center gap-1">
                    <CheckCircle2 size={12} /> {promoSuccess}
                  </p>
                )}
                {promoError && (
                  <p className="text-xs text-danger mt-2">{promoError}</p>
                )}
              </div>

              {/* Order Summary */}
              <div className="p-6 rounded-2xl bg-surface border border-border shadow-card space-y-4">
                <h2 className="font-display font-bold text-lg text-foreground border-b border-border/80 pb-3">
                  Order Summary
                </h2>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between text-muted">
                    <span>Subtotal ({totalItems} items)</span>
                    <span className="text-foreground font-semibold">
                      ₹{subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Promo Discount</span>
                      <span className="font-semibold">-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted">
                    <span>Delivery Charges</span>
                    <span>
                      {shippingFee === 0 ? (
                        <span className="text-success font-semibold">FREE</span>
                      ) : (
                        `₹${shippingFee}`
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-muted text-[11px]">
                    <span>Estimated Tax (GST)</span>
                    <span>Included in prices</span>
                  </div>

                  <div className="flex justify-between text-base font-bold pt-3 border-t border-border text-foreground">
                    <span>Total Amount</span>
                    <span className="text-accent font-display text-xl">
                      ₹{finalTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <Link
                  href="/checkout"
                  className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-98"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight size={16} />
                </Link>

                <div className="pt-3 border-t border-border/60 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <ShieldCheck size={16} className="text-accent flex-shrink-0" />
                    <span>100% Genuine Military Specifications</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted">
                    <Truck size={16} className="text-accent flex-shrink-0" />
                    <span>Safe tracked delivery across India</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
