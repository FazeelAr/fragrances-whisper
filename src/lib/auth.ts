import NextAuth from "next-auth";
import { authConfig } from "@/src/features/auth/config";

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
