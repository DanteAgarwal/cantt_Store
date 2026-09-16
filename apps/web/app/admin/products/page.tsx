import Link from 'next/link';
import { Package, ExternalLink, Eye, Plus } from 'lucide-react';
import { getProducts } from '@/lib/queries';

export const revalidate = 0;

export default async function AdminProductsPage() {
  const products = await getProducts();

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Product Catalogue
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Manage military t-shirts, tactical wear, beret caps, badges, and field equipment
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products/new"
            className="btn-primary text-xs px-4 py-2 font-bold flex items-center gap-2 shadow-md"
          >
            <Plus size={14} />
            <span>Add New Product</span>
          </Link>
          <Link
            href="/admin"
            className="btn-secondary text-xs px-3.5 py-2 font-semibold"
          >
            ← Overview
          </Link>
        </div>
      </div>

      {/* Filter / Search summary */}
      <div className="p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-muted">
          <span>Showing <strong className="text-foreground">{products.length}</strong> products registered in database</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-accent text-[10px]">
            Direct Supabase Sync
          </span>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-surface border border-border shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2/60 text-muted uppercase tracking-wider font-semibold border-b border-border/80">
              <tr>
                <th className="px-5 py-3.5">Product Title & SKU</th>
                <th className="px-5 py-3.5">Categories</th>
                <th className="px-5 py-3.5">Regiment / Tags</th>
                <th className="px-5 py-3.5">Base Price</th>
                <th className="px-5 py-3.5">Inventory</th>
                <th className="px-5 py-3.5 text-right">Storefront</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-surface-2/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-surface-2 border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {p.primaryImage?.url ? (
                          <img
                            src={p.primaryImage.url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xl text-muted">🪖</span>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-foreground text-sm line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-muted font-mono mt-0.5">slug: {p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted">
                    {p.categories?.map((c: any) => c.name).join(', ') || 'Tactical Gear'}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {p.tags?.map((t: any) => (
                        <span
                          key={t.id || t.name}
                          className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-surface-2 text-olive-light border border-border"
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-4 font-bold text-accent font-display text-sm">
                    ₹{p.basePrice.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-4 text-muted">
                    <span className="badge bg-success/10 text-success border border-success/30 text-[10px]">
                      ● In Stock
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Link
                      href={`/product/${p.slug}`}
                      target="_blank"
                      className="btn-secondary text-xs px-2.5 py-1.5 inline-flex items-center gap-1.5"
                    >
                      <Eye size={12} />
                      <span>Preview</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
