// ============================================================
// Shared TypeScript types used by apps/web, apps/admin, apps/api
// ============================================================

// ---- Enums (mirror Prisma enums) ----

export type Role = 'CUSTOMER' | 'STAFF' | 'ADMIN' | 'SUPER_ADMIN';
export type ProductStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'RETURNED'
  | 'REFUNDED';
export type PaymentMethod = 'COD' | 'ONLINE';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type TagType = 'GENERAL' | 'FORCE_REGIMENT' | 'SEASON' | 'COLLECTION';
export type CmsSectionType =
  | 'HERO_CAROUSEL'
  | 'CATEGORY_GRID'
  | 'PRODUCT_CAROUSEL'
  | 'BANNER'
  | 'TESTIMONIALS'
  | 'FORCE_REGIMENT_STRIP';

// ---- API Response wrapper ----

export interface ApiResponse<T> {
  data: T;
  meta?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ---- Category ----

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  children?: Category[];
  sortOrder: number;
  isActive: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
}

// ---- Tag ----

export interface Tag {
  id: string;
  name: string;
  slug: string;
  type: TagType;
}

// ---- Product ----

export interface ProductImage {
  id: string;
  url: string;
  altText?: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface VariantAttribute {
  name: string;
  value: string;
}

export interface ProductVariant {
  id: string;
  sku: string;
  price?: number;
  compareAtPrice?: number;
  weightGrams?: number;
  isActive: boolean;
  attributes: Record<string, string>; // { "Size": "M", "Colour": "Olive" }
  inStock: boolean;
  stockQty?: number;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  basePrice: number;
  compareAtPrice?: number;
  salePrice?: number;
  status: ProductStatus;
  isFeatured: boolean;
  categories: Pick<Category, 'id' | 'name' | 'slug'>[];
  tags: Tag[];
  images: ProductImage[];
  variants: ProductVariant[];
  ratingAverage?: number;
  ratingCount?: number;
  seoTitle?: string;
  seoDescription?: string;
}

// ---- Cart ----

export interface CartItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  variantId: string;
  variantSku: string;
  variantAttributes: Record<string, string>;
  imageUrl?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  inStock: boolean;
}

export interface Cart {
  id: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  couponCode?: string;
}

// ---- Order ----

export interface OrderItem {
  id: string;
  productNameSnapshot: string;
  variantSnapshot?: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface OrderStatusHistoryEntry {
  status: OrderStatus;
  note?: string;
  changedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  total: number;
  statusHistory: OrderStatusHistoryEntry[];
  placedAt: string;
}

// ---- CMS ----

export interface CmsSection {
  id: string;
  type: CmsSectionType;
  title?: string;
  subtitle?: string;
  config: Record<string, unknown>;
  sortOrder: number;
  isActive: boolean;
}

export interface CmsPage {
  slug: string;
  title: string;
  bodyHtml: string;
}
