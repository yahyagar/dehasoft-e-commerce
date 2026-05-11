import Link from "next/link";

const categories = [
  "Elektronik",
  "Moda",
  "Ev & Yaşam",
  "Spor & Outdoor",
  "Kozmetik & Sağlık",
];

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

function RefreshIcon() {
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
        d="M20 11a8.1 8.1 0 0 0-14.2-4.9L4 8m0 0V3m0 5h5m-5 5a8.1 8.1 0 0 0 14.2 4.9L20 16m0 0v5m0-5h-5"
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
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-slate-50/95 backdrop-blur">
      <div className="mx-auto flex min-h-16 w-full max-w-7xl items-center gap-5 px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-xl font-bold tracking-tight text-blue-950"
        >
          DehaCommerce
        </Link>

        <nav aria-label="Ana navigasyon" className="hidden items-center gap-5 md:flex">
          <Link
            href="/"
            className="border-b-2 border-blue-900 px-1 py-5 font-semibold text-blue-950"
          >
            Mağaza
          </Link>
          <Link
            href="/orders"
            className="px-1 py-5 font-semibold text-slate-600 transition hover:text-blue-950"
          >
            Siparişler
          </Link>
        </nav>

        <div className="hidden h-8 w-px bg-slate-300 lg:block" />

        <nav
          aria-label="Kategoriler"
          className="hidden min-w-0 flex-1 items-center justify-center gap-6 text-xs font-medium text-slate-900 lg:flex"
        >
          {categories.map((category) => (
            <Link
              key={category}
              href={`/products?category=${encodeURIComponent(category)}`}
              className="max-w-24 text-center leading-4 transition hover:text-blue-800"
            >
              {category}
            </Link>
          ))}
        </nav>

        <form className="ml-auto hidden w-full max-w-72 items-center gap-3 rounded-md border border-slate-300 bg-slate-100 px-4 py-2 text-slate-500 md:flex">
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
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-md transition hover:bg-blue-100"
            aria-label="Kurları yenile"
            title="Kurları yenile"
          >
            <RefreshIcon />
          </button>
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
          <Link
            href="/login"
            className="grid h-10 w-10 place-items-center rounded-md transition hover:bg-blue-100"
            aria-label="Hesap"
            title="Hesap"
          >
            <UserIcon />
          </Link>
        </div>
      </div>
    </header>
  );
}
