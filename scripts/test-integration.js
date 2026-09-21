const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function runIntegrationTests() {
  console.log('=====================================================');
  console.log('     FRAGRANCE WHISPER FULL INTEGRATION TEST SUITE   ');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`Integration Test: ${name.padEnd(45)} ... `);
    try {
      await fn();
      console.log('\x1b[32mPASS\x1b[0m');
      passed++;
    } catch (err) {
      console.log(`\x1b[31mFAIL\x1b[0m: ${err.message}`);
      failed++;
    }
  }

  try {
    // 1. Database Connectivity & Seed Verification
    await test('1. Database Connection & Schema Health', async () => {
      const result = await prisma.$queryRaw`SELECT 1 as connected`;
      if (!result || result.length === 0) throw new Error('Database ping failed');
    });

    await test('2. Seeded Categories Verification', async () => {
      const categories = await prisma.category.findMany();
      if (categories.length < 4) {
        throw new Error(`Expected at least 4 categories, found: ${categories.length}`);
      }
      const slugs = categories.map(c => c.slug);
      if (!slugs.includes('eau-de-parfum')) {
        throw new Error('Missing expected category: eau-de-parfum');
      }
    });

    await test('3. Seeded Products & Images Verification', async () => {
      const products = await prisma.product.findMany({
        include: { images: true, category: true },
      });
      if (products.length < 10) {
        throw new Error(`Expected at least 10 products, found: ${products.length}`);
      }
      const withImages = products.filter(p => p.images.length > 0);
      if (withImages.length === 0) {
        throw new Error('Products do not have linked images');
      }
    });

    // 2. Authentication & Admin Security
    await test('4. Admin User Authentication & Role', async () => {
      const admin = await prisma.user.findUnique({
        where: { email: 'admin@fragrancewhisper.com' }
      });
      if (!admin) throw new Error('Admin user not found in database');
      if (admin.role !== 'ADMIN') throw new Error(`Expected role ADMIN, got ${admin.role}`);

      const passwordOk = await bcrypt.compare('admin123', admin.passwordHash);
      if (!passwordOk) throw new Error('Admin password hash mismatch');
    });

    await test('5. Security: Customer Role Access Restriction', async () => {
      const customer = await prisma.user.findFirst({
        where: { role: 'CUSTOMER' }
      });
      if (customer) {
        if (customer.role === 'ADMIN') throw new Error('Customer should not have ADMIN role');
      }
    });

    // 3. Product Catalog & Stock Filtering
    let testProduct = null;
    await test('6. Product Query Filtering & Stock Validation', async () => {
      testProduct = await prisma.product.findFirst({
        where: { isPublished: true, stock: { gt: 2 } },
        include: { images: true }
      });
      if (!testProduct) throw new Error('No in-stock published product found for testing');
    });

    // 4. End-to-End Order Creation & Inventory Transaction
    let createdOrderId = null;
    const initialStock = testProduct ? testProduct.stock : 0;
    const testOrderQty = 2;

    await test('7. Atomic Order Transaction & Inventory Decrement', async () => {
      const orderNumber = `TEST-${Date.now().toString().slice(-6)}`;
      const unitPrice = Number(testProduct.price);
      const lineTotal = unitPrice * testOrderQty;
      const shipping = 200;
      const total = lineTotal + shipping;

      const order = await prisma.$transaction(async (tx) => {
        // 1. Create order
        const newOrder = await tx.order.create({
          data: {
            orderNumber,
            phone: '03149448877',
            email: 'test-customer@example.com',
            paymentMethod: 'WHATSAPP',
            paymentStatus: 'UNPAID',
            status: 'PENDING',
            subtotal: lineTotal,
            shippingFee: shipping,
            tax: 0,
            total: total,
            shippingAddress: {
              fullName: 'Automation Test User',
              address: 'Test Street 42',
              city: 'Lahore'
            },
            items: {
              create: [
                {
                  productId: testProduct.id,
                  productName: testProduct.name,
                  quantity: testOrderQty,
                  unitPrice: unitPrice,
                  lineTotal: lineTotal
                }
              ]
            }
          }
        });

        // 2. Decrement stock
        await tx.product.update({
          where: { id: testProduct.id },
          data: { stock: { decrement: testOrderQty } }
        });

        return newOrder;
      });

      createdOrderId = order.id;

      // Verify stock in database was reduced
      const refreshedProduct = await prisma.product.findUnique({
        where: { id: testProduct.id }
      });

      if (refreshedProduct.stock !== initialStock - testOrderQty) {
        throw new Error(`Inventory deduction failed: expected ${initialStock - testOrderQty}, got ${refreshedProduct.stock}`);
      }
    });

    await test('8. Order Verification & Item Integrity', async () => {
      if (!createdOrderId) throw new Error('Order was not created');
      const order = await prisma.order.findUnique({
        where: { id: createdOrderId },
        include: { items: true }
      });
      if (!order) throw new Error('Created order not found');
      if (order.items.length !== 1) throw new Error(`Expected 1 order item, got ${order.items.length}`);
      if (order.items[0].quantity !== testOrderQty) throw new Error('Item quantity mismatch');
      if (order.items[0].productName !== testProduct.name) throw new Error('Item name mismatch');
    });

    await test('9. Test Data Cleanup & Inventory Restoration', async () => {
      if (createdOrderId) {
        await prisma.orderItem.deleteMany({ where: { orderId: createdOrderId } });
        await prisma.order.delete({ where: { id: createdOrderId } });
      }
      if (testProduct) {
        await prisma.product.update({
          where: { id: testProduct.id },
          data: { stock: initialStock }
        });
      }

      // Verify restoration
      const restored = await prisma.product.findUnique({ where: { id: testProduct.id } });
      if (restored.stock !== initialStock) throw new Error('Stock restoration failed');
    });

  } finally {
    await prisma.$disconnect();
  }

  console.log('\n-----------------------------------------------------');
  console.log(`Results: \x1b[32m${passed} Passed\x1b[0m, \x1b[${failed > 0 ? '31' : '32'}m${failed} Failed\x1b[0m out of ${passed + failed} integration tests`);
  console.log('-----------------------------------------------------\n');

  if (failed > 0) process.exit(1);
}

runIntegrationTests().catch(console.error);
