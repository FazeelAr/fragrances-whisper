"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tags, ShoppingBag, Users, ArrowLeft, LogOut, Sparkles, Menu, X } from "lucide-react";
import { STORE_NAME } from "@/src/lib/constants";
import { signOut } from "next-auth/react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Products", icon: Package },
    { href: "/admin/categories", label: "Categories", icon: Tags },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    { href: "/admin/customers", label: "Customers", icon: Users },
  ];

  return (
    <>
      {/* Mobile Toggle Header (visible only on mobile) */}
      <div className="md:hidden flex items-center justify-between bg-stone-900 px-4 py-3 text-stone-300">
        <Link href="/admin" className="flex items-center gap-2 text-white font-bold">
          <Sparkles className="h-5 w-5 text-amber-500" />
          <span className="font-serif italic tracking-wide">{STORE_NAME} Admin</span>
        </Link>
        <button onClick={() => setIsOpen(true)} className="p-2 text-stone-300 hover:text-white">
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Sidebar Overlay (Mobile) */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-stone-900/80 md:hidden" onClick={() => setIsOpen(false)} />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-stone-900 text-stone-300 border-r border-stone-800 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-stone-800">
          <Link href="/admin" className="flex items-center gap-2 text-white font-bold">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="font-serif italic tracking-wide hidden md:block">Admin</span>
            <span className="font-serif italic tracking-wide md:hidden">{STORE_NAME} Admin</span>
          </Link>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 text-stone-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-amber-600 text-white"
                    : "text-stone-300 hover:bg-stone-800 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="border-t border-stone-800 p-4 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-stone-400 hover:bg-stone-800 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Store
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-red-400 hover:bg-stone-850 hover:text-red-350 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Log Out
          </button>
        </div>
      </div>
    </>
  );
}
