import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ProductView } from '@/components/product/ProductView';
import { ProductCarouselSection } from '@/components/home/ProductCarouselSection';
import { getProductBySlug, getProducts } from '@/lib/queries';

export const revalidate = 60;

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Get related products from the same category or general catalogue
  const relatedCategorySlug = product.categories[0]?.slug;
  const related = await getProducts({
    categorySlug: relatedCategorySlug,
  });
  const filteredRelated = related.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main className="min-h-screen py-8 md:py-12 bg-background">
        <div className="container-main">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-muted mb-6">
            <Link href="/" className="hover:text-foreground transition-colors">
              Home
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-foreground transition-colors">
              Shop
            </Link>
            {product.categories[0] && (
              <>
                <span>/</span>
                <Link
                  href={`/category/${product.categories[0].slug}`}
                  className="hover:text-foreground transition-colors"
                >
                  {product.categories[0].name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-accent font-medium line-clamp-1">{product.name}</span>
          </div>

          {/* Main Product View */}
          <ProductView product={product as any} />

          {/* Related Products Section */}
          {filteredRelated.length > 0 && (
            <div className="mt-16 pt-12 border-t border-border/80">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <p className="text-accent text-xs font-bold tracking-widest uppercase mb-1">
                    Complete Your Kit
                  </p>
                  <h2 className="section-title">Related Tactical Gear</h2>
                  <span className="gold-divider" />
                </div>
                <Link
                  href="/shop"
                  className="text-accent text-sm font-medium hover:text-accent-light transition-colors"
                >
                  View All →
                </Link>
              </div>

              <ProductCarouselSection products={filteredRelated as any} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
