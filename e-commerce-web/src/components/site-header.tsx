"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const categories = [
  { name: "Elektronik", slug: "elektronik" },
  { name: "Moda", slug: "moda" },
  { name: "Ev & Yaşam", slug: "ev-yasam" },
  { name: "Spor & Outdoor", slug: "spor-outdoor" },
  { name: "Kozmetik & Sağlık", slug: "kozmetik-saglik" },
];

const currencies = ["TRY", "USD", "EUR"] as const;

type Currency = (typeof currencies)[number];

function isCurrency(value: string | null): value is Currency {
  return currencies.includes(value as Currency);
}

function SearchIcon() {
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
        d="m21 21-4.3-4.3m1.3-5.2a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
      />
    </svg>
  );
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
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const currencyParam = searchParams.get("currency");
  const selectedCurrency: Currency = isCurrency(currencyParam)
    ? currencyParam
    : "TRY";

  function buildCategoryHref(slug: string) {
    const params = new URLSearchParams();
    params.set("category", slug);
    params.set("currency", selectedCurrency);

    return `/products?${params.toString()}`;
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
    router.push("/login");
    router.refresh();
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
            href="/products"
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

        <form className="ml-auto hidden w-full max-w-72 items-center gap-3 rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-slate-500 transition hover:border-blue-300 hover:bg-white focus-within:border-blue-900 focus-within:bg-white md:flex">
          <SearchIcon />
          <label className="sr-only" htmlFor="site-search">
            Ürün ara
          </label>
          <input
            id="site-search"
            type="search"
            placeholder="Ürün ara..."
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500"
          />
        </form>

        <div className="flex items-center gap-2 text-blue-950">
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
            href="/cart"
            className="relative grid h-10 w-10 place-items-center rounded-md transition hover:bg-blue-100"
            aria-label="Sepet"
            title="Sepet"
          >
            <CartIcon />
            <span className="absolute right-1 top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">
              0
            </span>
          </Link>
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsAccountMenuOpen((value) => !value)}
              className="grid h-10 w-10 place-items-center rounded-md transition hover:bg-blue-100"
              aria-expanded={isAccountMenuOpen}
              aria-label="Hesap menüsü"
              title="Hesap"
            >
              <UserIcon />
            </button>

            {isAccountMenuOpen ? (
              <div className="absolute right-0 top-12 w-48 overflow-hidden rounded-md border border-slate-200 bg-white py-2 text-sm font-semibold text-slate-700 shadow-xl">
                <Link
                  href="/orders"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="block px-4 py-2 transition hover:bg-blue-50 hover:text-blue-900"
                >
                  Siparişlerim
                </Link>
                <Link
                  href="/login"
                  onClick={() => setIsAccountMenuOpen(false)}
                  className="block px-4 py-2 transition hover:bg-blue-50 hover:text-blue-900"
                >
                  Giriş Yap
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
