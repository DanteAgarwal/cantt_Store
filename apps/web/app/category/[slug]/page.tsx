import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductCarouselSection } from '@/components/home/ProductCarouselSection';
import { getCategoryBySlug } from '@/lib/queries';

export const revalidate = 60;

interface CategoryPageProps {
  params: {
    slug: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const result = await getCategoryBySlug(params.slug);

  if (!result) {
    notFound();
  }

  const { category, products } = result;

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
            <Link href="/shop" className="hover:text-foreground transition-colors">
              Categories
            </Link>
            <span>/</span>
            <span className="text-accent font-medium">{category.name}</span>
          </div>

          {/* Category Header */}
          <div className="card p-6 md:p-8 mb-8 border-olive/30 bg-gradient-to-r from-charcoal via-surface to-charcoal">
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">
              {category.name}
            </h1>
            {category.description && (
              <p className="text-muted text-base max-w-2xl text-balance mb-4">
                {category.description}
              </p>
            )}

            {/* Subcategories if any */}
            {category.children && category.children.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                <span className="text-xs text-muted font-medium py-1.5 self-center">Subcategories:</span>
                {category.children.map((sub) => (
                  <Link
                    key={sub.id}
                    href={`/category/${sub.slug}`}
                    className="px-3 py-1 bg-surface-2 hover:bg-olive/20 hover:border-olive/50 border border-border text-foreground text-xs font-semibold rounded-full transition-all"
                  >
                    {sub.name}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Products Count Header */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-muted text-sm">
              Showing <span className="font-bold text-foreground">{products.length}</span> {products.length === 1 ? 'product' : 'products'}
            </p>
            <Link href="/shop" className="text-accent text-xs font-medium hover:underline">
              Explore all categories →
            </Link>
          </div>

          {/* Product Grid */}
          {products.length > 0 ? (
            <ProductCarouselSection products={products as any} />
          ) : (
            <div className="card p-12 text-center">
              <div className="text-5xl mb-3">🪖</div>
              <h3 className="text-lg font-bold text-foreground mb-2">No products in this category yet</h3>
              <p className="text-muted text-sm max-w-md mx-auto mb-6">
                Check back soon or browse our full store to discover other military apparel and accessories.
              </p>
              <Link href="/shop" className="btn-primary inline-flex">
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
