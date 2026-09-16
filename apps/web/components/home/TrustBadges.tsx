import Link from 'next/link';
import { Truck, Shield, RotateCcw, Phone } from 'lucide-react';

const badges = [
  {
    icon: Truck,
    title: 'Free Delivery',
    desc: 'On orders above ₹999',
  },
  {
    icon: Shield,
    title: 'Authentic Products',
    desc: '100% quality guaranteed',
  },
  {
    icon: Phone,
    title: 'Cash on Delivery',
    desc: 'On orders above ₹500',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    desc: '5-day hassle-free returns',
  },
];

export function TrustBadges() {
  return (
    <section className="bg-surface-2 border-b border-border">
      <div className="container-main">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-border">
          {badges.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 px-4 md:px-6 py-4">
              <div className="w-10 h-10 rounded-full bg-olive/20 border border-olive/30 flex items-center justify-center flex-shrink-0">
                <Icon size={18} className="text-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{title}</p>
                <p className="text-xs text-muted">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
