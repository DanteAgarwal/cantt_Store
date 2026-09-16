import Link from 'next/link';

export interface CategoryItem {
  id?: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  productCount?: number;
  icon?: string;
}

const fallbackCategories: CategoryItem[] = [
  { name: 'Military T-Shirts', slug: 'military-t-shirts', description: 'Olive, Black & Camo', icon: '👕' },
  { name: 'Caps & Headwear', slug: 'military-caps-headwear', description: 'Beret, Regimental & Field Caps', icon: '🪖' },
  { name: 'Army Winter Wear', slug: 'army-winter-wear', description: 'Jackets, Sweaters & Thermals', icon: '🧥' },
  { name: 'Tactical Gear', slug: 'tactical-gear', description: 'Bags, Belts & Field Equipment', icon: '🎒' },
  { name: 'Badges & Patches', slug: 'regimental-badges-patches', description: 'Regimental & Force Insignia', icon: '🎖️' },
  { name: 'Military Bags', slug: 'military-bags-backpacks', description: 'Tactical Backpacks & Duffels', icon: '🎽' },
];

export function CategoryGrid({ categories }: { categories?: CategoryItem[] }) {
  const items: CategoryItem[] = categories && categories.length > 0 ? categories : fallbackCategories;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
      {items.map((cat, idx) => {
        const fallback = fallbackCategories[idx % fallbackCategories.length];
        const icon = cat.icon || fallback.icon || '🎖️';
        return (
          <Link
            key={cat.slug}
            href={`/category/${cat.slug}`}
            className="group flex flex-col items-center text-center card card-hover p-4 md:p-5 gap-3 transition-all duration-300 hover:border-olive/60"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-charcoal to-surface-2 border border-olive/30 flex items-center justify-center text-2xl md:text-3xl shadow-md group-hover:scale-105 group-hover:shadow-glow-olive group-hover:border-olive transition-all overflow-hidden relative">
              {cat.imageUrl ? (
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{icon}</span>
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors leading-tight">
                {cat.name}
              </p>
              <p className="text-xs text-muted mt-0.5 hidden md:block">
                {cat.description || (cat.productCount !== undefined ? `${cat.productCount} Products` : fallback.description)}
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
