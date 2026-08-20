"use server";

import { db } from "@/src/lib/db";
import { registerSchema, type RegisterInput } from "./schema";
import bcrypt from "bcryptjs";

export async function registerCustomer(data: RegisterInput) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { email, password, name, phone } = parsed.data;

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
        role: "CUSTOMER",
      },
    });

    return { success: true, data: { id: user.id, email: user.email, name: user.name } };
  } catch (e) {
    console.error("registerCustomer error:", e);
    return { success: false, error: "Failed to create account. Please try again." };
  }
}
