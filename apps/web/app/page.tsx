import Link from 'next/link';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/home/HeroSection';
import { CategoryGrid } from '@/components/home/CategoryGrid';
import { ForceRegimentStrip } from '@/components/home/ForceRegimentStrip';
import { ProductCarouselSection } from '@/components/home/ProductCarouselSection';
import { TrustBadges } from '@/components/home/TrustBadges';
import { getHomepageSections } from '@/lib/queries';

export const revalidate = 60; // ISR cache revalidation

export default async function HomePage() {
  let sections: any[] = [];
  try {
    sections = await getHomepageSections();
  } catch (e) {
    console.warn('[HomePage] Failed to fetch live CMS sections directly:', e);
  }

  // Find resolved dynamic sections from the CMS API
  const categorySection = sections.find((s) => s.type === 'CATEGORY_GRID');
  const newArrivalsSection = sections.find(
    (s) => s.type === 'PRODUCT_CAROUSEL' && (s.title?.includes('New Arrivals') || s.config?.rule === 'newest'),
  );
  const winterSection = sections.find(
    (s) => s.type === 'PRODUCT_CAROUSEL' && (s.title?.includes('Winter') || s.config?.tagSlug === 'winter'),
  );
  const forceSection = sections.find((s) => s.type === 'FORCE_REGIMENT_STRIP');
  const survivalSection = sections.find(
    (s) => s.type === 'PRODUCT_CAROUSEL' && (s.title?.includes('Survival') || s.config?.tagSlug === 'survival-ops'),
  );

  return (
    <>
      <AnnouncementBar />
      <Header />

      <main>
        {/* Hero Carousel */}
        <HeroSection />

        {/* Trust badges bar */}
        <TrustBadges />

        {/* Shop by Category */}
        <section className="py-12">
          <div className="container-main">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="section-title">
                  {categorySection?.title || 'Shop by Category'}
                </h2>
                <span className="gold-divider" />
                {categorySection?.subtitle && (
                  <p className="section-subtitle">{categorySection.subtitle}</p>
                )}
              </div>
              <Link href="/shop" className="text-accent text-sm font-medium hover:text-accent-light transition-colors">
                View All →
              </Link>
            </div>
            <CategoryGrid categories={categorySection?.categories} />
          </div>
        </section>

        {/* New Arrivals */}
        <section className="py-12 bg-surface">
          <div className="container-main">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-accent text-xs font-bold tracking-widest uppercase mb-1">Just In</p>
                <h2 className="section-title">
                  {newArrivalsSection?.title || 'New Arrivals'}
                </h2>
                <span className="gold-divider" />
                {newArrivalsSection?.subtitle && (
                  <p className="section-subtitle">{newArrivalsSection.subtitle}</p>
                )}
              </div>
              <Link href="/shop?sort=newest" className="text-accent text-sm font-medium hover:text-accent-light transition-colors">
                View All →
              </Link>
            </div>
            <ProductCarouselSection products={newArrivalsSection?.products} />
          </div>
        </section>

        {/* Force & Regiment Strip */}
        <section className="py-10 border-y border-border">
          <div className="container-main">
            <div className="text-center mb-6">
              <p className="text-accent text-xs font-bold tracking-widest uppercase mb-1">Cross-Regiment</p>
              <h2 className="section-title">
                {forceSection?.title || 'Shop by Force & Regiment'}
              </h2>
              <span className="gold-divider mx-auto" />
            </div>
            <ForceRegimentStrip tags={forceSection?.tags} />
          </div>
        </section>

        {/* Winter Collection */}
        <section className="py-12">
          <div className="container-main">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="text-info text-xs font-bold tracking-widest uppercase mb-1">Season Pick</p>
                <h2 className="section-title">
                  {winterSection?.title || 'Winter Collection'}
                </h2>
                <span className="gold-divider" />
                <p className="section-subtitle">
                  {winterSection?.subtitle || 'Tactical jackets, thermal wear & sweaters'}
                </p>
              </div>
              <Link href="/category/army-winter-wear" className="text-accent text-sm font-medium hover:text-accent-light transition-colors">
                View All →
              </Link>
            </div>
            <ProductCarouselSection products={winterSection?.products} />
          </div>
        </section>

        {/* Survival Ops Collection Banner */}
        <section className="py-6">
          <div className="container-main">
            <div className="relative rounded-xl overflow-hidden bg-charcoal border border-olive/30 p-8 md:p-12 flex flex-col md:flex-row items-center gap-6">
              <div className="absolute inset-0 opacity-5">
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(45deg, #4A6741 0, #4A6741 1px, transparent 0, transparent 50%)',
                    backgroundSize: '20px 20px',
                  }}
                />
              </div>

              <div className="relative flex-1">
                <span className="badge badge-accent mb-3 text-xs tracking-wider uppercase">Field Ops</span>
                <h2 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3">
                  Survival Ops Collection
                </h2>
                <p className="text-muted text-sm md:text-base max-w-lg mb-6">
                  Engineered for extreme conditions. Rugged tactical bags, water filtration kits, emergency blankets & tactical torches.
                </p>
                <Link href="/shop?tag=survival-ops" className="btn-primary inline-flex">
                  Explore Survival Gear →
                </Link>
              </div>

              <div className="relative flex-shrink-0 text-7xl md:text-8xl opacity-80 select-none">
                🏕️
              </div>
            </div>
          </div>
        </section>

        {/* Survival Ops Products (if returned by CMS) */}
        {survivalSection?.products && survivalSection.products.length > 0 && (
          <section className="py-10 bg-surface/50">
            <div className="container-main">
              <div className="flex items-end justify-between mb-8">
                <div>
                  <h2 className="section-title">
                    {survivalSection.title || 'Survival Ops Products'}
                  </h2>
                  <span className="gold-divider" />
                </div>
                <Link href="/shop?tag=survival-ops" className="text-accent text-sm font-medium hover:text-accent-light transition-colors">
                  View All →
                </Link>
              </div>
              <ProductCarouselSection products={survivalSection.products} />
            </div>
          </section>
        )}

        {/* Bulk Orders CTA Strip */}
        <section className="py-12 bg-surface border-t border-border">
          <div className="container-main text-center">
            <p className="text-accent text-xs font-bold tracking-widest uppercase mb-2">Institutional & Unit Orders</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">
              Bulk Orders for Regiments, Units & Battalions
            </h2>
            <p className="text-muted text-sm md:text-base max-w-xl mx-auto mb-6">
              Custom regimental embroidery, unit logos, customized badges and wholesale pricing available for official and unit requirements.
            </p>
            <Link href="/bulk-orders" className="btn-secondary inline-flex px-8 py-3">
              Submit Bulk Enquiry →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
