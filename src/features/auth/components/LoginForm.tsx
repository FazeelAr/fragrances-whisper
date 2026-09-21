"use client";

import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck } from "lucide-react";
import { STORE_NAME } from "@/src/lib/constants";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";

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
          setError("Invalid administrator credentials or unauthorized account.");
        } else {
          router.push(next.startsWith("/admin") ? next : "/admin");
          router.refresh();
        }
      } catch (err) {
        console.error("Sign-in error:", err);
        setError("An unexpected error occurred. Please try again.");
      }
    });
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-white p-8 border border-stone-100 rounded-xl shadow-sm">
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-700 mb-4 border border-amber-200/50">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">Admin Portal</h2>
        <p className="mt-1.5 text-xs text-stone-500 font-sans">
          Restricted access for {STORE_NAME} administrators
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-xs text-red-700 font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5" htmlFor="email">
            Admin Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:outline-none"
            placeholder="admin@fragrancewhisper.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-600 uppercase tracking-wider mb-1.5" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-stone-200 px-3 py-2 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:outline-none"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-stone-800 transition-colors disabled:opacity-60 cursor-pointer"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Authenticating..." : "Sign In to Admin Panel"}
        </button>
      </form>

      <div className="border-t border-stone-100 pt-4 text-center">
        <p className="text-[11px] text-stone-400">
          This portal is strictly reserved for authorized store administrators.
        </p>
      </div>
    </div>
  );
}
