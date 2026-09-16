'use client';

import Link from 'next/link';
import { ShoppingCart, Heart, Check } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useState } from 'react';

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  compareAtPrice?: number | null;
  primaryImage?: { id: string; url: string; altText?: string | null } | null;
  inStock: boolean;
}

const fallbackProducts: ProductItem[] = [
  { id: '1', name: 'Army Combat T-Shirt — Olive Green', basePrice: 649, compareAtPrice: 899, slug: 'army-combat-t-shirt-olive-green', inStock: true },
  { id: '2', name: 'PARA Regiment Beret Cap', basePrice: 449, compareAtPrice: 599, slug: 'para-regiment-beret-cap', inStock: true },
  { id: '3', name: 'Military Tactical Winter Jacket', basePrice: 2499, compareAtPrice: 3499, slug: 'military-tactical-winter-jacket-camouflage', inStock: true },
  { id: '4', name: 'BSF Cap — Official Style', basePrice: 349, compareAtPrice: 499, slug: 'bsf-cap-official-style', inStock: true },
  { id: '5', name: 'Indian Army Thermal Inner Wear Set', basePrice: 1299, compareAtPrice: 1799, slug: 'indian-army-thermal-inner-wear-set', inStock: true },
  { id: '6', name: 'Regimental Shoulder Badge — PARA', basePrice: 199, compareAtPrice: 299, slug: 'regimental-shoulder-badge-para', inStock: false },
  { id: '7', name: 'Military Tactical Backpack — 40L', basePrice: 1899, compareAtPrice: 2799, slug: 'military-tactical-backpack-40l', inStock: true },
  { id: '8', name: 'NCC Khaki Field Cap', basePrice: 299, compareAtPrice: 399, slug: 'ncc-khaki-field-cap', inStock: true },
];

export function ProductCarouselSection({
  products,
}: {
  products?: ProductItem[];
  rule?: string;
  tag?: string;
  limit?: number;
}) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [addedIds, setAddedIds] = useState<Record<string, boolean>>({});

  const items = products && products.length > 0 ? products : fallbackProducts;

  const handleAddToCart = (e: React.MouseEvent, product: ProductItem) => {
    e.preventDefault();
    e.stopPropagation();

    addItem({
      id: product.id,
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.basePrice,
      compareAtPrice: product.compareAtPrice,
      imageUrl: product.primaryImage?.url ?? null,
      quantity: 1,
    });

    setAddedIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedIds((prev) => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
      {items.map((product) => {
        const discount =
          product.compareAtPrice && product.compareAtPrice > product.basePrice
            ? Math.round(
                ((product.compareAtPrice - product.basePrice) /
                  product.compareAtPrice) *
                  100,
              )
            : null;

        const isAdded = Boolean(addedIds[product.id]);

        return (
          <div
            key={product.id}
            className="product-card group relative flex flex-col min-w-0 bg-surface border border-border/80 rounded-xl overflow-hidden hover:border-olive/60 transition-all duration-300"
          >
            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
              {discount && (
                <span className="badge badge-accent text-[11px] font-bold">
                  -{discount}%
                </span>
              )}
              {!product.inStock && (
                <span className="badge badge-danger text-[10px]">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Wishlist button */}
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleWishlist({
                  id: product.id,
                  name: product.name,
                  slug: product.slug,
                  price: product.basePrice,
                  compareAtPrice: product.compareAtPrice,
                  imageUrl: product.primaryImage?.url || null,
                });
              }}
              className="absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full bg-surface/80 backdrop-blur-sm border border-border flex items-center justify-center text-muted hover:text-danger hover:border-danger/50 transition-all shadow-sm"
              aria-label="Add to wishlist"
            >
              <Heart
                size={14}
                className={isInWishlist(product.id) ? 'fill-danger text-danger' : ''}
              />
            </button>

            {/* Image area */}
            <Link href={`/product/${product.slug}`}>
              <div className="aspect-square bg-surface-2 flex items-center justify-center group-hover:scale-105 transition-transform duration-500 overflow-hidden relative">
                {product.primaryImage?.url ? (
                  <img
                    src={product.primaryImage.url}
                    alt={product.primaryImage.altText || product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl text-olive/50">🪖</div>
                )}
              </div>
            </Link>

            {/* Info */}
            <div className="p-3.5 flex flex-col flex-1">
              <Link href={`/product/${product.slug}`}>
                <h3 className="text-sm font-medium text-foreground line-clamp-2 hover:text-accent transition-colors mb-2 min-h-[2.5rem]">
                  {product.name}
                </h3>
              </Link>

              <div className="flex items-center gap-2 mb-3 mt-auto">
                <span className="text-accent font-bold text-base">
                  ₹{product.basePrice.toLocaleString('en-IN')}
                </span>
                {product.compareAtPrice && product.compareAtPrice > product.basePrice && (
                  <span className="text-muted line-through text-xs">
                    ₹{product.compareAtPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              {product.inStock ? (
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  className={`w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-lg transition-all active:scale-95 shadow-sm ${
                    isAdded
                      ? 'bg-success text-white'
                      : 'bg-olive hover:bg-olive-dark text-white'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check size={14} />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={14} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 bg-surface-2 text-muted text-xs font-semibold py-2.5 rounded-lg cursor-not-allowed border border-border/50"
                >
                  <span>Out of Stock</span>
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
