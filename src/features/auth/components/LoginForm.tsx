"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import { STORE_NAME } from "@/src/lib/constants";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const email = fd.get("email") as string;
    const password = fd.get("password") as string;

    startTransition(async () => {
      try {
        const res = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (res?.error) {
          setError("Invalid email or password. Please try again.");
        } else {
          // Fetch session to check role for admin redirect
          const sessionRes = await fetch("/api/auth/session");
          const session = await sessionRes.json();
          if (session?.user?.role === "ADMIN") {
            router.push("/admin");
          } else {
            router.push(next);
          }
          router.refresh();
        }
      } catch (err) {
        console.error("Sign-in error:", err);
        setError("Something went wrong. Please try again later.");
      }
    });
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 border border-stone-100 rounded-xl shadow-sm">
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-serif text-stone-900 tracking-tight">Sign in to your account</h2>
        <p className="mt-2 text-sm text-stone-500 font-sans">
          Welcome back to {STORE_NAME}
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none"
            placeholder="name@example.com"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider" htmlFor="password">
              Password
            </label>
          </div>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition-colors disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>

      <div className="text-center text-sm text-stone-500">
        Don&apos;t have an account?{" "}
        <Link href={`/register?next=${encodeURIComponent(next)}`} className="text-amber-700 hover:underline font-medium">
          Create one now
        </Link>
      </div>
    </div>
  );
}
