import Link from 'next/link';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCarouselSection } from '@/components/home/ProductCarouselSection';
import { getProducts, getCategoriesTree, getAllTags } from '@/lib/queries';

export const revalidate = 60;

interface ShopPageProps {
  searchParams: {
    category?: string;
    tag?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const [products, categories, tags] = await Promise.all([
    getProducts({
      categorySlug: searchParams.category,
      tagSlug: searchParams.tag,
      sort: searchParams.sort,
      minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
      maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
    }),
    getCategoriesTree(),
    getAllTags(),
  ]);

  const activeCategory = categories.find((c) => c.slug === searchParams.category);
  const activeTag = tags.find((t) => t.slug === searchParams.tag);

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-screen py-8 md:py-12 bg-background">
        <div className="container-main">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-muted mb-4">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-foreground font-medium">Shop</span>
            {activeCategory && (
              <>
                <span>/</span>
                <span className="text-accent">{activeCategory.name}</span>
              </>
            )}
            {activeTag && (
              <>
                <span>/</span>
                <span className="text-accent">{activeTag.name}</span>
              </>
            )}
          </div>

          {/* Page Title & Stats */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-6 border-b border-border/80 gap-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                {activeCategory ? activeCategory.name : activeTag ? `${activeTag.name} Collection` : 'All Military Merchandise'}
              </h1>
              <p className="text-muted text-sm mt-1">
                Showing {products.length} {products.length === 1 ? 'item' : 'items'} crafted for military personnel, veterans & enthusiasts
              </p>
            </div>

            {/* Sort options */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted font-medium">Sort by:</span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { label: 'Featured', val: 'featured' },
                  { label: 'Newest', val: 'newest' },
                  { label: 'Price: Low to High', val: 'price_asc' },
                  { label: 'Price: High to Low', val: 'price_desc' },
                ].map((s) => {
                  const isActive = (searchParams.sort || 'featured') === s.val;
                  const query = new URLSearchParams(searchParams as any);
                  query.set('sort', s.val);
                  return (
                    <Link
                      key={s.val}
                      href={`/shop?${query.toString()}`}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-olive text-white border-olive'
                          : 'bg-surface border-border text-muted hover:text-foreground'
                      }`}
                    >
                      {s.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Filters */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Category Filter */}
              <div className="card p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-3">
                  Categories
                </h3>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/shop"
                      className={`block py-1 text-sm font-medium transition-colors ${
                        !searchParams.category ? 'text-accent font-bold' : 'text-muted hover:text-foreground'
                      }`}
                    >
                      All Categories
                    </Link>
                  </li>
                  {categories.map((cat) => {
                    const isSelected = searchParams.category === cat.slug;
                    return (
                      <li key={cat.id}>
                        <Link
                          href={`/shop?category=${cat.slug}`}
                          className={`flex items-center justify-between py-1 transition-colors ${
                            isSelected ? 'text-accent font-bold' : 'text-muted hover:text-foreground'
                          }`}
                        >
                          <span>{cat.name}</span>
                          <span className="text-xs text-muted/60">({cat._count.products})</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Regiment / Force Filter */}
              <div className="card p-5">
                <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-3">
                  Force & Regiment
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((tag) => {
                    const isSelected = searchParams.tag === tag.slug;
                    return (
                      <Link
                        key={tag.id}
                        href={`/shop?tag=${tag.slug}`}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-olive text-white border-olive'
                            : 'bg-surface-2 border-border text-muted hover:text-foreground hover:border-olive/50'
                        }`}
                      >
                        {tag.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Product Grid */}
            <div className="lg:col-span-3">
              {products.length > 0 ? (
                <ProductCarouselSection products={products as any} />
              ) : (
                <div className="card p-12 text-center">
                  <div className="text-5xl mb-3">📦</div>
                  <h3 className="text-lg font-bold text-foreground mb-2">No products found</h3>
                  <p className="text-muted text-sm max-w-md mx-auto mb-6">
                    We couldn't find any items matching your active filter criteria. Try resetting your filters to explore the rest of our inventory.
                  </p>
                  <Link href="/shop" className="btn-primary inline-flex">
                    Reset All Filters
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
