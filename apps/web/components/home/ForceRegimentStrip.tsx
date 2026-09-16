import Link from 'next/link';

interface TagItem {
  id?: string;
  name: string;
  slug: string;
}

const fallbackForces = [
  { name: 'PARA', slug: 'para', color: 'bg-red-900/40 border-red-700/40 hover:border-red-500' },
  { name: 'BSF', slug: 'bsf', color: 'bg-olive-dark border-olive hover:border-accent' },
  { name: 'CRPF', slug: 'crpf', color: 'bg-charcoal border-border hover:border-accent' },
  { name: 'Signals', slug: 'signals', color: 'bg-blue-900/30 border-blue-700/40 hover:border-blue-400' },
  { name: 'EME', slug: 'eme', color: 'bg-charcoal border-border hover:border-accent' },
  { name: 'AMC', slug: 'amc', color: 'bg-charcoal border-border hover:border-accent' },
  { name: 'NCC', slug: 'ncc', color: 'bg-olive-dark border-olive hover:border-accent' },
  { name: 'Indian Navy', slug: 'indian-navy', color: 'bg-blue-900/30 border-blue-800/40 hover:border-blue-500' },
  { name: 'Indian Air Force', slug: 'iaf', color: 'bg-sky-900/20 border-sky-700/30 hover:border-sky-400' },
  { name: 'CISF', slug: 'cisf', color: 'bg-charcoal border-border hover:border-accent' },
];

export function ForceRegimentStrip({ tags }: { tags?: TagItem[] }) {
  const items = tags && tags.length > 0 ? tags : fallbackForces;

  return (
    <div className="flex flex-wrap gap-2.5 md:gap-3 justify-center">
      {items.map((force, idx) => {
        const style = fallbackForces[idx % fallbackForces.length]?.color || 'bg-charcoal border-border hover:border-accent';
        return (
          <Link
            key={force.slug}
            href={`/shop?tag=${force.slug}`}
            className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full border text-xs md:text-sm font-semibold text-foreground transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm ${style}`}
          >
            {force.name}
          </Link>
        );
      })}
      <Link
        href="/shop"
        className="px-4 md:px-5 py-2 md:py-2.5 rounded-full border border-accent/50 text-accent bg-accent/10 text-xs md:text-sm font-semibold hover:bg-accent/20 transition-all duration-200"
      >
        + View All Forces
      </Link>
    </div>
  );
}
