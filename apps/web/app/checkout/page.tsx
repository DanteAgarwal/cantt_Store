'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle2,
  Lock,
  ArrowLeft,
  ShoppingBag,
  Tag,
  AlertCircle,
  Clock,
  Sparkles,
  MapPin,
  Phone,
  User,
  Building,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

const indianStates = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, shippingFee, total, clearCart } = useCart();
  const { user, profile } = useAuth();

  // Form states
  const [fullName, setFullName] = useState(profile?.fullName || '');
  const [phone, setPhone] = useState(profile?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [isDefencePersonnel, setIsDefencePersonnel] = useState(false);
  const [regimentUnit, setRegimentUnit] = useState('');
  const [addressLine1, setAddressLine1] = useState('');
  const [addressLine2, setAddressLine2] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('Delhi');
  const [pincode, setPincode] = useState('');

  // Shipping & Payment selections
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card'>('upi');

  // Coupon code
  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const effectiveShipping =
    shippingMethod === 'express' ? shippingFee + 50 : shippingFee;

  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const finalTotal = Math.max(0, subtotal - discountAmount + effectiveShipping);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponCode.trim().toUpperCase();

    if (code === 'JAIHIND' || code === 'DEFENCE10') {
      setDiscountPercent(10);
      setCouponApplied(true);
    } else if (code === 'PARA20') {
      setDiscountPercent(20);
      setCouponApplied(true);
    } else {
      setCouponError('Invalid code. Try "JAIHIND" for 10% military discount.');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!fullName.trim() || !phone.trim() || !addressLine1.trim() || !city.trim() || !pincode.trim()) {
      setSubmitError('Please fill in all mandatory delivery details.');
      return;
    }

    if (pincode.trim().length !== 6) {
      setSubmitError('Please enter a valid 6-digit PIN code.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Generate military order number
      const orderId = `CS-${Date.now().toString().slice(-6)}`;
      const orderData = {
        orderId,
        items,
        total: finalTotal,
        subtotal,
        discount: discountAmount,
        shipping: effectiveShipping,
        shippingAddress: {
          fullName,
          phone,
          email,
          isDefencePersonnel,
          regimentUnit,
          line1: addressLine1,
          line2: addressLine2,
          city,
          state: stateName,
          pincode,
        },
        shippingMethod,
        paymentMethod,
        placedAt: new Date().toISOString(),
      };

      // Save order into localStorage history
      try {
        const history = JSON.parse(localStorage.getItem('cantt_orders_history') || '[]');
        history.unshift(orderData);
        localStorage.setItem('cantt_orders_history', JSON.stringify(history));
        sessionStorage.setItem(`order_${orderId}`, JSON.stringify(orderData));
      } catch (storageErr) {
        console.warn('LocalStorage order save:', storageErr);
      }

      // Clear Cart
      clearCart();

      // Navigate to order confirmation
      setTimeout(() => {
        router.push(`/order-success/${orderId}`);
      }, 800);
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to place order. Please retry.');
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <AnnouncementBar />
        <Header />
        <main className="min-h-screen py-16 bg-background flex items-center justify-center">
          <div className="card p-10 max-w-md w-full mx-4 text-center space-y-4 shadow-card">
            <div className="w-16 h-16 rounded-full bg-surface-2 border border-border flex items-center justify-center mx-auto text-muted">
              <ShoppingBag size={28} />
            </div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              Your Tactical Bag is Empty
            </h1>
            <p className="text-xs text-muted leading-relaxed">
              You haven't selected any military apparel or equipment to checkout yet. Explore our authentic merchandise catalogue.
            </p>
            <div className="pt-2">
              <Link href="/shop" className="btn-primary w-full py-3 text-xs font-bold block text-center shadow-md">
                Browse Military Gear
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-screen py-8 md:py-12 bg-background">
        <div className="container-main max-w-6xl">
          {/* Breadcrumb / Back Link */}
          <div className="flex items-center justify-between pb-6 mb-8 border-b border-border/80 gap-4">
            <div>
              <div className="flex items-center gap-2 text-xs text-muted mb-1">
                <Link href="/cart" className="hover:text-foreground inline-flex items-center gap-1">
                  <ArrowLeft size={12} /> Bag
                </Link>
                <span>/</span>
                <span className="text-accent font-medium">Checkout</span>
              </div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Dispatch & Delivery Clearance
              </h1>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted bg-surface-2 px-3 py-1.5 rounded-full border border-border">
              <Lock size={12} className="text-success" />
              <span>256-Bit SSL Encrypted</span>
            </div>
          </div>

          <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (7 cols): Address, Shipping, Payment */}
            <div className="lg:col-span-7 space-y-6">
              {submitError && (
                <div className="p-4 bg-danger/10 border border-danger/30 rounded-xl text-danger text-xs flex items-center gap-2.5">
                  <AlertCircle size={18} className="flex-shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Step 1: Shipping Address */}
              <div className="card p-6 border border-border space-y-4 shadow-card">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-olive text-white text-[11px] font-bold flex items-center justify-center">
                      1
                    </span>
                    <span>Consignment Destination Address</span>
                  </h2>
                  <span className="text-[11px] text-muted">India Postal Service</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Full Name <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Capt. Vikram Batra / Rahul Verma"
                        className="w-full bg-surface-2 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
                      />
                      <User size={14} className="absolute left-3 top-3 text-muted" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      Mobile Number <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-surface-2 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
                      />
                      <Phone size={14} className="absolute left-3 top-3 text-muted" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Email Address (For Tracking & Invoice)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@defence.gov.in or email@domain.com"
                    className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
                  />
                </div>

                {/* Defence Personnel Checkbox */}
                <div className="p-3.5 rounded-xl bg-charcoal/60 border border-olive/30 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDefencePersonnel}
                      onChange={(e) => setIsDefencePersonnel(e.target.checked)}
                      className="w-4 h-4 rounded border-border accent-accent"
                    />
                    <span className="text-xs font-bold text-foreground">
                      Delivering to Defence Station / Cantonment / Unit?
                    </span>
                  </label>
                  {isDefencePersonnel && (
                    <div className="pt-2 animate-fade-in">
                      <input
                        type="text"
                        value={regimentUnit}
                        onChange={(e) => setRegimentUnit(e.target.value)}
                        placeholder="Battalion, Regiment, Officer Mess, or Station HQ"
                        className="w-full bg-surface border border-border rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Address Line 1 <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                    placeholder="House/Quarter/Barrack No., Street, Area"
                    className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Address Line 2 (Optional)
                  </label>
                  <input
                    type="text"
                    value={addressLine2}
                    onChange={(e) => setAddressLine2(e.target.value)}
                    placeholder="Landmark, Near Gate, Military Camp"
                    className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      City <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Pune, Jaipur"
                      className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      State <span className="text-danger">*</span>
                    </label>
                    <select
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent"
                    >
                      {indianStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">
                      PIN Code <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 110010"
                      className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2.5 text-xs font-mono text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Step 2: Delivery Option */}
              <div className="card p-6 border border-border space-y-4 shadow-card">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-olive text-white text-[11px] font-bold flex items-center justify-center">
                      2
                    </span>
                    <span>Shipping Method</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setShippingMethod('standard')}
                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      shippingMethod === 'standard'
                        ? 'bg-olive/10 border-olive text-foreground'
                        : 'bg-surface-2 border-border text-muted hover:border-olive/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'standard'}
                      onChange={() => setShippingMethod('standard')}
                      className="mt-0.5 accent-accent"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">Standard Dispatch</span>
                        <span className="text-xs font-bold text-accent">
                          {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">
                        Tracked India Post / Military Logistics (3-5 Days)
                      </p>
                    </div>
                  </label>

                  <label
                    onClick={() => setShippingMethod('express')}
                    className={`p-4 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${
                      shippingMethod === 'express'
                        ? 'bg-olive/10 border-olive text-foreground'
                        : 'bg-surface-2 border-border text-muted hover:border-olive/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="shipping"
                      checked={shippingMethod === 'express'}
                      onChange={() => setShippingMethod('express')}
                      className="mt-0.5 accent-accent"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">Priority Air Dispatch</span>
                        <span className="text-xs font-bold text-accent">
                          {shippingFee === 0 ? '₹50' : `₹${shippingFee + 50}`}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted mt-0.5">
                        BlueDart / Bluedart Air Priority (1-2 Days)
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Step 3: Payment Method */}
              <div className="card p-6 border border-border space-y-4 shadow-card">
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                  <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-olive text-white text-[11px] font-bold flex items-center justify-center">
                      3
                    </span>
                    <span>Payment Mode</span>
                  </h2>
                  <span className="text-[11px] text-muted">Safe & Verified</span>
                </div>

                <div className="space-y-2.5">
                  <label
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'upi'
                        ? 'bg-olive/10 border-olive'
                        : 'bg-surface-2 border-border hover:border-olive/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'upi'}
                        onChange={() => setPaymentMethod('upi')}
                        className="accent-accent"
                      />
                      <div>
                        <p className="font-bold text-xs text-foreground">
                          UPI QR / Instant Pay (Google Pay, PhonePe, Paytm, BHIM)
                        </p>
                        <p className="text-[11px] text-muted">Instant zero-fee payment confirmation</p>
                      </div>
                    </div>
                    <span className="badge badge-accent text-[10px]">Fastest</span>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('card')}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'card'
                        ? 'bg-olive/10 border-olive'
                        : 'bg-surface-2 border-border hover:border-olive/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="accent-accent"
                      />
                      <div>
                        <p className="font-bold text-xs text-foreground">
                          Credit / Debit Card & Netbanking
                        </p>
                        <p className="text-[11px] text-muted">Visa, Mastercard, RuPay, Defence Salary Accounts</p>
                      </div>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      paymentMethod === 'cod'
                        ? 'bg-olive/10 border-olive'
                        : 'bg-surface-2 border-border hover:border-olive/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="accent-accent"
                      />
                      <div>
                        <p className="font-bold text-xs text-foreground">
                          Cash on Delivery (Pay at Station / Doorstep)
                        </p>
                        <p className="text-[11px] text-muted">Verify consignment package before payment</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Order Summary & Place Order */}
            <div className="lg:col-span-5 space-y-6">
              <div className="card p-6 border border-border space-y-4 shadow-card sticky top-24">
                <h2 className="text-sm font-bold text-foreground border-b border-border/80 pb-3 flex items-center justify-between">
                  <span>Order Consignment Summary</span>
                  <span className="text-xs font-mono text-muted">{items.length} {items.length === 1 ? 'item' : 'items'}</span>
                </h2>

                {/* Items preview list */}
                <div className="max-h-60 overflow-y-auto divide-y divide-border/60 pr-1 space-y-2">
                  {items.map((item) => (
                    <div key={item.id} className="pt-2 flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-surface-2 border border-border flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xl">🪖</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-foreground line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-muted">
                          Qty: {item.quantity} {item.attributes?.Size ? `• Size: ${item.attributes.Size}` : ''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 font-display font-bold text-xs text-foreground">
                        ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Promo Code Input */}
                <div className="pt-2 border-t border-border/80">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Military Code (e.g. JAIHIND)"
                      className="flex-1 bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs font-mono uppercase text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="btn-secondary text-xs px-3.5 py-2 font-bold"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-[11px] text-danger mt-1.5">{couponError}</p>
                  )}
                  {couponApplied && (
                    <p className="text-[11px] text-success font-semibold mt-1.5 flex items-center gap-1">
                      <CheckCircle2 size={12} />
                      <span>{discountPercent}% Military Discount Applied!</span>
                    </p>
                  )}
                </div>

                {/* Calculation Breakdown */}
                <div className="space-y-2 pt-2 border-t border-border/80 text-xs">
                  <div className="flex justify-between text-muted">
                    <span>Bag Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-success font-medium">
                      <span>Military Discount ({discountPercent}%)</span>
                      <span>-₹{discountAmount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-muted">
                    <span>Shipping Fee</span>
                    <span>{effectiveShipping === 0 ? <strong className="text-success">FREE</strong> : `₹${effectiveShipping}`}</span>
                  </div>

                  <div className="flex justify-between items-baseline pt-2 border-t border-border font-display font-bold text-foreground text-base">
                    <span>Total Amount</span>
                    <span className="text-accent text-xl">₹{finalTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-glow-accent active:scale-98 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-charcoal-900 border-t-transparent rounded-full animate-spin" />
                      <span>Authorising Consignment...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={14} />
                      <span>Place Military Order • ₹{finalTotal.toLocaleString('en-IN')}</span>
                    </>
                  )}
                </button>

                {/* Guarantees */}
                <div className="pt-2 text-[11px] text-muted space-y-1.5 border-t border-border/60">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={14} className="text-accent" />
                    <span>Official Military Specifications Guaranteed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={14} className="text-accent" />
                    <span>Tracked Delivery Across Army Stations & Pin Codes</span>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </>
  );
}
