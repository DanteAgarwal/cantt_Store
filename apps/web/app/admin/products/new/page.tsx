'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  ArrowLeft,
  Check,
  AlertCircle,
  Upload,
  Image as ImageIcon,
  Tag,
  FolderOpen,
  DollarSign,
  Layers,
  Sparkles,
  Eye,
} from 'lucide-react';

const categoryOptions = [
  { id: 'cat-1', name: 'Military T-Shirts', slug: 'military-t-shirts' },
  { id: 'cat-2', name: 'Caps & Headwear', slug: 'military-caps-headwear' },
  { id: 'cat-3', name: 'Army Winter Wear', slug: 'army-winter-wear' },
  { id: 'cat-4', name: 'Tactical Gear', slug: 'tactical-gear' },
  { id: 'cat-5', name: 'Badges & Patches', slug: 'regimental-badges-patches' },
  { id: 'cat-6', name: 'Military Bags', slug: 'military-bags-backpacks' },
];

const forceOptions = [
  { id: 'tag-1', name: 'PARA (Special Forces)' },
  { id: 'tag-2', name: 'BSF' },
  { id: 'tag-3', name: 'CRPF' },
  { id: 'tag-4', name: 'Signals Corps' },
  { id: 'tag-5', name: 'EME' },
  { id: 'tag-6', name: 'Rajputana Rifles' },
  { id: 'tag-7', name: 'NCC' },
  { id: 'tag-8', name: 'General Defence' },
];

const imagePresets = [
  {
    label: 'Combat Camo Tee',
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Maroon Beret',
    url: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Tactical Jacket',
    url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'MOLLE Backpack',
    url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Tactical Field Boots',
    url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
  },
];

export default function NewProductPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [categoryId, setCategoryId] = useState(categoryOptions[0].id);
  const [tagName, setTagName] = useState(forceOptions[0].name);
  const [sku, setSku] = useState('');
  const [initialStock, setInitialStock] = useState('50');
  const [imageUrl, setImageUrl] = useState(imagePresets[0].url);
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFT'>('PUBLISHED');
  const [isFeatured, setIsFeatured] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    setSlug(generatedSlug);
    if (!sku) {
      setSku(`CS-${generatedSlug.substring(0, 6).toUpperCase()}-01`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Product title is required.');
      return;
    }
    if (!basePrice || Number(basePrice) <= 0) {
      setError('Please provide a valid base price.');
      return;
    }

    setIsLoading(true);

    try {
      const selectedCategory = categoryOptions.find((c) => c.id === categoryId);

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          basePrice: Number(basePrice),
          compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
          categoryId,
          categoryName: selectedCategory?.name,
          tagName,
          sku: sku.trim() || `CS-${Date.now().toString().slice(-6)}`,
          initialStock: Number(initialStock) || 50,
          imageUrl: imageUrl.trim() || null,
          shortDescription: shortDescription.trim() || null,
          description: description.trim() || null,
          status,
          isFeatured,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to create product.');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/admin/products');
        router.refresh();
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while saving.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-muted mb-1">
            <Link href="/admin" className="hover:text-foreground">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/admin/products" className="hover:text-foreground">
              Products
            </Link>
            <span>/</span>
            <span className="text-accent font-medium">Add New</span>
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Register New Merchandise
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Create and deploy military apparel, caps, badges, or equipment to the live catalogue
          </p>
        </div>

        <Link
          href="/admin/products"
          className="btn-secondary text-xs px-3.5 py-2 font-semibold inline-flex items-center gap-2 self-start"
        >
          <ArrowLeft size={14} />
          <span>Back to Catalogue</span>
        </Link>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Primary Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* General Information Card */}
          <div className="card p-6 border border-border space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-3">
              <Package size={16} className="text-accent" />
              <span>General Information</span>
            </h2>

            {error && (
              <div className="p-3.5 bg-danger/10 border border-danger/30 rounded-xl text-danger text-xs flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3.5 bg-success/10 border border-success/30 rounded-xl text-success text-xs flex items-center gap-2">
                <Check size={16} className="flex-shrink-0" />
                <span>Merchandise successfully registered! Redirecting to catalogue...</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Product Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Special Forces Commando Combat T-Shirt"
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                URL Slug <span className="text-muted font-normal">(Auto-generated)</span>
              </label>
              <div className="flex items-center bg-surface-2 border border-border rounded-xl overflow-hidden px-3 py-2 text-xs">
                <span className="text-muted/70 font-mono">/product/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="bg-transparent border-0 text-foreground font-mono text-xs focus:outline-none flex-1 ml-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Category
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent"
                >
                  {categoryOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Regiment / Force Tag
                </label>
                <select
                  value={tagName}
                  onChange={(e) => setTagName(e.target.value)}
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground focus:outline-none focus:border-accent"
                >
                  {forceOptions.map((f) => (
                    <option key={f.id} value={f.name}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Short Highlight / Brief Summary
              </label>
              <input
                type="text"
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                placeholder="e.g. 100% Breathable Tactical Cotton with dual sleeve Velcro patches"
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Technical Specifications & Description
              </label>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Field-ready design, fabric GSM, reinforced seams, wash instructions, and tactical features..."
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent resize-none"
              />
            </div>
          </div>

          {/* Pricing & Stock Card */}
          <div className="card p-6 border border-border space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-3">
              <DollarSign size={16} className="text-accent" />
              <span>Pricing & Inventory Control</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Base Price (₹) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  step="1"
                  value={basePrice}
                  onChange={(e) => setBasePrice(e.target.value)}
                  placeholder="e.g. 799"
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent font-display font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Compare at Price (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={compareAtPrice}
                  onChange={(e) => setCompareAtPrice(e.target.value)}
                  placeholder="e.g. 1199"
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Stock Units (Station Qty)
                </label>
                <input
                  type="number"
                  min="0"
                  value={initialStock}
                  onChange={(e) => setInitialStock(e.target.value)}
                  placeholder="50"
                  className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                SKU (Stock Keeping Unit)
              </label>
              <input
                type="text"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. CS-SF-TEE-01"
                className="w-full bg-surface-2 border border-border rounded-xl px-4 py-2.5 text-xs font-mono text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Media & Publishing */}
        <div className="lg:col-span-4 space-y-6">
          {/* Media & Visual Preview */}
          <div className="card p-6 border border-border space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-3">
              <ImageIcon size={16} className="text-accent" />
              <span>Product Visual</span>
            </h2>

            {/* Image Preview Box */}
            <div className="aspect-square rounded-xl bg-surface-2 border border-border overflow-hidden flex items-center justify-center relative shadow-inner">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Product preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center p-4 text-muted">
                  <Upload size={32} className="mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No image specified</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1.5">
                Image CDN URL
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-surface-2 border border-border rounded-xl px-3 py-2 text-xs text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent"
              />
            </div>

            {/* Tactical Presets */}
            <div>
              <p className="text-[11px] font-semibold text-muted uppercase tracking-wider mb-2">
                Fast Tactical Presets:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {imagePresets.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      imageUrl === preset.url
                        ? 'bg-olive text-white border-olive font-bold'
                        : 'bg-surface-2 text-muted hover:text-foreground border-border'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Publishing Card */}
          <div className="card p-6 border border-border space-y-4">
            <h2 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border/80 pb-3">
              <Sparkles size={16} className="text-accent" />
              <span>Publishing Status</span>
            </h2>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border/70 cursor-pointer">
                <div>
                  <p className="font-semibold text-foreground">Catalogue Visibility</p>
                  <p className="text-[11px] text-muted">Instantly live for customers</p>
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="bg-surface border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none"
                >
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                </select>
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl bg-surface-2 border border-border/70 cursor-pointer">
                <div>
                  <p className="font-semibold text-foreground">Featured Merchandise</p>
                  <p className="text-[11px] text-muted">Show in homepage carousel</p>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded border-border accent-accent"
                />
              </label>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-98 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-charcoal-900 border-t-transparent rounded-full animate-spin" />
                    <span>Deploying Merchandise...</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Save & Deploy Product</span>
                  </>
                )}
              </button>

              <Link
                href="/admin/products"
                className="btn-secondary w-full py-2.5 text-xs text-center block font-semibold"
              >
                Discard & Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
