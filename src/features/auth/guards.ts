import { auth } from "@/src/lib/auth";
import { redirect } from "next/navigation";

export async function requireAdmin() {
  const session = await auth();
  if (!session || !session.user || session.user.role !== "ADMIN") {
    redirect("/login?next=/admin");
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
