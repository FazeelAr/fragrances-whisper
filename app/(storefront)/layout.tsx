import SiteHeader from "@/src/components/shared/SiteHeader";
import SiteFooter from "@/src/components/shared/SiteFooter";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-neutral-50/50">
      {/* Dynamic Navigation Header */}
      <SiteHeader />

      {/* Main Storefront Content */}
      <main className="flex-grow flex flex-col">{children}</main>

      {/* Dynamic Brand Footer */}
      <SiteFooter />
    </div>
  );
}
