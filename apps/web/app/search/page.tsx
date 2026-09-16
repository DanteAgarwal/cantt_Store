import React from 'react';
import Link from 'next/link';
import { Search, ArrowLeft, Filter, Tag } from 'lucide-react';
import { getProducts, getCategoriesTree } from '@/lib/queries';
import { ProductCarouselSection } from '@/components/home/ProductCarouselSection';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const revalidate = 30;

interface SearchPageProps {
  searchParams: {
    q?: string;
    category?: string;
    sort?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const queryTerm = (searchParams.q || '').trim();
  const allProducts = await getProducts();
  const categories = await getCategoriesTree();

  // Filter products based on search term and category
  const filteredProducts = allProducts.filter((p: any) => {
    let matchesQuery = true;
    if (queryTerm) {
      const q = queryTerm.toLowerCase();
      const inName = p.name?.toLowerCase().includes(q);
      const inDesc = p.description?.toLowerCase().includes(q);
      const inShort = p.shortDescription?.toLowerCase().includes(q);
      const inCategory = p.categories?.some((c: any) => c.name.toLowerCase().includes(q));
      const inTag = p.tags?.some((t: any) => t.name.toLowerCase().includes(q));
      matchesQuery = Boolean(inName || inDesc || inShort || inCategory || inTag);
    }

    let matchesCat = true;
    if (searchParams.category) {
      matchesCat = p.categories?.some((c: any) => c.slug === searchParams.category);
    }

    return matchesQuery && matchesCat;
  });

  const popularKeywords = ['T-Shirt', 'Beret', 'Jacket', 'PARA', 'Backpack', 'BSF', 'Thermal', 'Badges'];

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
            <span className="text-foreground font-medium">Search</span>
            {queryTerm && (
              <>
                <span>/</span>
                <span className="text-accent">"{queryTerm}"</span>
              </>
            )}
          </div>

          {/* Search Header */}
          <div className="card p-6 md:p-8 mb-8 border border-border bg-gradient-to-r from-surface via-surface-2 to-surface shadow-card">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 text-xs text-accent uppercase font-bold tracking-wider mb-2">
                <Search size={14} />
                <span>Tactical Merchandise Search</span>
              </div>
              <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground mb-3">
                {queryTerm ? (
                  <>
                    Search Results for <span className="text-accent">"{queryTerm}"</span>
                  </>
                ) : (
                  'Search All Military Merchandise'
                )}
              </h1>
              <p className="text-xs md:text-sm text-muted">
                Found <strong className="text-foreground">{filteredProducts.length}</strong> matching{' '}
                {filteredProducts.length === 1 ? 'item' : 'items'} in the official Cantt Store catalogue.
              </p>
            </div>

            {/* Quick Keyword Pills */}
            <div className="pt-4 mt-4 border-t border-border/60 flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted font-medium">Trending searches:</span>
              {popularKeywords.map((kw) => (
                <Link
                  key={kw}
                  href={`/search?q=${encodeURIComponent(kw)}`}
                  className={`text-xs px-3 py-1 rounded-full border transition-all ${
                    queryTerm.toLowerCase() === kw.toLowerCase()
                      ? 'bg-olive text-white border-olive font-bold'
                      : 'bg-surface border-border text-muted hover:text-foreground hover:border-olive/50'
                  }`}
                >
                  {kw}
                </Link>
              ))}
            </div>
          </div>

          {/* Results Grid */}
          {filteredProducts.length > 0 ? (
            <div className="space-y-6">
              <ProductCarouselSection products={filteredProducts as any} />
            </div>
          ) : (
            <div className="card p-12 text-center max-w-lg mx-auto my-8 space-y-4 shadow-card">
              <div className="w-16 h-16 rounded-full bg-surface-2 border border-border flex items-center justify-center mx-auto text-muted">
                <Search size={28} />
              </div>
              <h2 className="font-display font-bold text-xl text-foreground">
                No Merchandise Found
              </h2>
              <p className="text-xs text-muted leading-relaxed">
                We couldn't find any military merchandise matching "{queryTerm}". Try searching for broader terms like "T-Shirt", "Jacket", "Beret", or "Cap".
              </p>
              <div className="pt-2">
                <Link href="/shop" className="btn-primary inline-flex text-xs font-bold px-6 py-2.5">
                  Browse Full Catalogue
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
}
