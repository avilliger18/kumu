"use client";

import { api } from "@kumu/backend/convex/_generated/api";
import { useQuery } from "convex/react";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Factory,
  Package,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

function NavItem({
  href,
  icon: Icon,
  children,
}: {
  href: string;
  icon: React.ElementType;
  children: string;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-sidebar-primary text-sidebar-primary-foreground"
          : "text-sidebar-foreground hover:bg-secondary hover:text-primary"
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {children}
    </Link>
  );
}

export default function SupplierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const producer = useQuery(api.suppliers.getMyProducer);

  return (
    <div className="flex h-screen bg-background">
      {/* sidebar */}
      <aside className="flex w-56 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
        {/* header */}
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-sm">
            <Factory />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold font-heading text-sidebar-foreground">
              {producer?.displayName ?? "Supplier"}
            </p>
            <p className="text-xs text-muted-foreground">Dashboard</p>
          </div>
        </div>

        {/* nav */}
        <nav className="flex-1 space-y-1 p-3">
          <NavItem href="/supplier/company" icon={Building2}>
            Company
          </NavItem>
          <NavItem href="/supplier/products" icon={Package}>
            Products
          </NavItem>
          <NavItem href="/supplier/alerts" icon={AlertTriangle}>
            Alerts
          </NavItem>
        </nav>

        {/* footer */}
        <div className="border-t border-sidebar-border p-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            Back to Home
          </Link>
        </div>
      </aside>

      {/* main content */}
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
