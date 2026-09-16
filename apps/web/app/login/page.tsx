'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/account';

  const { signInWithPassword, user } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await signInWithPassword(email, password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push(redirectUrl);
    }
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('cantt12345');
    setError('');
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-olive flex items-center justify-center mx-auto text-white shadow-glow-olive">
            <Shield size={24} />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Sign In to Cantt Store
          </h1>
          <p className="text-xs text-muted">
            Access your orders, saved field gear & defence privileges
          </p>
        </div>

        {error && (
          <div className="p-3 bg-danger/10 border border-danger/30 text-danger text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={16} className="flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@canttstore.com"
                className="input pl-10 text-sm w-full"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-muted">
                Password
              </label>
              <Link href="/forgot-password" className="text-[11px] text-accent hover:underline">
                Forgot?
              </Link>
            </div>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input pl-10 text-sm w-full"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="pt-2 border-t border-border/60">
          <p className="text-[11px] text-muted text-center mb-2 font-medium">
            ⚡ Developer & Testing Quick Sign-In:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => fillDemo('admin@canttstore.com')}
              className="px-2 py-1.5 rounded-lg bg-surface-2 hover:bg-olive/20 border border-border text-[11px] font-semibold text-accent transition-colors"
            >
              Admin Officer
            </button>
            <button
              type="button"
              onClick={() => fillDemo('customer@defence.gov.in')}
              className="px-2 py-1.5 rounded-lg bg-surface-2 hover:bg-olive/20 border border-border text-[11px] font-semibold text-foreground transition-colors"
            >
              Regiment Customer
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-muted pt-2">
          <span>Don't have an account? </span>
          <Link href="/register" className="text-accent font-bold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 container-main">
        <Suspense fallback={<div className="text-xs text-muted">Loading sign-in...</div>}>
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
