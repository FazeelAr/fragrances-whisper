"use server";

import { db } from "@/src/lib/db";
import { createUserSchema, type CreateUserInput } from "./schema";
import { requireAdmin } from "./guards";
import bcrypt from "bcryptjs";

/**
 * Creates a new user account.
 * SECURITY: Accessible ONLY by authenticated administrators.
 */
export async function createAdminUser(data: CreateUserInput) {
  // Enforce admin permission
  await requireAdmin();

  const parsed = createUserSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { email, password, name, phone, role } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "An account with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const user = await db.user.create({
      data: {
        email,
        name,
        phone,
        passwordHash,
        role: role || "ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return { success: true, data: user };
  } catch (e) {
    console.error("createAdminUser error:", e);
    return { success: false, error: "Failed to create user. Please try again." };
  }
}
