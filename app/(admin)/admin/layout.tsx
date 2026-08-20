import AdminSidebar from "@/src/components/shared/AdminSidebar";
import { requireAdmin } from "@/src/features/auth/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Extra security check in Server Layout
  await requireAdmin();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-neutral-100/50">
      {/* Sidebar Navigation */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8 sm:p-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
