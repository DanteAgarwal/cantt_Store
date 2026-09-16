'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, User, Award, ArrowRight, AlertCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const router = useRouter();
  const { signUpWithPassword, user } = useAuth();

  const [fullName, setFullName] = useState('');
  const [regiment, setRegiment] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/account');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const res = await signUpWithPassword(email, password, fullName, regiment);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      router.push('/account');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />

      <main className="flex-1 flex items-center justify-center py-12 px-4 container-main">
        <div className="w-full max-w-md">
          <div className="bg-surface border border-border rounded-2xl p-6 md:p-8 shadow-card space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-olive flex items-center justify-center mx-auto text-white shadow-glow-olive">
                <Shield size={24} />
              </div>
              <h1 className="font-display font-bold text-2xl text-foreground">
                Join Cantt Store
              </h1>
              <p className="text-xs text-muted">
                Create an account to track orders, save wishlist, & receive regimental drops
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
                  Full Name
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Capt. Vikram Batra"
                    className="input pl-10 text-sm w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                  Regiment / Force / civilian
                </label>
                <div className="relative">
                  <Award size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    value={regiment}
                    onChange={(e) => setRegiment(e.target.value)}
                    placeholder="e.g. PARA SF / Rajputana Rifles / Veteran"
                    className="input pl-10 text-sm w-full"
                  />
                </div>
              </div>

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
                    placeholder="name@email.com"
                    className="input pl-10 text-sm w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="input pl-10 text-sm w-full"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-50"
              >
                <span>{loading ? 'Creating Account...' : 'Register'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="text-center text-xs text-muted pt-2 border-t border-border/60">
              <span>Already have an account? </span>
              <Link href="/login" className="text-accent font-bold hover:underline">
                Sign in here
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
