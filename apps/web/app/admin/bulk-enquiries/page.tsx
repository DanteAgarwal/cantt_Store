'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, Shield, Mail, Phone, MapPin, Calendar, Clock, CheckCircle2, Send } from 'lucide-react';

const defaultEnquiries = [
  {
    id: 'enq_01',
    regiment: '10 PARA (Special Forces)',
    contactName: 'Maj. R. Sharma',
    email: 'r.sharma@para.mod.in',
    phone: '+91 98765 11001',
    category: 'Regiment T-Shirts & Combat Badges',
    quantity: '120 Units',
    station: 'Jodhpur Military Station, Rajasthan',
    date: '14 Sep 2026',
    status: 'NEW',
  },
  {
    id: 'enq_02',
    regiment: 'Rajputana Rifles Centre',
    contactName: 'Subedar Major K. Singh',
    email: 'rajrif.centre@army.in',
    phone: '+91 94140 22002',
    category: 'Woollen Military Sweaters & Jerseys',
    quantity: '350 Units',
    station: 'Delhi Cantt, New Delhi',
    date: '12 Sep 2026',
    status: 'CONTACTED',
  },
  {
    id: 'enq_03',
    regiment: 'BSF Sector HQ',
    contactName: 'Inspector D. Patel',
    email: 'sectorhq@bsf.gov.in',
    phone: '+91 98250 33003',
    category: 'Thermal Inner Wear & Balaclavas',
    quantity: '200 Sets',
    station: 'Bhuj Sector, Gujarat',
    date: '10 Sep 2026',
    status: 'QUOTE_SENT',
  },
];

export default function AdminBulkEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>(defaultEnquiries);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cantt_wholesale_enquiries') || '[]');
      if (stored.length > 0) {
        // Merge without duplicate IDs
        const combined = [...stored, ...defaultEnquiries.filter((d) => !stored.some((s: any) => s.id === d.id))];
        setEnquiries(combined);
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, []);

  const handleStatusChange = (id: string, newStatus: string) => {
    setEnquiries((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e));
      try {
        const stored = updated.filter((item) => item.id.startsWith('ENQ-'));
        localStorage.setItem('cantt_wholesale_enquiries', JSON.stringify(stored));
      } catch (err) {
        console.warn(err);
      }
      return updated;
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Unit & Institutional Wholesale Inquiries
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Direct requests from battalions, regimental centres, and defence personnel
          </p>
        </div>

        <Link
          href="/bulk-orders"
          target="_blank"
          className="btn-secondary text-xs px-3.5 py-2 font-semibold"
        >
          View Public Form ↗
        </Link>
      </div>

      {/* Summary Stat */}
      <div className="p-4 rounded-xl bg-surface border border-border flex items-center justify-between text-xs text-muted">
        <span>
          Total Inquiries: <strong className="text-foreground">{enquiries.length}</strong>
        </span>
        <span className="badge badge-accent text-[10px]">
          {enquiries.filter((e) => e.status === 'NEW').length} Pending Review
        </span>
      </div>

      {/* Inquiries list */}
      <div className="space-y-4">
        {enquiries.map((enq) => (
          <div
            key={enq.id}
            className="p-5 md:p-6 rounded-2xl bg-surface border border-border shadow-card space-y-4 hover:border-olive/50 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/70 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-olive/20 text-accent flex items-center justify-center font-bold text-xs">
                  <Shield size={16} />
                </span>
                <div>
                  <h2 className="font-display font-bold text-base text-foreground">
                    {enq.regiment}
                  </h2>
                  <p className="text-[11px] text-muted">Officer: {enq.contactName}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] text-muted flex items-center gap-1">
                  <Clock size={12} /> {enq.date}
                </span>

                <select
                  value={enq.status}
                  onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                  className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                    enq.status === 'NEW'
                      ? 'bg-accent/10 border-accent/40 text-accent'
                      : enq.status === 'CONTACTED'
                        ? 'bg-info/10 border-info/40 text-info'
                        : enq.status === 'QUOTE_SENT'
                          ? 'bg-olive/20 border-olive/50 text-olive-light'
                          : 'bg-surface-2 border-border text-muted'
                  }`}
                >
                  <option value="NEW">NEW</option>
                  <option value="CONTACTED">CONTACTED</option>
                  <option value="QUOTE_SENT">QUOTE SENT</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-muted block font-semibold">Equipment Needed:</span>
                <p className="font-bold text-foreground text-sm">{enq.category}</p>
                <p className="text-accent font-semibold">{enq.quantity}</p>
              </div>

              <div className="space-y-1">
                <span className="text-muted block font-semibold">Station / Unit Location:</span>
                <p className="text-foreground flex items-center gap-1.5">
                  <MapPin size={13} className="text-muted flex-shrink-0" />
                  <span>{enq.station}</span>
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted block font-semibold">Direct Communications:</span>
                <div className="flex flex-col gap-1.5 pt-0.5">
                  <a
                    href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-success hover:underline font-semibold"
                  >
                    <Send size={12} />
                    <span>WhatsApp: {enq.phone}</span>
                  </a>
                  <a
                    href={`tel:${enq.phone}`}
                    className="flex items-center gap-1.5 text-muted hover:text-accent transition-colors"
                  >
                    <Phone size={12} />
                    <span>{enq.phone}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
