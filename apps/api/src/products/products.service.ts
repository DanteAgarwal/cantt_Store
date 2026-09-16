import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetProductsQueryDto } from './dto/get-products-query.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public: Query published products with filtering, search, sorting and pagination
   */
  async getProducts(query: GetProductsQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      status: 'PUBLISHED',
    };

    // Category filter (including child categories)
    if (query.category) {
      const cat = await this.prisma.category.findUnique({
        where: { slug: query.category },
        include: { children: { select: { id: true } } },
      });
      if (cat) {
        const catIds = [cat.id, ...cat.children.map((c) => c.id)];
        where.categories = {
          some: {
            categoryId: { in: catIds },
          },
        };
      } else {
        // Category slug doesn't exist -> empty result
        return {
          data: [],
          meta: { total: 0, page, limit, totalPages: 0 },
        };
      }
    }

    // Tag filter (e.g. regiment "para", season "winter")
    if (query.tag) {
      where.tags = {
        some: {
          tag: { slug: query.tag },
        },
      };
    }

    // Brand filter
    if (query.brand) {
      where.brand = {
        slug: query.brand,
      };
    }

    // Price range
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      where.basePrice = {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      };
    }

    // Search query
    if (query.q) {
      const q = query.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { shortDescription: { contains: q, mode: 'insensitive' } },
        { variants: { some: { sku: { contains: q, mode: 'insensitive' } } } },
      ];
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput[] = [{ createdAt: 'desc' }];
    if (query.sort === 'price_asc') {
      orderBy = [{ basePrice: 'asc' }];
    } else if (query.sort === 'price_desc') {
      orderBy = [{ basePrice: 'desc' }];
    } else if (query.sort === 'featured') {
      orderBy = [{ isFeatured: 'desc' }, { createdAt: 'desc' }];
    } else if (query.sort === 'newest') {
      orderBy = [{ createdAt: 'desc' }];
    }

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          brand: true,
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          categories: {
            include: { category: true },
          },
          tags: {
            include: { tag: true },
          },
          variants: {
            where: { isActive: true },
            include: { inventory: true },
          },
          reviews: {
            where: { isApproved: true },
            select: { rating: true },
          },
        },
      }),
    ]);

    const formatted = products.map((p) => {
      const primaryImage = p.images.find((img) => img.isPrimary) || p.images[0];
      const inStock = p.variants.some(
        (v) => (v.inventory?.quantity ?? 0) - (v.inventory?.reserved ?? 0) > 0,
      );
      const ratingCount = p.reviews.length;
      const ratingAverage =
        ratingCount > 0
          ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / ratingCount).toFixed(1))
          : undefined;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        shortDescription: p.shortDescription,
        basePrice: Number(p.basePrice),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        status: p.status,
        isFeatured: p.isFeatured,
        brand: p.brand ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug } : null,
        primaryImage: primaryImage
          ? { id: primaryImage.id, url: primaryImage.url, altText: primaryImage.altText }
          : null,
        categories: p.categories.map((c) => ({
          id: c.category.id,
          name: c.category.name,
          slug: c.category.slug,
        })),
        tags: p.tags.map((t) => ({
          id: t.tag.id,
          name: t.tag.name,
          slug: t.tag.slug,
          type: t.tag.type,
        })),
        inStock,
        ratingAverage,
        ratingCount,
      };
    });

    return {
      data: formatted,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Public: Get featured products for homepage / carousels
   */
  async getFeaturedProducts(limit = 8) {
    const products = await this.prisma.product.findMany({
      where: {
        status: 'PUBLISHED',
        isFeatured: true,
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        brand: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        tags: {
          include: { tag: true },
        },
        variants: {
          where: { isActive: true },
          include: { inventory: true },
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
    });

    return products.map((p) => {
      const primaryImage = p.images.find((img) => img.isPrimary) || p.images[0];
      const inStock = p.variants.some(
        (v) => (v.inventory?.quantity ?? 0) - (v.inventory?.reserved ?? 0) > 0,
      );
      const ratingCount = p.reviews.length;
      const ratingAverage =
        ratingCount > 0
          ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / ratingCount).toFixed(1))
          : undefined;

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        basePrice: Number(p.basePrice),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        status: p.status,
        isFeatured: p.isFeatured,
        brand: p.brand ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug } : null,
        primaryImage: primaryImage
          ? { id: primaryImage.id, url: primaryImage.url, altText: primaryImage.altText }
          : null,
        tags: p.tags.map((t) => ({
          id: t.tag.id,
          name: t.tag.name,
          slug: t.tag.slug,
          type: t.tag.type,
        })),
        inStock,
        ratingAverage,
        ratingCount,
      };
    });
  }

  /**
   * Public: Get full product details by slug (PDP)
   */
  async getProductBySlug(slug: string) {
    const p = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        categories: {
          include: { category: true },
        },
        tags: {
          include: { tag: true },
        },
        variants: {
          where: { isActive: true },
          include: {
            inventory: true,
            attributeValues: {
              include: {
                attributeValue: {
                  include: { attribute: true },
                },
              },
            },
          },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            profile: {
              select: { fullName: true, avatarUrl: true },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!p || p.status !== 'PUBLISHED') {
      throw new NotFoundException(`Product with slug '${slug}' not found`);
    }

    const ratingCount = p.reviews.length;
    const ratingAverage =
      ratingCount > 0
        ? Number((p.reviews.reduce((acc, r) => acc + r.rating, 0) / ratingCount).toFixed(1))
        : undefined;

    // Resolve variant attributes into clean key-value dictionary e.g. { "Size": "M", "Colour": "Olive Green" }
    const variants = p.variants.map((v) => {
      const attributes: Record<string, string> = {};
      v.attributeValues.forEach((av) => {
        const attrName = av.attributeValue.attribute.name;
        attributes[attrName] = av.attributeValue.value;
      });

      const qty = v.inventory?.quantity ?? 0;
      const reserved = v.inventory?.reserved ?? 0;
      const available = Math.max(0, qty - reserved);

      return {
        id: v.id,
        sku: v.sku,
        price: v.price ? Number(v.price) : Number(p.basePrice),
        compareAtPrice: v.compareAtPrice
          ? Number(v.compareAtPrice)
          : p.compareAtPrice
          ? Number(p.compareAtPrice)
          : null,
        weightGrams: v.weightGrams,
        isActive: v.isActive,
        attributes,
        inStock: available > 0,
        stockQty: available,
      };
    });

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      shortDescription: p.shortDescription,
      basePrice: Number(p.basePrice),
      compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
      status: p.status,
      isFeatured: p.isFeatured,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      brand: p.brand ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug } : null,
      categories: p.categories.map((c) => ({
        id: c.category.id,
        name: c.category.name,
        slug: c.category.slug,
      })),
      tags: p.tags.map((t) => ({
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
        type: t.tag.type,
      })),
      images: p.images.map((img) => ({
        id: img.id,
        url: img.url,
        altText: img.altText,
        sortOrder: img.sortOrder,
        isPrimary: img.isPrimary,
      })),
      variants,
      ratingAverage,
      ratingCount,
      recentReviews: p.reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        body: r.body,
        userName: r.profile.fullName || 'Anonymous',
        userAvatar: r.profile.avatarUrl,
        createdAt: r.createdAt,
      })),
    };
  }

  /**
   * Public: Get related products in the same category or tags
   */
  async getRelatedProducts(slug: string, limit = 4) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        categories: { select: { categoryId: true } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug '${slug}' not found`);
    }

    const categoryIds = product.categories.map((c) => c.categoryId);

    const related = await this.prisma.product.findMany({
      where: {
        id: { not: product.id },
        status: 'PUBLISHED',
        categories: {
          some: { categoryId: { in: categoryIds } },
        },
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { where: { isActive: true }, include: { inventory: true } },
      },
    });

    return related.map((p) => {
      const primaryImage = p.images.find((img) => img.isPrimary) || p.images[0];
      const inStock = p.variants.some(
        (v) => (v.inventory?.quantity ?? 0) - (v.inventory?.reserved ?? 0) > 0,
      );

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        basePrice: Number(p.basePrice),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        primaryImage: primaryImage
          ? { id: primaryImage.id, url: primaryImage.url, altText: primaryImage.altText }
          : null,
        inStock,
      };
    });
  }

  // -------------------------------------------------------------
  // Admin Operations
  // -------------------------------------------------------------

  /**
   * Admin: List all products (drafts, published, archived) with pagination
   */
  async getAllAdmin(query: GetProductsQueryDto) {
    const page = Math.max(1, query.page || 1);
    const limit = Math.max(1, Math.min(100, query.limit || 20));
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {};
    if (query.q) {
      const q = query.q.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, products] = await Promise.all([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: true,
          images: { orderBy: { sortOrder: 'asc' } },
          categories: { include: { category: true } },
          variants: { include: { inventory: true } },
          _count: { select: { reviews: true, orderItems: true } },
        },
      }),
    ]);

    return {
      data: products.map((p) => {
        const totalStock = p.variants.reduce(
          (acc, v) => acc + (v.inventory?.quantity ?? 0),
          0,
        );
        return {
          id: p.id,
          name: p.name,
          slug: p.slug,
          basePrice: Number(p.basePrice),
          compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
          status: p.status,
          isFeatured: p.isFeatured,
          variantCount: p.variants.length,
          totalStock,
          categories: p.categories.map((c) => c.category.name),
          primaryImage: p.images.find((img) => img.isPrimary)?.url || p.images[0]?.url,
          createdAt: p.createdAt,
          updatedAt: p.updatedAt,
        };
      }),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Admin: Create a product
   */
  async createProduct(dto: CreateProductDto) {
    const existing = await this.prisma.product.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Product with slug '${dto.slug}' already exists`);
    }

    return this.prisma.product.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        shortDescription: dto.shortDescription,
        basePrice: dto.basePrice,
        compareAtPrice: dto.compareAtPrice,
        brandId: dto.brandId,
        isFeatured: dto.isFeatured ?? false,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
        categories: dto.categoryIds
          ? {
              create: dto.categoryIds.map((cid) => ({ categoryId: cid })),
            }
          : undefined,
        tags: dto.tagIds
          ? {
              create: dto.tagIds.map((tid) => ({ tagId: tid })),
            }
          : undefined,
      },
      include: {
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
      },
    });
  }

  /**
   * Admin: Update a product
   */
  async updateProduct(id: string, dto: UpdateProductDto) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    if (dto.slug && dto.slug !== product.slug) {
      const existing = await this.prisma.product.findUnique({
        where: { slug: dto.slug },
      });
      if (existing) {
        throw new ConflictException(`Product with slug '${dto.slug}' already exists`);
      }
    }

    // Handle category / tag array replacement if provided
    return this.prisma.$transaction(async (tx) => {
      if (dto.categoryIds) {
        await tx.productCategory.deleteMany({ where: { productId: id } });
        await tx.productCategory.createMany({
          data: dto.categoryIds.map((cid) => ({ productId: id, categoryId: cid })),
        });
      }

      if (dto.tagIds) {
        await tx.productTag.deleteMany({ where: { productId: id } });
        await tx.productTag.createMany({
          data: dto.tagIds.map((tid) => ({ productId: id, tagId: tid })),
        });
      }

      return tx.product.update({
        where: { id },
        data: {
          ...(dto.name !== undefined ? { name: dto.name } : {}),
          ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
          ...(dto.description !== undefined ? { description: dto.description } : {}),
          ...(dto.shortDescription !== undefined ? { shortDescription: dto.shortDescription } : {}),
          ...(dto.basePrice !== undefined ? { basePrice: dto.basePrice } : {}),
          ...(dto.compareAtPrice !== undefined ? { compareAtPrice: dto.compareAtPrice } : {}),
          ...(dto.brandId !== undefined ? { brandId: dto.brandId } : {}),
          ...(dto.status !== undefined ? { status: dto.status } : {}),
          ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
          ...(dto.seoTitle !== undefined ? { seoTitle: dto.seoTitle } : {}),
          ...(dto.seoDescription !== undefined ? { seoDescription: dto.seoDescription } : {}),
        },
      });
    });
  }

  /**
   * Admin: Publish product
   */
  async publishProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    return this.prisma.product.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Admin: Unpublish product (Draft)
   */
  async unpublishProduct(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID '${id}' not found`);
    }

    return this.prisma.product.update({
      where: { id },
      data: { status: 'DRAFT' },
    });
  }

  /**
   * Admin: Update inventory for a variant
   */
  async updateInventory(variantId: string, dto: UpdateInventoryDto) {
    const variant = await this.prisma.productVariant.findUnique({
      where: { id: variantId },
    });
    if (!variant) {
      throw new NotFoundException(`Variant with ID '${variantId}' not found`);
    }

    return this.prisma.inventory.upsert({
      where: { variantId },
      update: {
        quantity: dto.quantity,
        ...(dto.lowStockAt !== undefined ? { lowStockAt: dto.lowStockAt } : {}),
      },
      create: {
        variantId,
        quantity: dto.quantity,
        lowStockAt: dto.lowStockAt ?? 5,
      },
    });
  }
}
