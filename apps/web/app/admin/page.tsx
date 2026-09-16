import Link from 'next/link';
import {
  Package,
  FolderOpen,
  MessageSquare,
  ShieldCheck,
  ExternalLink,
  Plus,
} from 'lucide-react';
import { getProducts, getCategoriesTree } from '@/lib/queries';

export const revalidate = 0; // Live dynamic data

export default async function AdminOverviewPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategoriesTree(),
  ]);

  const stats = [
    {
      label: 'Catalogue Items',
      value: products.length.toString(),
      change: 'Active in Storefront',
      icon: Package,
      color: 'text-accent',
    },
    {
      label: 'Categories',
      value: categories.length.toString(),
      change: 'Main Hierarchy',
      icon: FolderOpen,
      color: 'text-olive',
    },
    {
      label: 'Wholesale Leads',
      value: '3',
      change: 'Regiment Inquiries',
      icon: MessageSquare,
      color: 'text-info',
    },
    {
      label: 'Platform Mode',
      value: 'Unified',
      change: 'Storefront + Admin in 1 App',
      icon: ShieldCheck,
      color: 'text-success',
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Command Dashboard
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Real-time management for Cantt Store catalogue, inventory & wholesale requests
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/products/new"
            className="btn-primary text-xs px-4 py-2 font-bold flex items-center gap-2 shadow-md"
          >
            <Plus size={14} />
            <span>Add Product</span>
          </Link>
          <Link
            href="/admin/products"
            className="btn-secondary text-xs px-3.5 py-2 font-semibold flex items-center gap-2"
          >
            <Package size={14} />
            <span>Catalogue</span>
          </Link>
          <Link
            href="/"
            target="_blank"
            className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
          >
            <span>Live Site</span>
            <ExternalLink size={14} />
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, change, icon: Icon, color }) => (
          <div
            key={label}
            className="p-5 rounded-2xl bg-surface border border-border shadow-card flex items-start gap-3.5"
          >
            <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center flex-shrink-0">
              <Icon size={18} className={color} />
            </div>
            <div>
              <p className="text-xs text-muted">{label}</p>
              <p className="font-display font-bold text-xl text-foreground mt-0.5">{value}</p>
              <p className="text-[11px] text-muted mt-0.5">{change}</p>
            </div>
          </div>
        ))}
      </div>

      {/* YAGNI Architectural Advantage Banner */}
      <div className="p-5 rounded-2xl bg-olive/10 border border-olive/30 flex items-start gap-4">
        <div className="w-9 h-9 rounded-xl bg-olive text-white flex items-center justify-center flex-shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div className="space-y-1 text-xs">
          <h2 className="font-display font-bold text-sm text-foreground">
            Unified Single-Deployment Architecture (YAGNI)
          </h2>
          <p className="text-muted leading-relaxed">
            Admin and Web now share the same Next.js runtime. This means you deploy{' '}
            <strong className="text-foreground">only ONE Vercel project</strong> with zero extra server hosting fees, shared database connections, and unified Supabase authentication.
          </p>
        </div>
      </div>

      {/* Seeded Products Preview Table */}
      <div className="rounded-2xl bg-surface border border-border shadow-card overflow-hidden">
        <div className="p-5 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-bold text-base text-foreground flex items-center gap-2">
            <Package size={16} className="text-accent" />
            <span>Live Products in Catalogue</span>
          </h2>
          <Link
            href="/admin/products"
            className="text-xs text-accent font-semibold hover:underline"
          >
            View All ({products.length}) →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-2/60 text-muted uppercase tracking-wider font-semibold border-b border-border/80">
              <tr>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Base Price</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {products.map((p: any) => (
                <tr key={p.id} className="hover:bg-surface-2/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-2 border border-border overflow-hidden flex-shrink-0 flex items-center justify-center">
                        {p.primaryImage?.url ? (
                          <img
                            src={p.primaryImage.url}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>🪖</span>
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground line-clamp-1">{p.name}</p>
                        <p className="text-[10px] text-muted font-mono mt-0.5">slug: {p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted">
                    {p.categories?.[0]?.name || 'Standard Military'}
                  </td>
                  <td className="px-5 py-3.5 font-bold text-accent font-display text-sm">
                    ₹{p.basePrice.toLocaleString('en-IN')}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="badge bg-success/10 text-success border border-success/30 text-[10px]">
                      ● In Stock
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Link
                      href={`/product/${p.slug}`}
                      target="_blank"
                      className="text-muted hover:text-accent font-semibold p-1 inline-flex items-center gap-1"
                    >
                      <span>Store</span>
                      <ExternalLink size={12} />
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
