'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Calendar,
  Clock,
  ArrowRight,
  ShieldCheck,
  Copy,
  Check,
  Download,
} from 'lucide-react';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function OrderSuccessPage() {
  const params = useParams();
  const orderId = (params?.id as string) || `CS-${Date.now().toString().slice(-6)}`;

  const [order, setOrder] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(`order_${orderId}`);
      if (stored) {
        setOrder(JSON.parse(stored));
      } else {
        // Look in history
        const history = JSON.parse(localStorage.getItem('cantt_orders_history') || '[]');
        const found = history.find((o: any) => o.orderId === orderId);
        if (found) setOrder(found);
      }
    } catch (e) {
      console.warn('Failed to load order:', e);
    }
  }, [orderId]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const deliveryDate = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toLocaleDateString(
    'en-IN',
    {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    },
  );

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-screen py-10 md:py-16 bg-background">
        <div className="container-main max-w-4xl space-y-8">
          {/* Success Banner */}
          <div className="card p-8 md:p-10 border border-success/40 bg-gradient-to-b from-success/10 via-surface to-surface text-center space-y-4 shadow-card">
            <div className="w-16 h-16 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mx-auto text-success shadow-glow-olive">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-1">
              <span className="badge badge-accent text-xs uppercase font-bold tracking-widest px-3 py-1">
                Order Authorised
              </span>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Consignment Confirmed!
              </h1>
              <p className="text-xs md:text-sm text-muted max-w-md mx-auto">
                Thank you for choosing Cantt Store. Your order has been registered and sent to Central Ordnance Depot for quality inspection.
              </p>
            </div>

            {/* Reference Number Box */}
            <div className="inline-flex items-center gap-3 p-3 bg-surface-2 border border-border rounded-xl font-mono text-xs">
              <span className="text-muted">Order Reference:</span>
              <span className="text-accent font-bold text-sm tracking-wider">{orderId}</span>
              <button
                onClick={copyOrderId}
                className="text-muted hover:text-foreground p-1 transition-colors"
                title="Copy reference code"
              >
                {copied ? <Check size={14} className="text-success" /> : <Copy size={14} />}
              </button>
            </div>
          </div>

          {/* Tracking Timeline */}
          <div className="card p-6 md:p-8 border border-border space-y-6 shadow-card">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-3">
              <Truck size={16} className="text-accent" />
              <span>Consignment Dispatch Progress</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
              <div className="flex sm:flex-col items-center sm:items-start gap-3 p-3 rounded-xl bg-surface-2 border border-olive/30">
                <div className="w-8 h-8 rounded-full bg-olive text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  ✓
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Order Booked</p>
                  <p className="text-[10px] text-muted">Clearance passed</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-start gap-3 p-3 rounded-xl bg-surface-2 border border-accent/40">
                <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent text-accent flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Depot Inspection</p>
                  <p className="text-[10px] text-accent">Under inspection</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-start gap-3 p-3 rounded-xl bg-surface-2/60 border border-border/60 opacity-60">
                <div className="w-8 h-8 rounded-full bg-surface border border-border text-muted flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Tracked Dispatch</p>
                  <p className="text-[10px] text-muted">India Post / Air Cargo</p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-start gap-3 p-3 rounded-xl bg-surface-2/60 border border-border/60 opacity-60">
                <div className="w-8 h-8 rounded-full bg-surface border border-border text-muted flex items-center justify-center font-bold text-xs flex-shrink-0">
                  4
                </div>
                <div>
                  <p className="text-xs font-bold text-foreground">Station Delivery</p>
                  <p className="text-[10px] text-muted">Est. {deliveryDate}</p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-charcoal/60 rounded-xl border border-olive/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-muted">
                <Clock size={14} className="text-accent" />
                <span>Estimated Station Arrival: <strong className="text-foreground">{deliveryDate}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <MapPin size={14} className="text-accent" />
                <span>Dispatch Depot: <strong className="text-foreground">COD Delhi Cantt</strong></span>
              </div>
            </div>
          </div>

          {/* Consignment Items Breakdown (if loaded from session) */}
          {order?.items && order.items.length > 0 && (
            <div className="card p-6 md:p-8 border border-border space-y-4 shadow-card">
              <h2 className="text-sm font-bold text-foreground border-b border-border/80 pb-3 flex items-center justify-between">
                <span>Dispatched Items</span>
                <span className="font-mono text-xs text-muted font-normal">
                  Total: ₹{order.total?.toLocaleString('en-IN')}
                </span>
              </h2>

              <div className="divide-y divide-border/60">
                {order.items.map((item: any) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <span>🪖</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-display font-bold text-foreground">
                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/shop"
              className="btn-primary w-full sm:w-auto px-8 py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md"
            >
              <span>Explore More Merchandise</span>
              <ArrowRight size={14} />
            </Link>

            <Link
              href="/account"
              className="btn-secondary w-full sm:w-auto px-6 py-3 text-xs font-semibold flex items-center justify-center gap-2"
            >
              <span>View Account & Order History</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
