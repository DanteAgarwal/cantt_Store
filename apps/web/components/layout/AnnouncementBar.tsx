'use client';

const messages = [
  '🚚 Free Delivery on orders above ₹999',
  '💳 COD Available on orders above ₹500',
  '📞 Support: +91-XXXXX-XXXXX (Mon–Sat, 10AM–6PM)',
  '🎖️ Trusted by Defence Personnel & Veterans across India',
  '🔄 Easy 5-Day Returns on eligible items',
  '✅ 100% Authentic Military-Inspired Merchandise',
];

export function AnnouncementBar() {
  const text = messages.join('   •   ');

  return (
    <div className="bg-olive-dark border-b border-olive/40 overflow-hidden py-2">
      <div className="relative flex overflow-hidden">
        {/* Duplicate text for seamless loop */}
        <div className="marquee-track text-sm text-olive-light font-medium">
          <span className="pr-16">{text}</span>
          <span className="pr-16">{text}</span>
        </div>
      </div>
    </div>
  );
}
