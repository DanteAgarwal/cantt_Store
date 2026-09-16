import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { ReorderCategoriesDto } from './dto/reorder-categories.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns active category tree for storefront navigation and mega-menus.
   */
  async getCategoryTree() {
    return this.prisma.category.findMany({
      where: {
        parentId: null,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            },
          },
        },
      },
    });
  }

  /**
   * Returns all categories (including inactive) for admin management.
   */
  async getAllCategoriesAdmin() {
    return this.prisma.category.findMany({
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        parent: {
          select: { id: true, name: true, slug: true },
        },
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });
  }

  /**
   * Returns a category by slug with its children and paginated published products.
   */
  async getCategoryBySlug(slug: string, page = 1, limit = 20) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
        parent: {
          select: { id: true, name: true, slug: true },
        },
      },
    });

    if (!category || !category.isActive) {
      throw new NotFoundException(`Category '${slug}' not found`);
    }

    // Collect all descendant category IDs so browsing a parent includes subcategory items
    const childIds = category.children.map((c) => c.id);
    const categoryIds = [category.id, ...childIds];

    const skip = (page - 1) * limit;

    const [totalProducts, productJoins] = await Promise.all([
      this.prisma.productCategory.count({
        where: {
          categoryId: { in: categoryIds },
          product: { status: 'PUBLISHED' },
        },
      }),
      this.prisma.productCategory.findMany({
        where: {
          categoryId: { in: categoryIds },
          product: { status: 'PUBLISHED' },
        },
        skip,
        take: limit,
        distinct: ['productId'],
        include: {
          product: {
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
            },
          },
        },
      }),
    ]);

    const products = productJoins.map((pj) => {
      const p = pj.product;
      const primaryImage = p.images.find((img) => img.isPrimary) || p.images[0];
      const hasStock = p.variants.some(
        (v) => (v.inventory?.quantity ?? 0) - (v.inventory?.reserved ?? 0) > 0,
      );

      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        basePrice: Number(p.basePrice),
        compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : null,
        status: p.status,
        isFeatured: p.isFeatured,
        brand: p.brand ? { id: p.brand.id, name: p.brand.name, slug: p.brand.slug } : null,
        primaryImage: primaryImage ? { id: primaryImage.id, url: primaryImage.url, altText: primaryImage.altText } : null,
        tags: p.tags.map((t) => ({ id: t.tag.id, name: t.tag.name, slug: t.tag.slug, type: t.tag.type })),
        inStock: hasStock,
      };
    });

    return {
      data: {
        category,
        products,
      },
      meta: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit) || 1,
      },
    };
  }

  /**
   * Admin: Create a new category
   */
  async createCategory(dto: CreateCategoryDto) {
    const existing = await this.prisma.category.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) {
      throw new ConflictException(`Category with slug '${dto.slug}' already exists`);
    }

    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent category ID '${dto.parentId}' not found`);
      }
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        imageUrl: dto.imageUrl,
        parentId: dto.parentId,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        isFeatured: dto.isFeatured ?? false,
        seoTitle: dto.seoTitle,
        seoDescription: dto.seoDescription,
      },
    });
  }

  /**
   * Admin: Update category
   */
  async updateCategory(id: string, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    if (dto.slug && dto.slug !== category.slug) {
      const slugExists = await this.prisma.category.findUnique({
        where: { slug: dto.slug },
      });
      if (slugExists) {
        throw new ConflictException(`Category with slug '${dto.slug}' already exists`);
      }
    }

    if (dto.parentId) {
      if (dto.parentId === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent) {
        throw new NotFoundException(`Parent category ID '${dto.parentId}' not found`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name !== undefined ? { name: dto.name } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.description !== undefined ? { description: dto.description } : {}),
        ...(dto.imageUrl !== undefined ? { imageUrl: dto.imageUrl } : {}),
        ...(dto.parentId !== undefined ? { parentId: dto.parentId } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
        ...(dto.isFeatured !== undefined ? { isFeatured: dto.isFeatured } : {}),
        ...(dto.seoTitle !== undefined ? { seoTitle: dto.seoTitle } : {}),
        ...(dto.seoDescription !== undefined ? { seoDescription: dto.seoDescription } : {}),
      },
    });
  }

  /**
   * Admin: Delete category safely
   */
  async deleteCategory(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            children: true,
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID '${id}' not found`);
    }

    if (category._count.children > 0) {
      throw new BadRequestException(
        `Cannot delete category '${category.name}' because it has ${category._count.children} subcategories. Move or delete them first.`,
      );
    }

    // Unlink any product connections first
    await this.prisma.productCategory.deleteMany({
      where: { categoryId: id },
    });

    return this.prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Admin: Bulk update sortOrder
   */
  async reorderCategories(dto: ReorderCategoriesDto) {
    const updates = dto.items.map((item) =>
      this.prisma.category.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    );
    await this.prisma.$transaction(updates);
    return { success: true, count: updates.length };
  }
}
