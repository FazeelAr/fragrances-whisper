import { auth } from "@/src/lib/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized: Admin access required");
  }
  return session.user;
}

export async function requireCustomer() {
  const session = await auth();
  if (!session || !session.user) {
    throw new Error("Unauthorized: Authentication required");
  }
  return session.user;
}
