import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ShieldCheck,
  Truck,
  Phone,
  Mail,
  MapPin,
  Clock,
  ArrowLeft,
  FileText,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const revalidate = 3600;

interface PageContent {
  title: string;
  subtitle: string;
  category: string;
  content: React.ReactNode;
}

const pagesData: Record<string, PageContent> = {
  'about-us': {
    title: 'About Cantt Store',
    subtitle: 'Serving the braveheart community with authentic military-specification gear',
    category: 'Company Profile',
    content: (
      <div className="space-y-6 text-sm text-muted leading-relaxed">
        <p>
          Established to honor and supply the valiant personnel of the Indian Armed Forces, Paramilitary forces, veterans, and military enthusiasts, <strong className="text-foreground">Cantt Store</strong> represents durability, discipline, and authenticity.
        </p>
        <p>
          Born near the historic Delhi Cantonment, our mission is to craft field-ready tactical apparel, official regimental caps, authentic woollen berets, embroidered unit patches, and expedition-grade rucksacks that meet stringent military standards.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
          <div className="p-4 rounded-xl bg-surface-2 border border-border text-center space-y-1">
            <Award className="mx-auto text-accent mb-2" size={24} />
            <h4 className="font-bold text-foreground text-xs">Authentic Specifications</h4>
            <p className="text-[11px]">Strict conformity with regimental colour shades and crest specifications.</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-2 border border-border text-center space-y-1">
            <Truck className="mx-auto text-accent mb-2" size={24} />
            <h4 className="font-bold text-foreground text-xs">Nationwide Station Delivery</h4>
            <p className="text-[11px]">Direct dispatch to Army, Navy, Air Force, and BSF stations across India.</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-2 border border-border text-center space-y-1">
            <ShieldCheck className="mx-auto text-accent mb-2" size={24} />
            <h4 className="font-bold text-foreground text-xs">Veterans & Personnel Support</h4>
            <p className="text-[11px]">Institutional discounts and custom embroidery for defence regiments.</p>
          </div>
        </div>
        <p>
          Whether deployed in Siachen, Thar, or the North-East, or proudly supporting from civilian life, Cantt Store equips you with honor.
        </p>
      </div>
    ),
  },
  'contact-us': {
    title: 'Contact Military Support',
    subtitle: 'Reach our central logistics and customer assistance desk',
    category: 'Support & Assistance',
    content: (
      <div className="space-y-6 text-sm text-muted leading-relaxed">
        <p>
          For order tracking, unit wholesale inquiries, custom crest embroidery, or general questions, our customer care officers are ready to assist you.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-2">
          <div className="p-5 rounded-xl bg-surface-2 border border-border space-y-2">
            <Phone size={18} className="text-accent" />
            <h4 className="font-bold text-foreground text-xs">Helpline / WhatsApp</h4>
            <p className="text-xs text-foreground font-mono">+91 98765 11001</p>
            <p className="text-[11px]">Monday to Saturday, 09:00 - 18:00 IST</p>
          </div>
          <div className="p-5 rounded-xl bg-surface-2 border border-border space-y-2">
            <Mail size={18} className="text-accent" />
            <h4 className="font-bold text-foreground text-xs">Email Communication</h4>
            <p className="text-xs text-foreground font-mono">support@canttstore.in</p>
            <p className="text-[11px]">Institutional: wholesale@canttstore.in</p>
          </div>
        </div>
        <div className="p-5 rounded-xl bg-surface-2 border border-border space-y-2">
          <MapPin size={18} className="text-accent" />
          <h4 className="font-bold text-foreground text-xs">Dispatch Station & Office</h4>
          <p className="text-xs text-foreground">
            Cantt Store Logistics Centre, Near Old Ordnance Depot, Delhi Cantonment, New Delhi - 110010, India
          </p>
        </div>
      </div>
    ),
  },
  'terms-conditions': {
    title: 'Terms & Conditions',
    subtitle: 'Official service agreement and conditions of sale',
    category: 'Legal Framework',
    content: (
      <div className="space-y-4 text-sm text-muted leading-relaxed">
        <h3 className="font-bold text-foreground text-sm">1. Commercial & Institutional Agreement</h3>
        <p>
          By browsing, registering, or purchasing merchandise from Cantt Store, you agree to abide by the terms and regulations set forth in compliance with the Information Technology Act and the Indian Contract Act.
        </p>
        <h3 className="font-bold text-foreground text-sm">2. Product Specifications & Pricing</h3>
        <p>
          Prices are quoted in Indian Rupees (INR) and are inclusive of applicable GST. We reserve the right to revise catalogue prices or discontinue product lines without prior announcement.
        </p>
        <h3 className="font-bold text-foreground text-sm">3. Order Fulfillment & Verification</h3>
        <p>
          Cantt Store reserves the right to authenticate orders and contact consignees prior to dispatch for high-value orders or military cantonment deliveries.
        </p>
      </div>
    ),
  },
  'privacy-policy': {
    title: 'Privacy & Data Security',
    subtitle: 'Confidentiality standards and information protection',
    category: 'Security Compliance',
    content: (
      <div className="space-y-4 text-sm text-muted leading-relaxed">
        <p>
          We treat defence personnel and civilian client information with the highest security clearance standards. We do not sell, barter, or distribute your delivery data to unauthorized third parties.
        </p>
        <h3 className="font-bold text-foreground text-sm">1. Information We Collect</h3>
        <p>
          Delivery address, mobile telephone number, email, and military regiment information (when supplied voluntarily for special delivery protocols).
        </p>
        <h3 className="font-bold text-foreground text-sm">2. Data Encryption</h3>
        <p>
          All transactions are protected via 256-bit SSL protocols. Payment credentials and card numbers are processed directly via PCI-DSS certified banking gateways.
        </p>
      </div>
    ),
  },
  'shipping-policy': {
    title: 'Shipping & Delivery Policy',
    subtitle: 'Logistics, delivery timelines, and military cantonment dispatch',
    category: 'Logistics',
    content: (
      <div className="space-y-4 text-sm text-muted leading-relaxed">
        <h3 className="font-bold text-foreground text-sm">1. Dispatch Timeline</h3>
        <p>
          Orders confirmed before 14:00 IST are packed and inspected at our central depot within 24 hours. Transit times vary from 2 to 4 business days for major stations and 4 to 7 days for remote outposts.
        </p>
        <h3 className="font-bold text-foreground text-sm">2. Free Military Dispatch Tier</h3>
        <p>
          Consignments exceeding ₹999 qualify for complimentary standard tracked shipping across all serviceable postal PIN codes in India.
        </p>
        <h3 className="font-bold text-foreground text-sm">3. Military Cantonment Gate Clearance</h3>
        <p>
          For orders addressed to Army/Naval/Air Force bases or regimental quarters, delivery executives coordinate handover at station visitor security gates when access is restricted.
        </p>
      </div>
    ),
  },
  'refund-policy': {
    title: 'Refund & Exchange Policy',
    subtitle: '7-Day hassle-free inspection and size replacement protocol',
    category: 'Customer Satisfaction',
    content: (
      <div className="space-y-4 text-sm text-muted leading-relaxed">
        <p>
          We want you to wear your merchandise with total confidence. If a t-shirt or beret cap does not fit perfectly, we offer straightforward size exchanges within 7 calendar days of delivery.
        </p>
        <h3 className="font-bold text-foreground text-sm">Exchange Conditions</h3>
        <ul className="list-disc pl-5 space-y-1 text-xs">
          <li>Item must be unused, unwashed, with original tags intact.</li>
          <li>Custom embroidered items with personalized battalion serial numbers cannot be returned unless manufacturing defect is proven.</li>
          <li>Refunds for returned goods are initiated within 48 hours of depot receipt back to original payment mode.</li>
        </ul>
      </div>
    ),
  },
  'military-goods-usage-policy': {
    title: 'Purchase & Usage Guidelines',
    subtitle: 'Statutory compliance regarding military insignia and regimental merchandise',
    category: 'Defence Regulations',
    content: (
      <div className="space-y-4 text-sm text-muted leading-relaxed">
        <div className="p-4 bg-accent/10 border border-accent/30 rounded-xl text-xs space-y-2">
          <div className="flex items-center gap-2 text-accent font-bold">
            <AlertTriangle size={16} />
            <span>Important Notice on Official Insignia</span>
          </div>
          <p className="text-foreground">
            Our commemorative t-shirts, caps, and morale patches are designed with deep respect for defence personnel. In compliance with the Emblems and Names (Prevention of Improper Use) Act and section 140 of the Indian Penal Code, civilian impersonation of active military ranks or official service uniforms is strictly prohibited.
          </p>
        </div>
        <h3 className="font-bold text-foreground text-sm">Guidelines for Enthusiasts & Civilians:</h3>
        <p>
          Enthusiasts and supporters are welcome to wear commemorative graphic t-shirts, tactical jackets, field caps, and backpacks in pride of our soldiers. Official medal ribbons, active service badges, and operational ranks are reserved solely for authorized armed forces personnel.
        </p>
      </div>
    ),
  },
};

interface PolicyPageProps {
  params: {
    slug: string;
  };
}

export default function PolicyPage({ params }: PolicyPageProps) {
  const page = pagesData[params.slug];

  if (!page) {
    notFound();
  }

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-screen py-10 md:py-16 bg-background">
        <div className="container-main max-w-3xl">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted mb-6">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">{page.category}</span>
          </div>

          <article className="card p-6 md:p-10 border border-border shadow-card space-y-6">
            <header className="border-b border-border/80 pb-6">
              <span className="badge badge-accent text-xs uppercase font-bold tracking-wider mb-2 inline-block">
                {page.category}
              </span>
              <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-2">
                {page.title}
              </h1>
              <p className="text-xs md:text-sm text-muted">{page.subtitle}</p>
            </header>

            <div className="pt-2">{page.content}</div>

            <footer className="pt-8 border-t border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <Link
                href="/shop"
                className="btn-secondary text-xs px-4 py-2.5 inline-flex items-center gap-2 self-start font-semibold"
              >
                <ArrowLeft size={14} />
                <span>Return to Catalogue</span>
              </Link>
              <div className="flex items-center gap-2 text-xs text-muted">
                <ShieldCheck size={14} className="text-accent" />
                <span>Cantt Store Verified Policy</span>
              </div>
            </footer>
          </article>
        </div>
      </main>

      <Footer />
    </>
  );
}
