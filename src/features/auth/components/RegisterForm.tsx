"use client";

import { useState, useTransition } from "react";
import { registerCustomer } from "@/src/features/auth/actions";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Sparkles } from "lucide-react";
import { STORE_NAME } from "@/src/lib/constants";

export default function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const fd = new FormData(e.currentTarget);
    const name = fd.get("name") as string;
    const email = fd.get("email") as string;
    const phone = fd.get("phone") as string || undefined;
    const password = fd.get("password") as string;

    startTransition(async () => {
      // 1. Create user account
      const result = await registerCustomer({ name, email, phone, password });

      if (!result.success) {
        setError(result.error || "Failed to create account.");
        return;
      }

      // 2. Log in automatically on success
      try {
        const loginRes = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (loginRes?.error) {
          // Send to login page if auto-login fails for some reason
          router.push(`/login?next=${encodeURIComponent(next)}`);
        } else {
          router.push(next);
          router.refresh();
        }
      } catch (err) {
        console.error("Auto-login error after registration:", err);
        router.push(`/login?next=${encodeURIComponent(next)}`);
      }
    });
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 border border-stone-100 rounded-xl shadow-sm">
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4">
          <Sparkles className="h-6 w-6" />
        </div>
        <h2 className="text-3xl font-serif text-stone-900 tracking-tight">Create an account</h2>
        <p className="mt-2 text-sm text-stone-500 font-sans">
          Join {STORE_NAME} today
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 font-sans">
        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="name">
            Full Name *
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="email">
            Email Address *
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
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="phone">
            Phone Number
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none"
            placeholder="03XXXXXXXXX (Optional)"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-500 uppercase tracking-wider mb-1.5" htmlFor="password">
            Password *
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-500 focus:outline-none"
            placeholder="Min. 6 characters"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition-colors disabled:opacity-60 mt-2"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Creating account..." : "Register Account"}
        </button>
      </form>

      <div className="text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link href={`/login?next=${encodeURIComponent(next)}`} className="text-amber-700 hover:underline font-medium">
          Sign in instead
        </Link>
      </div>
    </div>
  );
}
