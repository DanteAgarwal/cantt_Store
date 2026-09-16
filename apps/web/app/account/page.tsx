'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Shield,
  Package,
  LogOut,
  Settings,
  Award,
  ExternalLink,
  MapPin,
  Clock,
  Truck,
  ArrowRight,
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { useAuth } from '@/context/AuthContext';

export default function AccountPage() {
  const router = useRouter();
  const { profile, user, isLoading, isAdmin, signOut } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    try {
      const savedOrders = JSON.parse(localStorage.getItem('cantt_orders_history') || '[]');
      setOrders(savedOrders);
    } catch (e) {
      console.warn('Failed to load order history:', e);
    }
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login?redirect=/account');
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-muted">Loading officer account...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

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
          <span className="text-foreground">My Account</span>
        </div>

        {/* Profile Header Banner */}
        <div className="p-6 md:p-8 rounded-2xl bg-surface border border-border mb-8 shadow-card flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-olive flex items-center justify-center text-white text-2xl font-bold font-display shadow-glow-olive flex-shrink-0">
              {profile?.fullName ? profile.fullName.charAt(0).toUpperCase() : 'O'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-bold text-xl md:text-2xl text-foreground">
                  {profile?.fullName || 'Officer'}
                </h1>
                {isAdmin && (
                  <span className="badge badge-accent text-[10px] font-bold uppercase">
                    Admin Staff
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">{profile?.email}</p>
              {profile?.regiment && (
                <div className="flex items-center gap-1.5 mt-1 text-xs text-olive-light font-medium">
                  <Award size={14} className="text-accent" />
                  <span>{profile.regiment}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {isAdmin && (
              <Link
                href="/admin"
                className="btn-primary text-xs px-5 py-2.5 flex items-center gap-2 flex-1 md:flex-initial justify-center shadow-md"
              >
                <Shield size={16} />
                <span>Admin Dashboard</span>
                <ExternalLink size={14} />
              </Link>
            )}

            <button
              onClick={handleSignOut}
              className="btn-secondary text-xs px-4 py-2.5 flex items-center gap-1.5 text-muted hover:text-danger hover:border-danger/40 transition-colors flex-1 md:flex-initial justify-center"
            >
              <LogOut size={14} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Account Details & Orders Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Quick Profile Info */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-card space-y-4">
              <h2 className="font-display font-bold text-sm uppercase tracking-wider text-foreground flex items-center gap-2 border-b border-border/80 pb-3">
                <User size={16} className="text-accent" />
                <span>Service Details</span>
              </h2>

              <dl className="space-y-3 text-xs">
                <div>
                  <dt className="text-muted">Account Status</dt>
                  <dd className="text-success font-semibold flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-success" /> Active Verification
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Unit / Regiment</dt>
                  <dd className="text-foreground font-medium mt-0.5">
                    {profile?.regiment || 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Phone Number</dt>
                  <dd className="text-foreground font-medium mt-0.5">
                    {profile?.phone || '+91 98765 43210'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">Member Privileges</dt>
                  <dd className="text-accent font-semibold mt-0.5">
                    Defence & Veteran Special Dispatch
                  </dd>
                </div>
              </dl>
            </div>

            {/* Quick Links */}
            <div className="p-5 rounded-2xl bg-surface border border-border shadow-card space-y-3">
              <h3 className="font-display font-bold text-sm uppercase tracking-wider text-foreground mb-2">
                Quick Shortcuts
              </h3>
              <Link
                href="/shop"
                className="flex items-center justify-between text-xs text-muted hover:text-accent p-2 rounded-lg hover:bg-surface-2 transition-colors"
              >
                <span>Browse Regimental Gear</span>
                <span>→</span>
              </Link>
              <Link
                href="/bulk-orders"
                className="flex items-center justify-between text-xs text-muted hover:text-accent p-2 rounded-lg hover:bg-surface-2 transition-colors"
              >
                <span>Request Unit Wholesale Quote</span>
                <span>→</span>
              </Link>
              <Link
                href="/wishlist"
                className="flex items-center justify-between text-xs text-muted hover:text-accent p-2 rounded-lg hover:bg-surface-2 transition-colors"
              >
                <span>Saved Wishlist</span>
                <span>→</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Orders & Deliveries */}
          <div className="lg:col-span-8 space-y-6">
            <div className="p-6 rounded-2xl bg-surface border border-border shadow-card">
              <div className="flex items-center justify-between border-b border-border/80 pb-4 mb-6">
                <h2 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <Package size={18} className="text-accent" />
                  <span>Order History</span>
                </h2>
                <span className="text-xs text-muted">Direct from CSD & Cantt Supply</span>
              </div>

              {orders.length === 0 ? (
                /* Empty state for new customer */
                <div className="text-center py-12 px-4 space-y-3">
                  <div className="w-16 h-16 rounded-2xl bg-surface-2 border border-border flex items-center justify-center text-3xl mx-auto text-muted">
                    📦
                  </div>
                  <h3 className="font-display font-bold text-base text-foreground">
                    No orders placed yet
                  </h3>
                  <p className="text-xs text-muted max-w-sm mx-auto">
                    When you place an order for tactical t-shirts, berets, or jackets, you can track military dispatch updates right here.
                  </p>
                  <div className="pt-2">
                    <Link href="/shop" className="btn-primary text-xs px-6 py-2.5 inline-block">
                      Explore Catalogue
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((o: any) => (
                    <div
                      key={o.orderId}
                      className="p-4 sm:p-5 rounded-xl bg-surface-2/60 border border-border space-y-3 hover:border-olive/50 transition-colors"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-accent">{o.orderId}</span>
                          <span className="text-muted">•</span>
                          <span className="text-muted">
                            {new Date(o.placedAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="badge badge-accent text-[10px] font-bold">
                            In Transit / Depot Inspection
                          </span>
                          <span className="font-display font-bold text-foreground text-sm">
                            ₹{o.total?.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      {/* Items thumbnails */}
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto py-1">
                          {o.items?.map((it: any) => (
                            <div
                              key={it.id}
                              className="w-12 h-12 rounded-lg bg-surface border border-border overflow-hidden flex-shrink-0 flex items-center justify-center"
                              title={`${it.name} (x${it.quantity})`}
                            >
                              {it.imageUrl ? (
                                <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                              ) : (
                                <span>🪖</span>
                              )}
                            </div>
                          ))}
                        </div>

                        <Link
                          href={`/order-success/${o.orderId}`}
                          className="btn-secondary text-xs px-3.5 py-2 font-bold inline-flex items-center gap-1.5 flex-shrink-0"
                        >
                          <Truck size={13} />
                          <span>Track</span>
                          <ArrowRight size={12} />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}
