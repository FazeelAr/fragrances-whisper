import { db } from "../src/lib/db";
import { Prisma } from "@prisma/client";

async function runTests() {
  console.log("-----------------------------------------");
  console.log("   Running Fragrance Whisper Integration Tests");
  console.log("-----------------------------------------");

  try {
    // 1. Verify Seed Data (Users, Categories, Products)
    console.log("\n[Test 1] Verifying Seed Data...");
    const usersCount = await db.user.count();
    const categoriesCount = await db.category.count();
    const productsCount = await db.product.count();

    console.log(`- Users: ${usersCount}`);
    console.log(`- Categories: ${categoriesCount}`);
    console.log(`- Products: ${productsCount}`);

    if (usersCount < 2 || categoriesCount < 4 || productsCount < 12) {
      throw new Error("Missing seed data! Please run `npx prisma db seed` first.");
    }
    console.log("✓ Seed Data Verification Passed.");

    // 2. Add Item to Cart (Simulating add to cart)
    console.log("\n[Test 2] Creating a temporary guest cart...");
    const guestSessionToken = "test-guest-session-123456";
    
    // Cleanup any existing test carts
    await db.cart.deleteMany({
      where: { sessionToken: guestSessionToken }
    });

    const cart = await db.cart.create({
      data: { sessionToken: guestSessionToken }
    });
    console.log(`- Cart created with ID: ${cart.id}`);

    const product = await db.product.findFirst({
      where: { isPublished: true }
    });

    if (!product) {
      throw new Error("No published product found to test cart adding.");
    }

    const cartItem = await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId: product.id,
        quantity: 2,
        priceAtAdd: product.price,
      }
    });
    console.log(`- Added product "${product.name}" to cart (Qty: 2, Price: ${product.price} PKR)`);
    console.log("✓ Cart Addition Passed.");

    // 3. Checkout Simulation (COD)
    console.log("\n[Test 3] Simulating Checkout (COD)...");
    const stockBefore = product.stock;

    // Check stock availability
    if (stockBefore < 2) {
      throw new Error("Test product does not have enough stock to complete the test.");
    }

    const orderNumber = `FW-TST-${Date.now().toString().slice(-6)}`;
    
    // Create order from cart
    const order = await db.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          phone: "03001234567",
          email: "guest@example.com",
          paymentMethod: "COD",
          paymentStatus: "UNPAID",
          status: "PENDING",
          subtotal: Prisma.Decimal.mul(product.price, 2),
          shippingFee: new Prisma.Decimal(200),
          tax: new Prisma.Decimal(0),
          total: Prisma.Decimal.add(Prisma.Decimal.mul(product.price, 2), 200),
          shippingAddress: {
            fullName: "Test Guest User",
            address: "House 123, Street 4, Sector G-11",
            city: "Islamabad",
          },
          items: {
            create: [
              {
                productId: product.id,
                productName: product.name,
                unitPrice: product.price,
                quantity: 2,
                lineTotal: Prisma.Decimal.mul(product.price, 2),
              }
            ]
          }
        }
      });

      // Decrement stock immediately for COD
      await tx.product.update({
        where: { id: product.id },
        data: { stock: { decrement: 2 } }
      });

      // Clear the Cart Items
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return newOrder;
    });

    console.log(`- Order placed successfully with number: ${order.orderNumber}`);
    
    // Verify stock was decremented
    const updatedProduct = await db.product.findUnique({
      where: { id: product.id }
    });
    console.log(`- Product stock before: ${stockBefore}, after checkout: ${updatedProduct?.stock}`);
    
    if (updatedProduct && updatedProduct.stock !== stockBefore - 2) {
      throw new Error(`Stock decrement failed! Expected ${stockBefore - 2}, but got ${updatedProduct.stock}`);
    }
    console.log("✓ Checkout and Stock Decrement Verification Passed.");

    // Cleanup test data
    console.log("\n[Test 4] Cleaning up test order and cart...");
    await db.orderItem.deleteMany({ where: { orderId: order.id } });
    await db.order.delete({ where: { id: order.id } });
    await db.cart.delete({ where: { id: cart.id } });
    
    // Restore stock
    await db.product.update({
      where: { id: product.id },
      data: { stock: stockBefore }
    });
    
    console.log("✓ Cleanup Complete.");
    console.log("\n-----------------------------------------");
    console.log("   ALL INTEGRATION TESTS PASSED SUCCESSFULLY!");
    console.log("-----------------------------------------");
  } catch (error) {
    console.error("\n❌ TEST FAILURE:", error);
    process.exit(1);
  }
}

runTests();
