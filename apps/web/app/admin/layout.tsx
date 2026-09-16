'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderOpen,
  MessageSquare,
  ArrowLeft,
  Shield,
  ShieldAlert,
  LogOut,
  ExternalLink,
  Users,
  PlusCircle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { clsx } from 'clsx';

const adminNav = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Add Product', href: '/admin/products/new', icon: PlusCircle },
  { label: 'Bulk Enquiries', href: '/admin/bulk-enquiries', icon: MessageSquare },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, user, isLoading, isAdmin, signInWithPassword, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-muted">Checking security clearance...</p>
        </div>
      </div>
    );
  }

  // Auth Guard for Admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 shadow-card text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-danger/10 text-danger flex items-center justify-center mx-auto border border-danger/20">
            <ShieldAlert size={32} />
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-foreground">
              Restricted Military Access
            </h1>
            <p className="text-xs text-muted mt-1 leading-relaxed">
              The Cantt Store Admin Portal requires an Officer or Admin role (`role = 'ADMIN'`) in Supabase.
            </p>
          </div>

          <div className="p-3 bg-surface-2 rounded-xl text-xs text-muted space-y-1 text-left border border-border/80">
            <p className="font-semibold text-foreground">Current user:</p>
            <p>{user ? user.email : 'Not signed in'}</p>
            <p>Role: <span className="text-accent font-semibold">{profile?.role || 'NONE'}</span></p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => signInWithPassword('admin@canttstore.com', 'cantt12345')}
              className="btn-primary w-full py-2.5 text-xs font-bold shadow-md"
            >
              Sign In as Admin Officer (Demo)
            </button>
            <Link
              href="/login?redirect=/admin"
              className="btn-secondary w-full py-2.5 text-xs block"
            >
              Go to Regular Login
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs text-muted hover:text-foreground pt-2"
            >
              <ArrowLeft size={14} /> Back to Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-surface border-r border-border flex flex-col flex-shrink-0">
        {/* Brand */}
        <div className="p-5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-olive flex items-center justify-center shadow-glow-olive">
              <span className="text-white font-display font-bold text-sm">CS</span>
            </div>
            <div>
              <p className="font-display font-bold text-sm text-foreground tracking-wide">
                CANTT ADMIN
              </p>
              <p className="text-[10px] text-muted">Unified Portal</p>
            </div>
          </div>
          <span className="badge badge-accent text-[9px] font-bold">V1.0</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {adminNav.map(({ label, href, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={clsx(
                  'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all',
                  active
                    ? 'bg-olive text-white shadow-sm'
                    : 'text-muted hover:text-foreground hover:bg-surface-2'
                )}
              >
                <Icon size={16} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Officer Footer info & Sign Out */}
        <div className="p-4 border-t border-border space-y-3">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center text-xs font-bold text-accent">
              {profile?.fullName ? profile.fullName.charAt(0) : 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">
                {profile?.fullName || 'Admin Officer'}
              </p>
              <p className="text-[10px] text-muted truncate">{profile?.email}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              target="_blank"
              className="btn-secondary text-[11px] py-1.5 px-2.5 flex-1 flex items-center justify-center gap-1"
            >
              <span>Store</span>
              <ExternalLink size={12} />
            </Link>
            <button
              onClick={() => signOut()}
              className="p-1.5 rounded-lg border border-border text-muted hover:text-danger hover:border-danger/30 transition-colors"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
