import { db } from "@/src/lib/db";
import Link from "next/link";
import { formatPrice } from "@/src/lib/utils";
import { Package, Tag, ShoppingCart, AlertTriangle, Plus, ArrowRight } from "lucide-react";

async function getDashboardStats() {
  try {
    const [totalProducts, totalCategories, totalOrders, lowStockProducts, recentOrders] =
      await Promise.all([
        db.product.count(),
        db.category.count(),
        db.order.count(),
        db.product.findMany({
          where: { stock: { lte: 5 }, isPublished: true },
          select: { id: true, name: true, stock: true, sku: true },
          orderBy: { stock: "asc" },
          take: 5,
        }),
        db.order.findMany({
          take: 5,
          orderBy: { createdAt: "desc" },
          include: { user: { select: { name: true, email: true } } },
        }),
      ]);

    return { totalProducts, totalCategories, totalOrders, lowStockProducts, recentOrders };
  } catch (err) {
    console.error("Failed to load dashboard stats:", err);
    return {
      totalProducts: 0,
      totalCategories: 0,
      totalOrders: 0,
      lowStockProducts: [],
      recentOrders: [],
    };
  }
}

export default async function AdminDashboard() {
  const { totalProducts, totalCategories, totalOrders, lowStockProducts, recentOrders } =
    await getDashboardStats();

  const kpis = [
    { label: "Total Products", value: totalProducts, icon: Package, href: "/admin/products", color: "bg-blue-50 text-blue-700" },
    { label: "Categories", value: totalCategories, icon: Tag, href: "/admin/categories", color: "bg-purple-50 text-purple-700" },
    { label: "Total Orders", value: totalOrders, icon: ShoppingCart, href: "/admin/orders", color: "bg-green-50 text-green-700" },
    { label: "Low Stock Items", value: lowStockProducts.length, icon: AlertTriangle, href: "/admin/products", color: "bg-amber-50 text-amber-700" },
  ];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-serif font-bold text-stone-900">Dashboard</h1>
        <p className="text-stone-500 text-sm font-sans mt-1">Overview of your Fragrance Whisper store</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Link key={kpi.label} href={kpi.href} className="group flex items-center gap-4 rounded-xl bg-white border border-stone-100 shadow-sm p-6 hover:shadow-md transition-all">
              <div className={`h-12 w-12 flex items-center justify-center rounded-lg flex-shrink-0 ${kpi.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">{kpi.label}</p>
                <p className="text-2xl font-bold text-stone-900 mt-0.5">{kpi.value}</p>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Low Stock Alerts */}
        <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h2 className="font-serif text-lg font-medium text-stone-900">Low Stock Alerts</h2>
            </div>
            <Link href="/admin/products" className="text-xs text-amber-700 font-semibold hover:text-amber-800 flex items-center gap-1">
              View All <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="px-6 py-10 text-center text-stone-400 font-sans text-sm">All products are well-stocked.</div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {lowStockProducts.map((p) => (
                <li key={p.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-medium text-stone-900">{p.name}</p>
                    <p className="text-xs text-stone-400 font-mono">{p.sku}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${p.stock === 0 ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-800"}`}>
                    {p.stock === 0 ? "Out of Stock" : `${p.stock} left`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-stone-100 rounded-xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-green-600" />
              <h2 className="font-serif text-lg font-medium text-stone-900">Recent Orders</h2>
            </div>
          </div>
          {recentOrders.length === 0 ? (
            <div className="px-6 py-10 text-center text-stone-400 font-sans text-sm">No orders yet.</div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {recentOrders.map((order) => (
                <li key={order.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-900 font-mono">{order.orderNumber}</p>
                    <p className="text-xs text-stone-400">{order.user?.name || order.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-stone-800">{formatPrice(order.total.toString())}</p>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      order.paymentStatus === "PAID" ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-600"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white border border-stone-100 rounded-xl shadow-sm p-6">
        <h2 className="font-serif text-lg font-medium text-stone-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-800 transition-colors"
          >
            <Plus className="h-4 w-4" /> New Product
          </Link>
          <Link
            href="/admin/categories"
            className="inline-flex items-center gap-2 rounded-md border border-stone-200 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
          >
            <Tag className="h-4 w-4" /> Manage Categories
          </Link>
        </div>
      </div>
    </div>
  );
}
