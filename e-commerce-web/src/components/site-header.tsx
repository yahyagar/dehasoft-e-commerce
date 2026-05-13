"use client";

import type { CartResponse } from "@/types/cart";
import type { AuthClientResponse, AuthUser } from "@/types/auth";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const categories = [
  { name: "Elektronik", slug: "elektronik" },
  { name: "Oyuncak", slug: "oyuncak" },
  { name: "Ev & Yaşam", slug: "ev-yasam" },
  { name: "Spor & Outdoor", slug: "spor-outdoor" },
  { name: "Kozmetik & Sağlık", slug: "kozmetik-saglik" },
];

const currencies = ["TRY", "USD", "EUR"] as const;

type Currency = (typeof currencies)[number];

function isCurrency(value: string | null): value is Currency {
  return currencies.includes(value as Currency);
}

function CartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.8a2 2 0 0 0 1.9-1.4L21 8H6.2M10 20h.01M18 20h.01"
      />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM5 21a7 7 0 0 1 14 0"
      />
    </svg>
  );
}

export function SiteHeader() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [cartQuantity, setCartQuantity] = useState(0);
  const currencyParam = searchParams.get("currency");
  const selectedCurrency: Currency = isCurrency(currencyParam)
    ? currencyParam
    : "TRY";

  const loadCartQuantity = useCallback(async () => {
    try {
      const response = await fetch(`/api/cart?currency=${selectedCurrency}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });

      if (response.status === 401) {
        setCartQuantity(0);
        return;
      }

      const result = (await response.json()) as CartResponse;

      if (!response.ok) {
        setCartQuantity(0);
        return;
      }

      setCartQuantity(result.data.total_quantity);
    } catch {
      setCartQuantity(0);
    }
  }, [selectedCurrency]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCartQuantity();
    }, 0);

    function handleCartUpdated() {
      void loadCartQuantity();
    }

    window.addEventListener("cart:updated", handleCartUpdated);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("cart:updated", handleCartUpdated);
    };
  }, [loadCartQuantity]);

  useEffect(() => {
    async function loadUser() {
      try {
        const response = await fetch("/api/auth/me", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });

        if (!response.ok) {
          setUser(null);
          return;
        }

        const result = (await response.json()) as AuthClientResponse;
        setUser(result.data.user);
      } catch {
        setUser(null);
      }
    }

    void loadUser();
  }, [pathname]);

  function buildCategoryHref(slug: string) {
    const params = new URLSearchParams();
    params.set("category", slug);
    params.set("currency", selectedCurrency);

    return `/products?${params.toString()}`;
  }

  function buildCurrencyHref(path: string) {
    const params = new URLSearchParams();
    params.set("currency", selectedCurrency);

    return `${path}?${params.toString()}`;
  }

  function updateCurrency(currency: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("currency", currency);
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    });

    setIsAccountMenuOpen(false);
    setUser(null);
    setCartQuantity(0);
    router.push("/login");
    router.refresh();
  }

  function handleAccountClick() {
    if (!user) {
      router.push("/login");
      return;
    }

    setIsAccountMenuOpen((value) => !value);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight text-blue-950"
        >
          DehaCommerce
        </Link>

        <nav
          aria-label="Ana navigasyon"
          className="hidden items-center gap-5 md:flex"
        >
          <Link
            href={buildCurrencyHref("/products")}
            className="border-b-2 border-blue-900 px-1 py-5 font-semibold text-blue-950"
          >
            Mağaza
          </Link>
        </nav>

        <div className="hidden h-8 w-px bg-slate-300 lg:block" />

        <nav
          aria-label="Kategoriler"
          className="hidden min-w-0 flex-1 items-center justify-center gap-6 text-xs font-medium text-slate-900 lg:flex"
        >
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={buildCategoryHref(category.slug)}
              className="max-w-24 text-center leading-4 transition hover:text-blue-800"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 text-blue-950">
          <label className="sr-only" htmlFor="header-currency">
            Para birimi
          </label>
          <select
            id="header-currency"
            value={selectedCurrency}
            onChange={(event) => updateCurrency(event.target.value)}
            className="h-10 cursor-pointer rounded-md border border-slate-300 bg-blue-50 px-3 text-sm font-bold text-blue-950 outline-none transition hover:border-blue-300 hover:bg-blue-100 focus:border-blue-900"
            title="Para birimi seç"
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
          <Link
            href={buildCurrencyHref("/cart")}
            className="relative grid h-10 w-10 place-items-center rounded-md transition hover:bg-blue-100"
            aria-label="Sepet"
            title="Sepet"
          >
            <CartIcon />
            <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
              {cartQuantity}
            </span>
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={handleAccountClick}
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-md transition hover:bg-blue-100"
              aria-expanded={isAccountMenuOpen}
              aria-label={user ? "Hesap menüsü" : "Giriş yap"}
              title={user ? "Hesap" : "Giriş yap"}
            >
              <UserIcon />
            </button>

            {user && isAccountMenuOpen ? (
              <div className="absolute right-0 top-12 w-48 overflow-hidden rounded-md border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 shadow-xl">
                <Link
                  href={user.role === "admin" ? "/admin/orders" : "/orders"}
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="block px-4 py-2 transition hover:bg-blue-50 hover:text-blue-900"
                >
                  {user.role === "admin" ? "Admin Siparişleri" : "Siparişlerim"}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left transition hover:bg-red-50 hover:text-red-700"
                >
                  Çıkış Yap
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
