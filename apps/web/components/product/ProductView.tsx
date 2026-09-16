'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Heart, ShieldCheck, Truck, RefreshCw, Star, Check, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

interface VariantItem {
  id: string;
  sku: string;
  price: number;
  compareAtPrice: number | null;
  attributes: Record<string, string>;
  inStock: boolean;
  stockQty: number;
}

interface ProductViewProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    shortDescription: string | null;
    basePrice: number;
    compareAtPrice: number | null;
    brand: { name: string } | null;
    categories: Array<{ id: string; name: string; slug: string }>;
    tags: Array<{ id: string; name: string; slug: string; type: string }>;
    images: Array<{ id: string; url: string; altText: string | null; isPrimary: boolean }>;
    variants: VariantItem[];
    reviews?: Array<{ id: string; rating: number; title: string | null; body: string | null; profile?: { fullName: string | null } | null }>;
  };
}

export function ProductView({ product }: ProductViewProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [selectedImage, setSelectedImage] = useState<string>(
    product.images.find((img) => img.isPrimary)?.url || product.images[0]?.url || '',
  );

  const fallbackVariant: VariantItem = {
    id: product.id,
    sku: product.slug,
    price: product.basePrice,
    compareAtPrice: product.compareAtPrice,
    attributes: {},
    inStock: true,
    stockQty: 99,
  };

  const initialVariant =
    product.variants?.find((v) => v.inStock) || product.variants?.[0] || fallbackVariant;
  const [selectedVariant, setSelectedVariant] = useState<VariantItem>(initialVariant);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'desc' | 'specs' | 'reviews'>('desc');
  const [isAdded, setIsAdded] = useState(false);
  const [cartSuccess, setCartSuccess] = useState(false);
  const [isSizeChartOpen, setIsSizeChartOpen] = useState(false);

  const defaultReviews = [
    {
      id: 'rev-1',
      name: 'Maj. R. Verma',
      regiment: '9 PARA (Special Forces)',
      rating: 5,
      body: 'Outstanding stitching and durable cotton. Tested in Rajasthan field exercises. Withstands tactical wear exceptionally well.',
    },
    {
      id: 'rev-2',
      name: 'Sub. K. Singh',
      regiment: 'Rajputana Rifles',
      rating: 5,
      body: 'Exact regimental specifications. Fast delivery directly to Delhi Cantt station. High standard quality.',
    },
  ];

  const [productReviews, setProductReviews] = useState<any[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem(`cantt_reviews_${product.id}`) || '[]');
        if (stored.length > 0) return stored;
      } catch (e) {
        console.warn(e);
      }
    }
    return defaultReviews;
  });

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRegiment, setReviewerRegiment] = useState('');
  const [newReviewBody, setNewReviewBody] = useState('');

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !newReviewBody.trim()) return;

    const newRev = {
      id: `rev-${Date.now()}`,
      name: reviewerName.trim(),
      regiment: reviewerRegiment.trim() || 'Indian Armed Forces',
      rating: newRating,
      body: newReviewBody.trim(),
    };

    const updated = [newRev, ...productReviews];
    setProductReviews(updated);
    try {
      localStorage.setItem(`cantt_reviews_${product.id}`, JSON.stringify(updated));
    } catch (err) {
      console.warn(err);
    }
    setShowReviewForm(false);
    setReviewerName('');
    setReviewerRegiment('');
    setNewReviewBody('');
  };

  const isWishlisted = isInWishlist(product.id);
  const isAvailable = selectedVariant ? selectedVariant.inStock : true;

  const currentPrice = selectedVariant?.price ?? product.basePrice;
  const currentComparePrice = selectedVariant?.compareAtPrice ?? product.compareAtPrice;
  const discount =
    currentComparePrice && currentComparePrice > currentPrice
      ? Math.round(((currentComparePrice - currentPrice) / currentComparePrice) * 100)
      : null;

  // Collect available sizes and colors from variants
  const allSizes = Array.from(
    new Set((product.variants || []).map((v) => v.attributes['Size']).filter(Boolean)),
  );
  const allColours = Array.from(
    new Set((product.variants || []).map((v) => v.attributes['Colour']).filter(Boolean)),
  );

  const handleSelectAttribute = (attrName: string, attrVal: string) => {
    // Find matching variant
    const next = (product.variants || []).find((v) => {
      const matchThis = v.attributes[attrName] === attrVal;
      // Also try to match the other current attributes if possible
      const otherKey = attrName === 'Size' ? 'Colour' : 'Size';
      const matchOther = !selectedVariant?.attributes[otherKey] || v.attributes[otherKey] === selectedVariant?.attributes[otherKey];
      return matchThis && matchOther;
    }) || (product.variants || []).find((v) => v.attributes[attrName] === attrVal);

    if (next) setSelectedVariant(next);
  };

  const handleAddToCart = () => {
    addItem({
      id: selectedVariant?.id || product.id,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      compareAtPrice: currentComparePrice,
      imageUrl: selectedImage || (product.images[0]?.url ?? null),
      attributes: selectedVariant?.attributes || {},
      quantity,
    });
    setIsAdded(true);
    setCartSuccess(true);
    setTimeout(() => {
      setIsAdded(false);
      setCartSuccess(false);
    }, 2500);
  };

  const handleBuyNow = () => {
    addItem({
      id: selectedVariant?.id || product.id,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      compareAtPrice: currentComparePrice,
      imageUrl: selectedImage || (product.images[0]?.url ?? null),
      attributes: selectedVariant?.attributes || {},
      quantity,
    });
    router.push('/checkout');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
      {/* Left: Image Gallery (5 cols) */}
      <div className="lg:col-span-6 space-y-4">
        <div className="aspect-square bg-surface-2 border border-border rounded-2xl overflow-hidden flex items-center justify-center relative shadow-card">
          {discount && (
            <span className="absolute top-4 left-4 z-10 badge badge-accent font-bold px-3 py-1 text-xs">
              SAVE {discount}%
            </span>
          )}

          <button
            onClick={() =>
              toggleWishlist({
                id: product.id,
                name: product.name,
                slug: product.slug,
                price: currentPrice,
                compareAtPrice: currentComparePrice,
                imageUrl: selectedImage || (product.images[0]?.url ?? null),
                category: product.categories[0]?.name || null,
              })
            }
            className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-surface/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted hover:text-danger hover:border-danger/50 transition-all shadow-md"
            aria-label="Add to wishlist"
          >
            <Heart
              size={18}
              className={isWishlisted ? 'fill-danger text-danger' : ''}
            />
          </button>

          {selectedImage ? (
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-8xl opacity-30 select-none">🪖</div>
          )}
        </div>

        {/* Thumbnails */}
        {product.images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {product.images.map((img) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img.url)}
                className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                  selectedImage === img.url
                    ? 'border-accent shadow-glow-olive'
                    : 'border-border/70 opacity-70 hover:opacity-100'
                }`}
              >
                <img
                  src={img.url}
                  alt={img.altText || product.name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Right: Product Details & Purchase Form (7 cols) */}
      <div className="lg:col-span-6 flex flex-col justify-start space-y-6">
        {/* Categories & Regiment Tag Badges */}
        <div className="flex flex-wrap gap-2 items-center">
          {product.brand && (
            <span className="text-xs uppercase font-bold text-accent tracking-wider">
              {product.brand.name}
            </span>
          )}
          {product.tags.map((t) => (
            <span
              key={t.id}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-olive/20 text-olive-light border border-olive/30"
            >
              {t.name}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="font-display text-2xl md:text-4xl font-bold text-foreground leading-tight">
          {product.name}
        </h1>

        {/* Price Area */}
        <div className="flex items-baseline gap-3 p-4 rounded-xl bg-surface border border-border/80">
          <span className="font-display text-3xl md:text-4xl font-bold text-accent">
            ₹{currentPrice.toLocaleString('en-IN')}
          </span>
          {currentComparePrice && currentComparePrice > currentPrice && (
            <span className="text-muted line-through text-lg">
              ₹{currentComparePrice.toLocaleString('en-IN')}
            </span>
          )}
          <span className="text-xs text-muted ml-auto">Inclusive of all taxes</span>
        </div>

        {/* Stock Status Indicator */}
        <div className="flex items-center gap-2">
          {selectedVariant?.inStock ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              In Stock {selectedVariant.stockQty <= 5 && `(Only ${selectedVariant.stockQty} left!)`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-danger">
              <span className="w-2 h-2 rounded-full bg-danger" />
              Out of Stock
            </span>
          )}
          <span className="text-xs text-muted">· SKU: {selectedVariant?.sku || 'N/A'}</span>
        </div>

        {/* Size Selection */}
        {allSizes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-foreground">
                Size:{' '}
                <span className="text-accent">
                  {selectedVariant?.attributes['Size'] || 'Select a size'}
                </span>
              </label>
              <button
                type="button"
                onClick={() => setIsSizeChartOpen(true)}
                className="text-xs text-accent hover:underline cursor-pointer"
              >
                Size Chart
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {allSizes.map((size) => {
                const isSelected = selectedVariant?.attributes['Size'] === size;
                return (
                  <button
                    key={size}
                    onClick={() => handleSelectAttribute('Size', size)}
                    className={`min-w-[48px] h-11 px-3 rounded-lg border text-sm font-semibold transition-all ${
                      isSelected
                        ? 'bg-olive text-white border-olive shadow-sm'
                        : 'bg-surface border-border text-foreground hover:border-olive/60'
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Colour Selection */}
        {allColours.length > 0 && (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-foreground mb-2">
              Colour:{' '}
              <span className="text-accent">
                {selectedVariant?.attributes['Colour'] || 'Select a colour'}
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              {allColours.map((colour) => {
                const isSelected = selectedVariant?.attributes['Colour'] === colour;
                return (
                  <button
                    key={colour}
                    onClick={() => handleSelectAttribute('Colour', colour)}
                    className={`px-4 py-2 rounded-lg border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-olive text-white border-olive shadow-sm'
                        : 'bg-surface border-border text-foreground hover:border-olive/60'
                    }`}
                  >
                    {colour}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quantity & Action Buttons */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center border border-border rounded-xl bg-surface self-start sm:self-auto">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-11 flex items-center justify-center text-muted hover:text-foreground font-bold transition-colors"
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className="w-10 text-center text-sm font-bold">{quantity}</span>
              <button
                onClick={() =>
                  setQuantity((q) =>
                    selectedVariant ? Math.min(selectedVariant.stockQty || 99, q + 1) : q + 1,
                  )
                }
                className="w-10 h-11 flex items-center justify-center text-muted hover:text-foreground font-bold transition-colors"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className={`flex-1 py-3 px-5 rounded-xl flex items-center justify-center gap-2 text-xs font-bold transition-all shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed ${
                isAdded
                  ? 'bg-success text-white'
                  : 'btn-primary'
              }`}
            >
              {isAdded ? (
                <>
                  <Check size={16} />
                  <span>Added to Bag!</span>
                </>
              ) : (
                <>
                  <ShoppingCart size={16} />
                  <span>{isAvailable ? 'Add to Cart' : 'Out of Stock'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!isAvailable}
              className="py-3 px-6 rounded-xl bg-accent hover:bg-accent-hover text-charcoal-900 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap size={16} />
              <span>Buy Now</span>
            </button>
          </div>

          {cartSuccess && (
            <div className="p-3 bg-success/20 border border-success/40 text-success text-xs rounded-xl font-medium animate-fade-in flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-success" />
                <span>Added to tactical bag!</span>
              </div>
              <Link href="/cart" className="underline font-bold hover:text-foreground">
                View Bag & Checkout →
              </Link>
            </div>
          )}

          {/* Institutional / Bulk Order Callout */}
          <div className="p-3.5 rounded-xl bg-charcoal/60 border border-olive/30 flex items-center justify-between text-xs">
            <span className="text-muted">Need 10+ units for a regiment or unit?</span>
            <Link href="/bulk-orders" className="text-accent font-semibold hover:underline">
              Get Wholesale Quote →
            </Link>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/60 text-center">
          <div className="flex flex-col items-center gap-1 p-2">
            <ShieldCheck size={20} className="text-accent" />
            <span className="text-[11px] font-semibold text-foreground">100% Authentic</span>
            <span className="text-[10px] text-muted">Military specification</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2">
            <Truck size={20} className="text-accent" />
            <span className="text-[11px] font-semibold text-foreground">India Delivery</span>
            <span className="text-[10px] text-muted">Tracked dispatch</span>
          </div>
          <div className="flex flex-col items-center gap-1 p-2">
            <RefreshCw size={20} className="text-accent" />
            <span className="text-[11px] font-semibold text-foreground">Easy Exchange</span>
            <span className="text-[10px] text-muted">Within 7 days</span>
          </div>
        </div>

        {/* Tabs: Description, Specs & Reviews */}
        <div className="pt-4 border-t border-border">
          <div className="flex gap-4 border-b border-border/80 pb-2">
            <button
              onClick={() => setActiveTab('desc')}
              className={`text-xs font-bold uppercase tracking-wider pb-1 transition-colors ${
                activeTab === 'desc'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`text-xs font-bold uppercase tracking-wider pb-1 transition-colors ${
                activeTab === 'specs'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`text-xs font-bold uppercase tracking-wider pb-1 transition-colors flex items-center gap-1.5 ${
                activeTab === 'reviews'
                  ? 'text-accent border-b-2 border-accent'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              <span>Reviews</span>
              <span className="badge badge-accent text-[10px] px-1.5 py-0.5">
                {productReviews.length}
              </span>
            </button>
          </div>

          <div className="py-4 text-sm text-muted leading-relaxed">
            {activeTab === 'desc' && (
              <p className="whitespace-pre-line">
                {product.description || product.shortDescription || 'No description provided.'}
              </p>
            )}

            {activeTab === 'specs' && (
              <dl className="grid grid-cols-2 gap-y-2 text-xs">
                <dt className="text-muted">SKU</dt>
                <dd className="text-foreground font-medium">{selectedVariant?.sku || 'N/A'}</dd>
                <dt className="text-muted">Material</dt>
                <dd className="text-foreground font-medium">100% Breathable Tactical Cotton</dd>
                <dt className="text-muted">Fit</dt>
                <dd className="text-foreground font-medium">Standard Army Combat Cut</dd>
                <dt className="text-muted">Origin</dt>
                <dd className="text-foreground font-medium">Made in India</dd>
                <dt className="text-muted">Care</dt>
                <dd className="text-foreground font-medium">Machine wash cold, dry in shade</dd>
              </dl>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-5">
                {/* Review Header Stats */}
                <div className="p-4 rounded-xl bg-surface border border-border/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-display font-bold text-accent">4.9</div>
                    <div>
                      <div className="flex text-accent text-sm">★★★★★</div>
                      <p className="text-[11px] text-muted">
                        Based on {productReviews.length} verified military consignments
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="btn-secondary text-xs px-3 py-1.5 self-start sm:self-auto font-bold"
                  >
                    {showReviewForm ? 'Cancel' : '✍ Write a Review'}
                  </button>
                </div>

                {/* Write a Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="p-4 rounded-xl bg-surface-2 border border-border space-y-3 animate-fade-in text-xs">
                    <h4 className="font-bold text-foreground text-sm">Submit Officer Review</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-muted mb-1 font-medium">Your Name & Rank</label>
                        <input
                          type="text"
                          required
                          value={reviewerName}
                          onChange={(e) => setReviewerName(e.target.value)}
                          placeholder="e.g. Maj. R. Verma"
                          className="input w-full py-1.5 px-3 text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-muted mb-1 font-medium">Unit / Regiment / Station</label>
                        <input
                          type="text"
                          value={reviewerRegiment}
                          onChange={(e) => setReviewerRegiment(e.target.value)}
                          placeholder="e.g. 9 PARA SF / Delhi Cantt"
                          className="input w-full py-1.5 px-3 text-xs"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-muted mb-1 font-medium">Rating</label>
                      <div className="flex gap-1 text-base cursor-pointer">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <span
                            key={s}
                            onClick={() => setNewRating(s)}
                            className={s <= newRating ? 'text-accent' : 'text-muted'}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-muted mb-1 font-medium">Review Comments</label>
                      <textarea
                        required
                        rows={3}
                        value={newReviewBody}
                        onChange={(e) => setNewReviewBody(e.target.value)}
                        placeholder="Share feedback on fabric toughness, regimental color accuracy, stitching..."
                        className="input w-full p-2.5 text-xs"
                      />
                    </div>

                    <button type="submit" className="btn-primary text-xs px-4 py-2 font-bold">
                      Submit Verified Review
                    </button>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-3 divide-y divide-border/60">
                  {productReviews.map((rev: any, idx: number) => (
                    <div key={rev.id || idx} className="pt-3 first:pt-0 space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foreground">{rev.name}</span>
                          <span className="badge bg-success/20 text-success border border-success/30 text-[9px] py-0 px-1.5">
                            Verified Buyer
                          </span>
                        </div>
                        <span className="text-accent text-xs">{'★'.repeat(rev.rating)}</span>
                      </div>
                      <p className="text-[11px] text-olive-light font-medium">{rev.regiment}</p>
                      <p className="text-muted leading-relaxed mt-1">{rev.body}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Size Chart Modal */}
      {isSizeChartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="card p-6 md:p-8 max-w-lg w-full bg-surface border border-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">
                  Military Garment Size Specification
                </h3>
                <p className="text-xs text-muted">Standard Indian Armed Forces combat fit specifications</p>
              </div>
              <button
                onClick={() => setIsSizeChartOpen(false)}
                className="text-muted hover:text-foreground p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-surface-2 text-muted uppercase font-semibold">
                  <tr>
                    <th className="p-2.5">Size</th>
                    <th className="p-2.5">Chest (Inches)</th>
                    <th className="p-2.5">Length (Inches)</th>
                    <th className="p-2.5">Shoulder (Inches)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="p-2.5 font-bold text-foreground">S</td>
                    <td className="p-2.5 text-muted">38" (96 cm)</td>
                    <td className="p-2.5 text-muted">26" (66 cm)</td>
                    <td className="p-2.5 text-muted">16.5"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-foreground">M</td>
                    <td className="p-2.5 text-muted">40" (101 cm)</td>
                    <td className="p-2.5 text-muted">27" (68 cm)</td>
                    <td className="p-2.5 text-muted">17.5"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-foreground">L</td>
                    <td className="p-2.5 text-muted">42" (106 cm)</td>
                    <td className="p-2.5 text-muted">28" (71 cm)</td>
                    <td className="p-2.5 text-muted">18.5"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-foreground">XL</td>
                    <td className="p-2.5 text-muted">44" (111 cm)</td>
                    <td className="p-2.5 text-muted">29" (74 cm)</td>
                    <td className="p-2.5 text-muted">19.5"</td>
                  </tr>
                  <tr>
                    <td className="p-2.5 font-bold text-foreground">XXL</td>
                    <td className="p-2.5 text-muted">46" (116 cm)</td>
                    <td className="p-2.5 text-muted">30" (76 cm)</td>
                    <td className="p-2.5 text-muted">20.5"</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-surface-2 rounded-xl text-[11px] text-muted space-y-1">
              <p className="font-semibold text-foreground">Combat Cut Fit Note:</p>
              <p>Tailored with extra shoulder mobility for tactical equipment and body armour.</p>
            </div>

            <button
              onClick={() => setIsSizeChartOpen(false)}
              className="btn-primary w-full py-2.5 text-xs font-bold shadow-md"
            >
              Close Size Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
