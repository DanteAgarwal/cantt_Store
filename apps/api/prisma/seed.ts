import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Cantt Store database...\n');

  // =====================================================
  // 1. ATTRIBUTES (Size, Colour)
  // =====================================================
  const sizeAttr = await prisma.attribute.upsert({
    where: { name: 'Size' },
    update: {},
    create: { name: 'Size' },
  });

  const colourAttr = await prisma.attribute.upsert({
    where: { name: 'Colour' },
    update: {},
    create: { name: 'Colour' },
  });

  const sizeValues = await Promise.all(
    ['S', 'M', 'L', 'XL', 'XXL'].map((val) =>
      prisma.attributeValue.upsert({
        where: { attributeId_value: { attributeId: sizeAttr.id, value: val } },
        update: {},
        create: { attributeId: sizeAttr.id, value: val },
      }),
    ),
  );

  const colourValues = await Promise.all(
    ['Olive Green', 'Black', 'Khaki', 'Camouflage', 'Navy Blue'].map((val) =>
      prisma.attributeValue.upsert({
        where: { attributeId_value: { attributeId: colourAttr.id, value: val } },
        update: {},
        create: { attributeId: colourAttr.id, value: val },
      }),
    ),
  );

  console.log('✅ Attributes seeded');

  // =====================================================
  // 2. REGIMENT / FORCE TAGS
  // =====================================================
  const regimentTags = await Promise.all(
    [
      { name: 'PARA', slug: 'para' },
      { name: 'BSF', slug: 'bsf' },
      { name: 'CRPF', slug: 'crpf' },
      { name: 'Signals', slug: 'signals' },
      { name: 'EME', slug: 'eme' },
      { name: 'AMC', slug: 'amc' },
      { name: 'NCC', slug: 'ncc' },
      { name: 'CISF', slug: 'cisf' },
      { name: 'Indian Navy', slug: 'indian-navy' },
      { name: 'Indian Air Force', slug: 'iaf' },
    ].map((tag) =>
      prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: { name: tag.name, slug: tag.slug, type: 'FORCE_REGIMENT' },
      }),
    ),
  );

  const seasonTags = await Promise.all(
    [
      { name: 'Winter Collection', slug: 'winter' },
      { name: 'Summer Collection', slug: 'summer' },
      { name: 'Survival Ops Collection', slug: 'survival-ops' },
    ].map((tag) =>
      prisma.tag.upsert({
        where: { slug: tag.slug },
        update: {},
        create: { name: tag.name, slug: tag.slug, type: 'SEASON' },
      }),
    ),
  );

  console.log('✅ Tags seeded');

  // =====================================================
  // 3. CATEGORIES (2–3 level tree)
  // =====================================================

  // --- Top-level ---
  const catWinter = await prisma.category.upsert({
    where: { slug: 'army-winter-wear' },
    update: {},
    create: {
      name: 'Army Winter Wear',
      slug: 'army-winter-wear',
      sortOrder: 1,
      isActive: true,
      isFeatured: true,
      seoTitle: 'Army Winter Wear — Military Jackets, Sweaters & Thermal Wear',
    },
  });

  const catCaps = await prisma.category.upsert({
    where: { slug: 'military-caps-headwear' },
    update: {},
    create: {
      name: 'Military Caps & Headwear',
      slug: 'military-caps-headwear',
      sortOrder: 2,
      isActive: true,
      isFeatured: true,
      seoTitle: 'Military Caps & Headwear — Army Berets, Regimental Caps',
    },
  });

  const catTshirts = await prisma.category.upsert({
    where: { slug: 'military-t-shirts' },
    update: {},
    create: {
      name: 'Military T-Shirts',
      slug: 'military-t-shirts',
      sortOrder: 3,
      isActive: true,
      isFeatured: true,
    },
  });

  const catTactical = await prisma.category.upsert({
    where: { slug: 'tactical-gear' },
    update: {},
    create: {
      name: 'Tactical Gear',
      slug: 'tactical-gear',
      sortOrder: 4,
      isActive: true,
    },
  });

  const catBadges = await prisma.category.upsert({
    where: { slug: 'regimental-badges-patches' },
    update: {},
    create: {
      name: 'Regimental Badges & Patches',
      slug: 'regimental-badges-patches',
      sortOrder: 5,
      isActive: true,
      isFeatured: true,
    },
  });

  const catBags = await prisma.category.upsert({
    where: { slug: 'military-bags-backpacks' },
    update: {},
    create: {
      name: 'Military Bags & Backpacks',
      slug: 'military-bags-backpacks',
      sortOrder: 6,
      isActive: true,
    },
  });

  // --- Children of Winter Wear ---
  const catJackets = await prisma.category.upsert({
    where: { slug: 'military-tactical-jackets' },
    update: {},
    create: {
      name: 'Military & Tactical Jackets',
      slug: 'military-tactical-jackets',
      parentId: catWinter.id,
      sortOrder: 1,
      isActive: true,
    },
  });

  const catSweaters = await prisma.category.upsert({
    where: { slug: 'military-sweaters-jerseys' },
    update: {},
    create: {
      name: 'Sweaters & Jerseys',
      slug: 'military-sweaters-jerseys',
      parentId: catWinter.id,
      sortOrder: 2,
      isActive: true,
    },
  });

  const catThermal = await prisma.category.upsert({
    where: { slug: 'thermal-inner-wear' },
    update: {},
    create: {
      name: 'Thermal & Inner Wear',
      slug: 'thermal-inner-wear',
      parentId: catWinter.id,
      sortOrder: 3,
      isActive: true,
    },
  });

  // --- Children of Caps ---
  const catBeret = await prisma.category.upsert({
    where: { slug: 'army-beret-cap' },
    update: {},
    create: {
      name: 'Army Beret Cap',
      slug: 'army-beret-cap',
      parentId: catCaps.id,
      sortOrder: 1,
      isActive: true,
    },
  });

  const catRegimentalCaps = await prisma.category.upsert({
    where: { slug: 'regimental-caps' },
    update: {},
    create: {
      name: 'Regimental Caps',
      slug: 'regimental-caps',
      parentId: catCaps.id,
      sortOrder: 2,
      isActive: true,
    },
  });

  console.log('✅ Categories seeded');

  // =====================================================
  // 4. PRODUCTS
  // =====================================================

  // Helper to create a product with variants and inventory
  async function createProduct(data: {
    name: string;
    slug: string;
    shortDescription: string;
    description: string;
    basePrice: number;
    compareAtPrice?: number;
    categoryIds: string[];
    tagSlugs: string[];
    variants: Array<{ sizeVal: string; colour?: string; sku: string; stock: number }>;
  }) {
    const product = await prisma.product.upsert({
      where: { slug: data.slug },
      update: {},
      create: {
        name: data.name,
        slug: data.slug,
        shortDescription: data.shortDescription,
        description: data.description,
        basePrice: data.basePrice,
        compareAtPrice: data.compareAtPrice,
        status: 'PUBLISHED',
        isFeatured: true,
        publishedAt: new Date(),
        categories: {
          create: data.categoryIds.map((catId) => ({ categoryId: catId })),
        },
        tags: {
          create: await Promise.all(
            data.tagSlugs.map(async (slug) => {
              const tag = await prisma.tag.findUnique({ where: { slug } });
              return { tagId: tag!.id };
            }),
          ),
        },
      },
    });

    for (const v of data.variants) {
      const sizeVal = await prisma.attributeValue.findFirst({
        where: { attributeId: sizeAttr.id, value: v.sizeVal },
      });

      let colourVal = null;
      if (v.colour) {
        colourVal = await prisma.attributeValue.findFirst({
          where: { attributeId: colourAttr.id, value: v.colour },
        });
      }

      const variant = await prisma.productVariant.upsert({
        where: { sku: v.sku },
        update: {},
        create: {
          productId: product.id,
          sku: v.sku,
          isActive: true,
          attributeValues: {
            create: [
              ...(sizeVal ? [{ attributeValueId: sizeVal.id }] : []),
              ...(colourVal ? [{ attributeValueId: colourVal.id }] : []),
            ],
          },
        },
      });

      await prisma.inventory.upsert({
        where: { variantId: variant.id },
        update: { quantity: v.stock },
        create: {
          variantId: variant.id,
          quantity: v.stock,
          reserved: 0,
          lowStockAt: 5,
        },
      });
    }

    return product;
  }

  await createProduct({
    name: 'Army Combat T-Shirt — Olive Green',
    slug: 'army-combat-t-shirt-olive-green',
    shortDescription: 'Military-grade cotton combat t-shirt in classic olive green.',
    description:
      'Made from 100% pre-shrunk cotton with reinforced stitching. Ideal for field wear, trekking, and everyday use. Features a crew neck and semi-fitted cut for comfort and mobility.',
    basePrice: 649,
    compareAtPrice: 899,
    categoryIds: [catTshirts.id],
    tagSlugs: ['para', 'survival-ops'],
    variants: [
      { sizeVal: 'S', colour: 'Olive Green', sku: 'CS-TCTS-OG-S', stock: 25 },
      { sizeVal: 'M', colour: 'Olive Green', sku: 'CS-TCTS-OG-M', stock: 40 },
      { sizeVal: 'L', colour: 'Olive Green', sku: 'CS-TCTS-OG-L', stock: 35 },
      { sizeVal: 'XL', colour: 'Olive Green', sku: 'CS-TCTS-OG-XL', stock: 20 },
      { sizeVal: 'XXL', colour: 'Olive Green', sku: 'CS-TCTS-OG-XXL', stock: 10 },
      { sizeVal: 'M', colour: 'Black', sku: 'CS-TCTS-BK-M', stock: 30 },
      { sizeVal: 'L', colour: 'Black', sku: 'CS-TCTS-BK-L', stock: 25 },
    ],
  });

  await createProduct({
    name: 'PARA Regiment Beret Cap',
    slug: 'para-regiment-beret-cap',
    shortDescription: 'Authentic-style PARA regiment beret with badge holder.',
    description:
      'High-quality wool-blend beret in traditional maroon colour with a metal badge holder ring. Adjustable inner band for comfortable fit. Inspired by the iconic headgear of the Indian Parachute Regiment.',
    basePrice: 449,
    compareAtPrice: 599,
    categoryIds: [catBeret.id, catCaps.id],
    tagSlugs: ['para'],
    variants: [
      { sizeVal: 'S', sku: 'CS-BERET-PARA-S', stock: 15 },
      { sizeVal: 'M', sku: 'CS-BERET-PARA-M', stock: 30 },
      { sizeVal: 'L', sku: 'CS-BERET-PARA-L', stock: 20 },
      { sizeVal: 'XL', sku: 'CS-BERET-PARA-XL', stock: 10 },
    ],
  });

  await createProduct({
    name: 'Military Tactical Winter Jacket — Camouflage',
    slug: 'military-tactical-winter-jacket-camouflage',
    shortDescription: 'Heavy-duty tactical jacket with multi-pocket design and warm lining.',
    description:
      'Built for extreme conditions. Features a fleece inner lining, wind-resistant outer shell, multiple cargo pockets, and adjustable hood. Available in camouflage pattern. Ideal for outdoor operations, trekking, and winter patrol.',
    basePrice: 2499,
    compareAtPrice: 3499,
    categoryIds: [catJackets.id, catWinter.id],
    tagSlugs: ['winter', 'survival-ops'],
    variants: [
      { sizeVal: 'S', colour: 'Camouflage', sku: 'CS-JACKET-CAMO-S', stock: 8 },
      { sizeVal: 'M', colour: 'Camouflage', sku: 'CS-JACKET-CAMO-M', stock: 15 },
      { sizeVal: 'L', colour: 'Camouflage', sku: 'CS-JACKET-CAMO-L', stock: 12 },
      { sizeVal: 'XL', colour: 'Camouflage', sku: 'CS-JACKET-CAMO-XL', stock: 8 },
      { sizeVal: 'XXL', colour: 'Camouflage', sku: 'CS-JACKET-CAMO-XXL', stock: 4 },
      { sizeVal: 'M', colour: 'Olive Green', sku: 'CS-JACKET-OG-M', stock: 10 },
      { sizeVal: 'L', colour: 'Olive Green', sku: 'CS-JACKET-OG-L', stock: 10 },
    ],
  });

  await createProduct({
    name: 'BSF Cap — Official Style',
    slug: 'bsf-cap-official-style',
    shortDescription: 'BSF-inspired service cap with embroidered crest.',
    description:
      'Poly-wool blend fabric with structured peak and adjustable inner band. Features a hand-embroidered BSF-inspired crest on the front. Perfect for collectors and enthusiasts.',
    basePrice: 349,
    compareAtPrice: 499,
    categoryIds: [catRegimentalCaps.id, catCaps.id],
    tagSlugs: ['bsf'],
    variants: [
      { sizeVal: 'S', sku: 'CS-CAP-BSF-S', stock: 10 },
      { sizeVal: 'M', sku: 'CS-CAP-BSF-M', stock: 25 },
      { sizeVal: 'L', sku: 'CS-CAP-BSF-L', stock: 20 },
      { sizeVal: 'XL', sku: 'CS-CAP-BSF-XL', stock: 8 },
    ],
  });

  await createProduct({
    name: 'Indian Army Thermal Inner Wear Set',
    slug: 'indian-army-thermal-inner-wear-set',
    shortDescription: 'Military-grade thermal set (top + bottom) for extreme cold conditions.',
    description:
      'High-performance thermal underwear set designed for sub-zero temperatures. Moisture-wicking, anti-odour fabric. Used extensively in high-altitude and extreme cold weather operations. Comes as a top + bottom set.',
    basePrice: 1299,
    compareAtPrice: 1799,
    categoryIds: [catThermal.id, catWinter.id],
    tagSlugs: ['winter'],
    variants: [
      { sizeVal: 'S', sku: 'CS-THERMAL-S', stock: 20 },
      { sizeVal: 'M', sku: 'CS-THERMAL-M', stock: 35 },
      { sizeVal: 'L', sku: 'CS-THERMAL-L', stock: 30 },
      { sizeVal: 'XL', sku: 'CS-THERMAL-XL', stock: 15 },
      { sizeVal: 'XXL', sku: 'CS-THERMAL-XXL', stock: 0 }, // out of stock example
    ],
  });

  console.log('✅ Products & variants seeded');

  // =====================================================
  // 5. CMS — Homepage sections
  // =====================================================

  await prisma.cmsSection.deleteMany({ where: { page: 'home' } });

  await prisma.cmsSection.createMany({
    data: [
      {
        page: 'home',
        type: 'HERO_CAROUSEL',
        title: 'Hero Banner',
        config: {
          slides: [
            {
              title: 'Gear Up. Stand Proud.',
              subtitle: 'Premium military & tactical merchandise for the brave.',
              imageUrl: '/placeholder-hero-1.jpg',
              linkUrl: '/shop',
              linkText: 'Shop Now',
            },
            {
              title: 'Winter Collection 2025',
              subtitle: 'Tactical jackets, thermal wear & sweaters — built for the cold.',
              imageUrl: '/placeholder-hero-2.jpg',
              linkUrl: '/category/army-winter-wear',
              linkText: 'Explore Collection',
            },
          ],
        },
        sortOrder: 1,
        isActive: true,
      },
      {
        page: 'home',
        type: 'CATEGORY_GRID',
        title: 'Shop by Category',
        config: {
          categorySlugs: [
            'military-t-shirts',
            'military-caps-headwear',
            'army-winter-wear',
            'tactical-gear',
            'regimental-badges-patches',
            'military-bags-backpacks',
          ],
        },
        sortOrder: 2,
        isActive: true,
      },
      {
        page: 'home',
        type: 'PRODUCT_CAROUSEL',
        title: 'New Arrivals',
        subtitle: 'Fresh additions to our collection',
        config: { rule: 'newest', limit: 8 },
        sortOrder: 3,
        isActive: true,
      },
      {
        page: 'home',
        type: 'PRODUCT_CAROUSEL',
        title: 'Winter Collection',
        subtitle: 'Gear up for the cold season',
        config: { tagSlug: 'winter', limit: 8 },
        sortOrder: 4,
        isActive: true,
      },
      {
        page: 'home',
        type: 'FORCE_REGIMENT_STRIP',
        title: 'Shop by Force & Regiment',
        config: {
          tagSlugs: ['para', 'bsf', 'crpf', 'signals', 'eme', 'amc', 'ncc', 'iaf', 'indian-navy'],
        },
        sortOrder: 5,
        isActive: true,
      },
      {
        page: 'home',
        type: 'PRODUCT_CAROUSEL',
        title: 'Survival Ops Collection',
        subtitle: 'Tactical gear for field operations',
        config: { tagSlug: 'survival-ops', limit: 6 },
        sortOrder: 6,
        isActive: true,
      },
      {
        page: 'home',
        type: 'TESTIMONIALS',
        title: 'What Our Customers Say',
        config: {
          source: 'manual',
          items: [
            {
              name: 'Subedar Major R. Singh (Retd.)',
              text: 'Excellent quality merchandise. The regimental cap is exactly what I was looking for.',
              rating: 5,
            },
            {
              name: 'Capt. A. Sharma (Retd.)',
              text: 'Fast delivery and authentic designs. Will recommend to fellow veterans.',
              rating: 5,
            },
          ],
        },
        sortOrder: 7,
        isActive: true,
      },
    ],
  });

  console.log('✅ CMS homepage sections seeded');

  // =====================================================
  // 6. CMS — Static / Legal Pages
  // =====================================================

  const legalPages = [
    {
      slug: 'about-us',
      title: 'About Us',
      bodyHtml:
        '<h1>About Cantt Store</h1><p>We are a dedicated military merchandise store serving defence personnel, veterans, and enthusiasts across India. [Client to provide content]</p>',
    },
    {
      slug: 'contact-us',
      title: 'Contact Us',
      bodyHtml:
        '<h1>Contact Us</h1><p>WhatsApp/Phone: [Client to provide]<br/>Email: [Client to provide]<br/>Address: [Client to provide]</p>',
    },
    {
      slug: 'terms-conditions',
      title: 'Terms & Conditions',
      bodyHtml: '<h1>Terms & Conditions</h1><p>[Client/Legal to provide content]</p>',
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      bodyHtml: '<h1>Privacy Policy</h1><p>[Client/Legal to provide content]</p>',
    },
    {
      slug: 'shipping-policy',
      title: 'Shipping & Delivery Policy',
      bodyHtml:
        '<h1>Shipping & Delivery Policy</h1><p>Delivery estimates by zone: [Client to provide zones and timelines]</p>',
    },
    {
      slug: 'refund-policy',
      title: 'Refund & Cancellation Policy',
      bodyHtml: '<h1>Refund & Cancellation Policy</h1><p>[Client to provide content]</p>',
    },
    {
      slug: 'military-goods-usage-policy',
      title: 'Purchase & Usage Guidelines for Military-Styled Goods',
      bodyHtml:
        '<h1>Purchase & Usage Guidelines</h1><p>The items sold on this store are inspired replica/commemorative merchandise and are NOT official government-issued items. [Client/Legal to complete this policy — required before go-live per SRS NFR-8]</p>',
    },
  ];

  for (const page of legalPages) {
    await prisma.cmsPage.upsert({
      where: { slug: page.slug },
      update: { title: page.title, bodyHtml: page.bodyHtml },
      create: page,
    });
  }

  console.log('✅ CMS static/legal pages seeded');

  console.log('\n✨ Seeding complete! Summary:');
  console.log(`   - ${await prisma.attribute.count()} attributes`);
  console.log(`   - ${await prisma.tag.count()} tags`);
  console.log(`   - ${await prisma.category.count()} categories`);
  console.log(`   - ${await prisma.product.count()} products`);
  console.log(`   - ${await prisma.productVariant.count()} variants`);
  console.log(`   - ${await prisma.cmsSection.count()} CMS sections`);
  console.log(`   - ${await prisma.cmsPage.count()} CMS pages\n`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
