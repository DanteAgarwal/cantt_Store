'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Truck, Users, CheckCircle2, AlertCircle, Clock, Check } from 'lucide-react';

export default function BulkOrdersPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [unit, setUnit] = useState('');
  const [quantity, setQuantity] = useState('50');
  const [station, setStation] = useState('');
  const [details, setDetails] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [enquiryId, setEnquiryId] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !details.trim()) return;

    setIsSubmitting(true);

    const id = `ENQ-${Date.now().toString().slice(-5)}`;
    const newEnquiry = {
      id,
      regiment: unit.trim() || 'Defence Regiment / Unit',
      contactName: fullName.trim(),
      phone: phone.trim(),
      email: 'officer@defence.gov.in',
      category: details.slice(0, 45) + (details.length > 45 ? '...' : ''),
      quantity: `${quantity} Units`,
      station: station.trim() || 'Military Cantonment, India',
      date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      status: 'NEW',
    };

    try {
      const existing = JSON.parse(localStorage.getItem('cantt_wholesale_enquiries') || '[]');
      existing.unshift(newEnquiry);
      localStorage.setItem('cantt_wholesale_enquiries', JSON.stringify(existing));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }

    // Also dispatch to API endpoint asynchronously
    fetch('/api/bulk-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName,
        phone,
        unit,
        station,
        quantity,
        details,
      }),
    }).catch((err) => console.warn('Bulk orders API background sync:', err));

    setTimeout(() => {
      setIsSubmitting(false);
      setEnquiryId(id);
    }, 600);
  };

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-screen py-8 md:py-16 bg-background">
        <div className="container-main max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="badge badge-accent mb-3 inline-block text-xs uppercase tracking-wider">
              Defence Units & Institutions
            </span>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Institutional & Bulk Orders
            </h1>
            <p className="text-muted text-base max-w-xl mx-auto text-balance">
              Custom embroidery, unit logos, specialized apparel, and wholesale pricing for military regiments, police battalions, NCC wings, and security agencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="card p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-olive/20 text-accent flex items-center justify-center mx-auto mb-3">
                <Users size={24} />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">Custom Unit Insignia</h3>
              <p className="text-xs text-muted">Direct embroidery or patches with official regimental crests.</p>
            </div>

            <div className="card p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-olive/20 text-accent flex items-center justify-center mx-auto mb-3">
                <ShieldCheck size={24} />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">Wholesale Pricing</h3>
              <p className="text-xs text-muted">Tiered volume discounts starting from 15+ units.</p>
            </div>

            <div className="card p-5 text-center">
              <div className="w-12 h-12 rounded-xl bg-olive/20 text-accent flex items-center justify-center mx-auto mb-3">
                <Truck size={24} />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">Priority Dispatch</h3>
              <p className="text-xs text-muted">Direct delivery to military cantonments and outposts.</p>
            </div>
          </div>

          {/* Enquiry Form Card */}
          <div className="card p-6 md:p-10 border-olive/30 shadow-card">
            {enquiryId ? (
              <div className="text-center py-8 space-y-4 animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-success/20 border-2 border-success flex items-center justify-center mx-auto text-success">
                  <CheckCircle2 size={36} />
                </div>
                <h2 className="font-display font-bold text-2xl text-foreground">
                  Wholesale Enquiry Registered!
                </h2>
                <div className="inline-block p-2.5 px-4 bg-surface-2 border border-border rounded-xl font-mono text-xs text-accent font-bold">
                  Reference: #{enquiryId}
                </div>
                <p className="text-xs md:text-sm text-muted max-w-md mx-auto leading-relaxed">
                  Thank you, <strong className="text-foreground">{fullName}</strong>. Your requirement for <strong className="text-foreground">{unit || 'your unit'}</strong> has been assigned to our Institutional Defence Desk. An executive will reach out to you on WhatsApp / Phone within 24 hours.
                </p>
                <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
                  <button
                    onClick={() => {
                      setEnquiryId(null);
                      setFullName('');
                      setPhone('');
                      setUnit('');
                      setDetails('');
                    }}
                    className="btn-secondary text-xs px-5 py-2.5 font-bold"
                  >
                    Submit Another Requirement
                  </button>
                  <Link href="/shop" className="btn-primary text-xs px-6 py-2.5 font-bold">
                    Explore Storefront
                  </Link>
                </div>
              </div>
            ) : (
              <>
                <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                  Submit an Enquiry
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                        Rank & Full Name <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Maj. R. Sharma / Col. K. Singh"
                        className="input w-full py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                        Phone / WhatsApp <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="input w-full py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                        Unit / Regiment
                      </label>
                      <input
                        type="text"
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        placeholder="e.g. 9 PARA SF / 15 BSF"
                        className="input w-full py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                        Station / Military Camp
                      </label>
                      <input
                        type="text"
                        value={station}
                        onChange={(e) => setStation(e.target.value)}
                        placeholder="e.g. Jodhpur, Rajasthan"
                        className="input w-full py-2.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                        Estimated Quantity
                      </label>
                      <input
                        type="number"
                        min="10"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="e.g. 50"
                        className="input w-full py-2.5 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-1.5">
                      Requirement Details <span className="text-danger">*</span>
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Describe your requirements (product type, color, custom embroidery / patches needed, delivery timeline)..."
                      className="input w-full py-2.5 text-sm resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary w-full py-3.5 text-sm font-bold shadow-md active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-charcoal-900 border-t-transparent rounded-full animate-spin" />
                        <span>Transmitting Wholesale Lead...</span>
                      </>
                    ) : (
                      <span>Submit Bulk Enquiry</span>
                    )}
                  </button>

                  <p className="text-[11px] text-muted text-center pt-2">
                    Our institutional sales representative will contact you on WhatsApp or phone within 24 hours.
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
