import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCmsSectionDto } from './dto/create-section.dto';
import { UpdateCmsSectionDto } from './dto/update-section.dto';
import { UpsertCmsPageDto } from './dto/upsert-page.dto';
import { CreateBannerDto } from './dto/create-banner.dto';

@Injectable()
export class CmsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Public: Get resolved homepage payload with live products, categories, tags, and banners
   */
  async getHomepage() {
    const rawSections = await this.prisma.cmsSection.findMany({
      where: {
        page: 'home',
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    const resolvedSections = await Promise.all(
      rawSections.map(async (section) => {
        const config = (section.config as Record<string, any>) || {};

        switch (section.type) {
          case 'HERO_CAROUSEL': {
            // Also fetch active banners
            const banners = await this.prisma.banner.findMany({
              where: { isActive: true },
              orderBy: { sortOrder: 'asc' },
            });
            return {
              id: section.id,
              type: section.type,
              title: section.title,
              subtitle: section.subtitle,
              sortOrder: section.sortOrder,
              config,
              slides: config.slides || banners,
            };
          }

          case 'CATEGORY_GRID': {
            const slugs: string[] = config.categorySlugs || [];
            let categories: any[] = [];
            if (slugs.length > 0) {
              categories = await this.prisma.category.findMany({
                where: {
                  slug: { in: slugs },
                  isActive: true,
                },
                include: {
                  _count: { select: { products: true } },
                },
              });
              // Sort according to categorySlugs order
              categories.sort(
                (a, b) => slugs.indexOf(a.slug) - slugs.indexOf(b.slug),
              );
            } else {
              categories = await this.prisma.category.findMany({
                where: { parentId: null, isActive: true },
                take: 6,
                orderBy: { sortOrder: 'asc' },
              });
            }
            return {
              id: section.id,
              type: section.type,
              title: section.title,
              subtitle: section.subtitle,
              sortOrder: section.sortOrder,
              config,
              categories: categories.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
                description: c.description,
                imageUrl: c.imageUrl,
                productCount: c._count?.products ?? 0,
              })),
            };
          }

          case 'PRODUCT_CAROUSEL': {
            const limit = config.limit || 8;
            const where: any = { status: 'PUBLISHED' };

            if (config.tagSlug) {
              where.tags = {
                some: { tag: { slug: config.tagSlug } },
              };
            } else if (config.rule === 'featured') {
              where.isFeatured = true;
            }

            const products = await this.prisma.product.findMany({
              where,
              take: limit,
              orderBy: { createdAt: 'desc' },
              include: {
                brand: true,
                images: { orderBy: { sortOrder: 'asc' } },
                variants: {
                  where: { isActive: true },
                  include: { inventory: true },
                },
              },
            });

            return {
              id: section.id,
              type: section.type,
              title: section.title,
              subtitle: section.subtitle,
              sortOrder: section.sortOrder,
              config,
              products: products.map((p) => {
                const primaryImage =
                  p.images.find((img) => img.isPrimary) || p.images[0];
                const inStock = p.variants.some(
                  (v) =>
                    (v.inventory?.quantity ?? 0) -
                      (v.inventory?.reserved ?? 0) >
                    0,
                );

                return {
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  basePrice: Number(p.basePrice),
                  compareAtPrice: p.compareAtPrice
                    ? Number(p.compareAtPrice)
                    : null,
                  primaryImage: primaryImage
                    ? {
                        id: primaryImage.id,
                        url: primaryImage.url,
                        altText: primaryImage.altText,
                      }
                    : null,
                  inStock,
                };
              }),
            };
          }

          case 'FORCE_REGIMENT_STRIP': {
            const tagSlugs: string[] = config.tagSlugs || [];
            let tags: any[] = [];
            if (tagSlugs.length > 0) {
              tags = await this.prisma.tag.findMany({
                where: { slug: { in: tagSlugs } },
              });
              tags.sort(
                (a, b) => tagSlugs.indexOf(a.slug) - tagSlugs.indexOf(b.slug),
              );
            } else {
              tags = await this.prisma.tag.findMany({
                where: { type: 'FORCE_REGIMENT' },
                take: 12,
              });
            }

            return {
              id: section.id,
              type: section.type,
              title: section.title,
              subtitle: section.subtitle,
              sortOrder: section.sortOrder,
              config,
              tags: tags.map((t) => ({
                id: t.id,
                name: t.name,
                slug: t.slug,
                type: t.type,
              })),
            };
          }

          case 'TESTIMONIALS':
          case 'BANNER':
          default:
            return {
              id: section.id,
              type: section.type,
              title: section.title,
              subtitle: section.subtitle,
              sortOrder: section.sortOrder,
              config,
            };
        }
      }),
    );

    return {
      sections: resolvedSections,
    };
  }

  /**
   * Public: Get published static page by slug
   */
  async getPageBySlug(slug: string) {
    const page = await this.prisma.cmsPage.findUnique({
      where: { slug },
    });

    if (!page || !page.isPublished) {
      throw new NotFoundException(`Page '${slug}' not found`);
    }

    return page;
  }

  // -------------------------------------------------------------
  // Admin Operations
  // -------------------------------------------------------------

  async getAllSections(page = 'home') {
    return this.prisma.cmsSection.findMany({
      where: { page },
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createSection(dto: CreateCmsSectionDto) {
    return this.prisma.cmsSection.create({
      data: {
        page: dto.page ?? 'home',
        type: dto.type,
        title: dto.title,
        subtitle: dto.subtitle,
        config: dto.config,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async updateSection(id: string, dto: UpdateCmsSectionDto) {
    const section = await this.prisma.cmsSection.findUnique({ where: { id } });
    if (!section) {
      throw new NotFoundException(`Section with ID '${id}' not found`);
    }

    return this.prisma.cmsSection.update({
      where: { id },
      data: {
        ...(dto.title !== undefined ? { title: dto.title } : {}),
        ...(dto.subtitle !== undefined ? { subtitle: dto.subtitle } : {}),
        ...(dto.config !== undefined ? { config: dto.config } : {}),
        ...(dto.sortOrder !== undefined ? { sortOrder: dto.sortOrder } : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
    });
  }

  async deleteSection(id: string) {
    return this.prisma.cmsSection.delete({ where: { id } });
  }

  async upsertPage(slug: string, dto: UpsertCmsPageDto) {
    return this.prisma.cmsPage.upsert({
      where: { slug },
      update: {
        title: dto.title,
        bodyHtml: dto.bodyHtml,
        isPublished: dto.isPublished ?? true,
      },
      create: {
        slug,
        title: dto.title,
        bodyHtml: dto.bodyHtml,
        isPublished: dto.isPublished ?? true,
      },
    });
  }

  async getAllPages() {
    return this.prisma.cmsPage.findMany({
      orderBy: { slug: 'asc' },
    });
  }

  // Banners
  async getAllBanners() {
    return this.prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  async createBanner(dto: CreateBannerDto) {
    return this.prisma.banner.create({
      data: {
        imageUrl: dto.imageUrl,
        mobileImageUrl: dto.mobileImageUrl,
        linkUrl: dto.linkUrl,
        title: dto.title,
        sortOrder: dto.sortOrder ?? 0,
        isActive: dto.isActive ?? true,
        startsAt: dto.startsAt ? new Date(dto.startsAt) : null,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
      },
    });
  }

  async deleteBanner(id: string) {
    return this.prisma.banner.delete({ where: { id } });
  }
}
