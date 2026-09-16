import Link from 'next/link';
import { Phone, Mail, MapPin } from 'lucide-react';

const footerLinks = {
  'Useful Links': [
    { label: 'About Us', href: '/pages/about-us' },
    { label: 'Contact Us', href: '/pages/contact-us' },
    { label: 'My Account', href: '/account' },
  ],
  'Legal': [
    { label: 'Terms & Conditions', href: '/pages/terms-conditions' },
    { label: 'Privacy Policy', href: '/pages/privacy-policy' },
    { label: 'Shipping & Delivery Policy', href: '/pages/shipping-policy' },
    { label: 'Refund & Cancellation Policy', href: '/pages/refund-policy' },
    { label: 'Purchase & Usage Guidelines', href: '/pages/military-goods-usage-policy' },
  ],
  'Quick Shop': [
    { label: 'New Arrivals', href: '/shop?sort=newest' },
    { label: 'Military T-Shirts', href: '/category/military-t-shirts' },
    { label: 'Caps & Headwear', href: '/category/military-caps-headwear' },
    { label: 'Tactical Gear', href: '/category/tactical-gear' },
    { label: 'Bulk & Custom Orders', href: '/bulk-orders' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-16 pb-20 md:pb-0">
      <div className="container-main py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand column */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-olive flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm">CS</span>
              </div>
              <span className="font-display font-bold text-xl text-foreground tracking-wide">
                CANTT <span className="text-accent">STORE</span>
              </span>
            </div>
            <p className="text-muted text-sm leading-relaxed mb-4">
              Premium military-inspired merchandise for defence personnel, veterans, and enthusiasts across India.
            </p>
            <div className="flex flex-col gap-2">
              <a href="tel:+919876511001" className="flex items-center gap-2 text-muted hover:text-accent text-sm transition-colors">
                <Phone size={14} />
                <span>+91 98765 11001</span>
              </a>
              <a href="mailto:support@canttstore.in" className="flex items-center gap-2 text-muted hover:text-accent text-sm transition-colors">
                <Mail size={14} />
                <span>support@canttstore.in</span>
              </a>
              <div className="flex items-start gap-2 text-muted text-sm">
                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                <span>India — Delivering nationwide</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-display font-semibold text-foreground text-sm tracking-wider uppercase mb-4">
                {title}
              </h3>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-muted hover:text-accent text-sm transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Delivery estimates */}
        <div className="border-t border-border pt-6 mb-6">
          <p className="text-muted text-xs text-center">
            <span className="text-foreground font-medium">Delivery estimates:</span>{' '}
            Nearby regions: 2–4 days &nbsp;•&nbsp; Other states: 4–7 days &nbsp;•&nbsp; North/South cross-country: 5–8 days
          </p>
        </div>

        {/* Payment icons & copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted text-xs">
            &copy; {new Date().getFullYear()} Cantt Store. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <span className="text-muted text-xs">We accept:</span>
            {['UPI', 'Visa', 'MC', 'COD', 'NetBanking'].map((method) => (
              <span key={method} className="px-2 py-1 bg-surface-2 border border-border rounded text-xs text-muted">
                {method}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
