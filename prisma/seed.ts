import { PrismaClient, Gender } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const customerPasswordHash = await bcrypt.hash('customer123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@fragrancewhisper.com' },
    update: {},
    create: {
      email: 'admin@fragrancewhisper.com',
      name: 'Fragrance Whisper Admin',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      phone: '+923001234567',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'customer@fragrancewhisper.com' },
    update: {},
    create: {
      email: 'customer@fragrancewhisper.com',
      name: 'John Doe',
      passwordHash: customerPasswordHash,
      role: 'CUSTOMER',
      phone: '+923129876543',
    },
  });

  console.log('Users created:');
  console.log(`- Admin: ${admin.email}`);
  console.log(`- Customer: ${customer.email}`);

  // Create Categories
  const categoriesData = [
    { name: 'Eau de Parfum', slug: 'eau-de-parfum', description: 'Long-lasting fragrances with high concentration of perfume oils.' },
    { name: 'Eau de Toilette', slug: 'eau-de-toilette', description: 'Fresh, light, and perfect for everyday wear.' },
    { name: 'Attar', slug: 'attar', description: 'Traditional non-alcoholic concentrated perfume oils.' },
    { name: 'Gift Sets', slug: 'gift-sets', description: 'Exquisite curated fragrance bundles for special occasions.' },
  ];

  const categories = [];
  for (const cat of categoriesData) {
    const createdCat = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
    categories.push(createdCat);
  }

  console.log(`Categories created: ${categories.length}`);

  // Find category IDs
  const edpId = categories.find((c) => c.slug === 'eau-de-parfum')?.id!;
  const edtId = categories.find((c) => c.slug === 'eau-de-toilette')?.id!;
  const attarId = categories.find((c) => c.slug === 'attar')?.id!;
  const giftSetId = categories.find((c) => c.slug === 'gift-sets')?.id!;

  // Create Products
  const productsData = [
    {
      name: 'Imperial Oud Eau de Parfum',
      slug: 'imperial-oud-eau-de-parfum',
      description: 'A rich, woody fragrance featuring precious Cambodian oud, combined with warm amber, sweet vanilla, and rich spices. A truly majestic scent for special evenings.',
      brand: 'Fragrance Whisper',
      price: 9500.00,
      compareAtPrice: 12000.00,
      sku: 'FW-EDP-OUD-001',
      stock: 15,
      fragranceNotes: {
        top: 'Bergamot, Pink Pepper',
        middle: 'Cambodian Oud, Rose, Patchouli',
        base: 'Amber, Vanilla, Sandalwood'
      },
      volumeMl: 100,
      gender: 'UNISEX',
      isPublished: true,
      isFeatured: true,
      categoryId: edpId,
      images: [
        { url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600', isPrimary: true, altText: 'Imperial Oud EDP Bottle' }
      ]
    },
    {
      name: 'Sandalwood Musk Attar',
      slug: 'sandalwood-musk-attar',
      description: 'An alcohol-free concentrated perfume oil featuring smooth, creamy Mysore Sandalwood blended with pure white musk and subtle floral undertones.',
      brand: 'Fragrance Whisper',
      price: 3200.00,
      sku: 'FW-ATR-SND-002',
      stock: 25,
      fragranceNotes: {
        top: 'White Musk, Floral Accord',
        middle: 'Mysore Sandalwood, Orris Root',
        base: 'Amber, Cedarwood'
      },
      volumeMl: 12,
      gender: 'UNISEX',
      isPublished: true,
      isFeatured: true,
      categoryId: attarId,
      images: [
        { url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600', isPrimary: true, altText: 'Sandalwood Musk Attar Bottle' }
      ]
    },
    {
      name: 'Ocean Breeze Eau de Toilette',
      slug: 'ocean-breeze-eau-de-toilette',
      description: 'A crisp, energetic, and marine-inspired fragrance that evokes the feel of fresh sea spray. Perfect for hot summer days in Pakistan.',
      brand: 'Fragrance Whisper',
      price: 4800.00,
      compareAtPrice: 5500.00,
      sku: 'FW-EDT-OCN-003',
      stock: 40,
      fragranceNotes: {
        top: 'Grapefruit, Sea Water, Mint',
        middle: 'Geranium, Jasmine',
        base: 'White Musk, Oakmoss, Vetiver'
      },
      volumeMl: 100,
      gender: 'MALE',
      isPublished: true,
      isFeatured: false,
      categoryId: edtId,
      images: [
        { url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600', isPrimary: true, altText: 'Ocean Breeze EDT Bottle' }
      ]
    },
    {
      name: 'Midnight Rose Eau de Parfum',
      slug: 'midnight-rose-eau-de-parfum',
      description: 'A seductive and mysterious blend of dark damask rose, sweet raspberry, sharp blackcurrant, and soft peony, resting on a base of warm vanilla and cedar.',
      brand: 'Fragrance Whisper',
      price: 7800.00,
      sku: 'FW-EDP-ROS-004',
      stock: 8,
      fragranceNotes: {
        top: 'Raspberry, Blackcurrant',
        middle: 'Damask Rose, Jasmine, Peony',
        base: 'Vanilla, Musk, Virginia Cedar'
      },
      volumeMl: 50,
      gender: 'FEMALE',
      isPublished: true,
      isFeatured: true,
      categoryId: edpId,
      images: [
        { url: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&q=80&w=600', isPrimary: true, altText: 'Midnight Rose EDP Bottle' }
      ]
    },
    {
      name: 'Jasmine Bloom Attar',
      slug: 'jasmine-bloom-attar',
      description: 'Capture the essence of fresh, handpicked jasmine flowers (Chambeli) blooming in the night. Rich, sweet floral oil crafted with traditional steam distillation.',
      brand: 'Fragrance Whisper',
      price: 2800.00,
      sku: 'FW-ATR-JAS-005',
      stock: 30,
      fragranceNotes: {
        top: 'Chambeli (Jasmine), Orange Blossom',
        middle: 'Ylang-Ylang, Rose',
        base: 'Soft Amber'
      },
      volumeMl: 12,
      gender: 'FEMALE',
      isPublished: true,
      isFeatured: false,
      categoryId: attarId,
      images: [
        { url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600', isPrimary: true, altText: 'Jasmine Bloom Attar Bottle' }
      ]
    },
    {
      name: 'Classic Luxury Duo Gift Set',
      slug: 'classic-luxury-duo-gift-set',
      description: 'A beautifully packaged gift box containing a 50ml Midnight Rose EDP and a 12ml Sandalwood Musk Attar. The ultimate gifting option for your loved ones.',
      brand: 'Fragrance Whisper',
      price: 11000.00,
      compareAtPrice: 12500.00,
      sku: 'FW-GFT-CLS-006',
      stock: 12,
      fragranceNotes: {
        top: 'Mixed Floral & Citrus',
        middle: 'Sandalwood, Rose, Jasmine',
        base: 'Amber, Musk, Vanilla'
      },
      volumeMl: 62,
      gender: 'UNISEX',
      isPublished: true,
      isFeatured: true,
      categoryId: giftSetId,
      images: [
        { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600', isPrimary: true, altText: 'Classic Luxury Duo Gift Set' }
      ]
    },
    {
      name: 'Citrus Zest Eau de Toilette',
      slug: 'citrus-zest-eau-de-toilette',
      description: 'A revitalizing blast of citrus notes including Sicilian lemon, bergamot, and sweet orange. A bright, fresh option for daytime activity.',
      brand: 'Fragrance Whisper',
      price: 4200.00,
      sku: 'FW-EDT-CTR-007',
      stock: 50,
      fragranceNotes: {
        top: 'Sicilian Lemon, Bergamot, Grapefruit',
        middle: 'Mint, Sage, Rosemary',
        base: 'Cedarwood, Vetiver, Musk'
      },
      volumeMl: 100,
      gender: 'MALE',
      isPublished: true,
      isFeatured: false,
      categoryId: edtId,
      images: [
        { url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600', isPrimary: true, altText: 'Citrus Zest EDT Bottle' }
      ]
    },
    {
      name: 'Unpublished Amber Gold EDP',
      slug: 'unpublished-amber-gold-edp',
      description: 'Draft fragrance featuring premium white amber and golden honey accords. Currently unpublished.',
      brand: 'Fragrance Whisper',
      price: 8900.00,
      sku: 'FW-EDP-AMB-008',
      stock: 5,
      fragranceNotes: {
        top: 'Golden Honey, Sweet Peach',
        middle: 'White Amber, Patchouli, Orchid',
        base: 'Labdanum, Vanilla, Musk'
      },
      volumeMl: 100,
      gender: 'UNISEX',
      isPublished: false,
      isFeatured: false,
      categoryId: edpId,
      images: [
        { url: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&q=80&w=600', isPrimary: true, altText: 'Amber Gold EDP Bottle' }
      ]
    },
    {
      name: 'Velvet Vanilla Eau de Parfum',
      slug: 'velvet-vanilla-eau-de-parfum',
      description: 'A comforting, warm gourmand scent highlighting Madagascar vanilla pod, toasted almond, and sweet cream, finished with soft white musk.',
      brand: 'Fragrance Whisper',
      price: 6900.00,
      sku: 'FW-EDP-VAN-009',
      stock: 18,
      fragranceNotes: {
        top: 'Toasted Almond, Coconut Milk',
        middle: 'Madagascar Vanilla Pod, Caramel',
        base: 'White Musk, Benzoin'
      },
      volumeMl: 50,
      gender: 'FEMALE',
      isPublished: true,
      isFeatured: false,
      categoryId: edpId,
      images: [
        { url: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&q=80&w=600', isPrimary: true, altText: 'Velvet Vanilla Bottle' }
      ]
    },
    {
      name: 'Imperial Dehnal Oud Attar',
      slug: 'imperial-dehnal-oud-attar',
      description: 'Ultra-luxurious, pure concentrated Indian Dehn-al-Oud. Extremely strong projection and animalic/woody profile that lasts for days.',
      brand: 'Fragrance Whisper',
      price: 18500.00,
      sku: 'FW-ATR-OUD-010',
      stock: 3,
      fragranceNotes: {
        top: 'Spicy Accord, Leathery Notes',
        middle: 'Indian Oud, Guaiac Wood',
        base: 'Patchouli, Vetiver, Sandalwood'
      },
      volumeMl: 6,
      gender: 'MALE',
      isPublished: true,
      isFeatured: true,
      categoryId: attarId,
      images: [
        { url: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&q=80&w=600', isPrimary: true, altText: 'Imperial Dehnal Oud Attar Bottle' }
      ]
    },
    {
      name: 'Premium Discovery Gift Box',
      slug: 'premium-discovery-gift-box',
      description: 'An elegant presentation containing four 3ml travel-sized attars (Sandalwood, Jasmine, Oud, and Amber Musk). Discover your signature scent.',
      brand: 'Fragrance Whisper',
      price: 4500.00,
      compareAtPrice: 5000.00,
      sku: 'FW-GFT-DIS-011',
      stock: 30,
      fragranceNotes: {
        top: 'Assorted Notes',
        middle: 'Assorted Notes',
        base: 'Assorted Notes'
      },
      volumeMl: 12,
      gender: 'UNISEX',
      isPublished: true,
      isFeatured: false,
      categoryId: giftSetId,
      images: [
        { url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=600', isPrimary: true, altText: 'Discovery Gift Box' }
      ]
    },
    {
      name: 'Spicy Vetiver Eau de Parfum',
      slug: 'spicy-vetiver-eau-de-parfum',
      description: 'A modern, earthy fragrance highlighting fresh Haitian vetiver, paired with black pepper, fresh grapefruit, and deep patchouli.',
      brand: 'Fragrance Whisper',
      price: 8200.00,
      sku: 'FW-EDP-VTV-012',
      stock: 14,
      fragranceNotes: {
        top: 'Grapefruit, Orange',
        middle: 'Black Pepper, Flint, Geranium',
        base: 'Haitian Vetiver, Cedar, Patchouli, Benzoin'
      },
      volumeMl: 100,
      gender: 'MALE',
      isPublished: true,
      isFeatured: false,
      categoryId: edpId,
      images: [
        { url: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&q=80&w=600', isPrimary: true, altText: 'Spicy Vetiver EDP Bottle' }
      ]
    }
  ];

  for (const prod of productsData) {
    const { images, ...productFields } = prod;
    
    const createdProduct = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {},
      create: {
        ...productFields,
        gender: productFields.gender as Gender,
      },
    });

    for (const img of images) {
      await prisma.productImage.create({
        data: {
          productId: createdProduct.id,
          url: img.url,
          isPrimary: img.isPrimary,
          altText: img.altText,
        }
      });
    }
  }

  console.log(`Products seeded!`);
  console.log('Seeding completed successfully.');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
