"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type AdminSidebarProps = {
  adminName: string;
};

type AdminNavIcon = "dashboard" | "products" | "orders";

const adminNavItems = [
  {
    label: "Panel",
    icon: "dashboard",
    href: "/admin",
  },
  {
    label: "Ürünler",
    icon: "products",
    href: "/admin/products",
  },
  {
    label: "Siparişler",
    icon: "orders",
    href: "/admin/orders",
  },
] satisfies {
  label: string;
  icon: AdminNavIcon;
  href: string;
}[];

function AdminIcon({ icon }: { icon: AdminNavIcon }) {
  const commonProps = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (icon === "dashboard") {
    return (
      <svg {...commonProps}>
        <rect x="4" y="4" width="6" height="6" />
        <rect x="14" y="4" width="6" height="6" />
        <rect x="4" y="14" width="6" height="6" />
        <rect x="14" y="14" width="6" height="6" />
      </svg>
    );
  }

  if (icon === "products") {
    return (
      <svg {...commonProps}>
        <path d="M5 7h14" />
        <path d="M7 7v12h10V7" />
        <path d="M9 4h6l2 3H7l2-3Z" />
        <path d="M9 11h6" />
      </svg>
    );
  }

  if (icon === "orders") {
    return (
      <svg {...commonProps}>
        <circle cx="9" cy="20" r="1" />
        <circle cx="18" cy="20" r="1" />
        <path d="M3 4h3l2.2 10.5a2 2 0 0 0 2 1.5h6.8a2 2 0 0 0 1.9-1.4L21 8H7" />
      </svg>
    );
  }

  return null;
}

export function AdminSidebar({ adminName }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="border-r border-slate-200 bg-slate-50 p-6">
      <div>
        <h1 className="text-3xl font-black text-blue-950">Admin Paneli</h1>
        <p className="mt-1 font-semibold text-slate-700">
          E-Ticaret Yönetimi
        </p>
      </div>

      <nav className="mt-14 space-y-3">
        {adminNavItems.map((item) => {
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex h-14 items-center gap-4 rounded-md px-5 font-bold transition ${
                isActive
                  ? "bg-blue-800 text-white"
                  : "text-slate-700 hover:bg-blue-50 hover:text-blue-900"
              }`}
            >
              <span className="grid h-8 w-8 place-items-center">
                <AdminIcon icon={item.icon} />
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-20 border-t border-slate-300 pt-6">
        <p className="font-black text-slate-950">{adminName}</p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-4 w-full cursor-pointer rounded-md border border-slate-300 px-4 py-3 text-left font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          Çıkış Yap
        </button>
      </div>
    </aside>
  );
}
