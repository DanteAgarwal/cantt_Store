'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError('Please provide your registered email address.');
      return;
    }

    setIsLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/login`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess(true);
    } catch (err: any) {
      // In case Supabase network drop, gracefully notify user
      console.warn('Reset password notice:', err.message);
      setSuccess(true); // Don't leak user enumeration in security best practices
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-screen py-12 md:py-20 bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full card p-8 border border-border shadow-card space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-olive/20 text-accent flex items-center justify-center mx-auto mb-2">
              <Shield size={24} />
            </div>
            <h1 className="font-display font-bold text-2xl text-foreground">
              Recover Account Access
            </h1>
            <p className="text-xs text-muted">
              Enter your registered email address to receive password reset instructions.
            </p>
          </div>

          {error && (
            <div className="p-3.5 bg-danger/10 border border-danger/30 rounded-xl text-danger text-xs flex items-center gap-2">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="p-5 rounded-2xl bg-success/10 border border-success/30 text-center space-y-3 animate-fade-in">
              <CheckCircle2 size={32} className="mx-auto text-success" />
              <h2 className="font-display font-bold text-sm text-foreground">
                Recovery Email Sent
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                If an officer account exists for <strong className="text-foreground">{email}</strong>, you will receive a secure password reset link shortly.
              </p>
              <div className="pt-2">
                <Link href="/login" className="btn-primary w-full py-2.5 text-xs font-bold block text-center shadow-md">
                  Return to Sign In
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="officer@defence.gov.in"
                    className="w-full bg-surface-2 border border-border rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
                  />
                  <Mail size={14} className="absolute left-3 top-3 text-muted" />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-xs font-bold shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-charcoal-900 border-t-transparent rounded-full animate-spin" />
                    <span>Sending Instructions...</span>
                  </>
                ) : (
                  <span>Send Recovery Email</span>
                )}
              </button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="text-xs text-muted hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
                >
                  <ArrowLeft size={12} />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
