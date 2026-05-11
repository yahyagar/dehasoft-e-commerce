"use client";

import type { Product } from "@/types/product";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

function HeartIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.5c0 6-9 11-9 11s-9-5-9-11A5.2 5.2 0 0 1 12 5a5.2 5.2 0 0 1 9 3.5Z"
      />
    </svg>
  );
}

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const searchParams = useSearchParams();
  const currency = searchParams.get("currency");
  const productHref = currency
    ? `/products/${product.id}?currency=${currency}`
    : `/products/${product.id}`;

  return (
    <article className="overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
      <div className="relative">
        <Link
          href={productHref}
          className="block aspect-[4/3] bg-[radial-gradient(circle_at_50%_35%,#e2e8f0_0%,#64748b_45%,#0f172a_100%)]"
          aria-label={`${product.name} detayını görüntüle`}
        >
          {product.image_url ? (
            <div
              aria-label={product.name}
              role="img"
              className="h-full w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${product.image_url})` }}
            />
          ) : null}
          <span className="absolute left-4 top-4 rounded-full bg-blue-900 px-4 py-2 text-xs font-bold uppercase tracking-wide text-white">
            {product.is_active ? "Aktif" : "Pasif"}
          </span>
        </Link>
        <button
          type="button"
          className="absolute right-4 top-4 grid h-12 w-12 place-items-center rounded-md bg-white/90 text-slate-700 shadow-sm transition hover:bg-white hover:text-blue-900"
          aria-label="Favorilere ekle"
          title="Favorilere ekle"
        >
          <HeartIcon />
        </button>
      </div>

      <div className="p-5">
        <p className="text-xs font-bold uppercase tracking-wide text-blue-800">
          {product.category?.name ?? "Kategori yok"}
        </p>
        <Link
          href={productHref}
          className="mt-2 block min-h-14 text-xl font-bold leading-7 text-slate-950 transition hover:text-blue-900"
        >
          {product.name}
        </Link>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-600">
          {product.description ?? "Ürün açıklaması hazırlanıyor."}
        </p>

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-2xl font-black text-blue-950">
              {product.display_price.formatted}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">
              Stok: {product.stock}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-blue-900 px-4 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={!product.is_active || product.stock < 1}
        >
          <CartIcon />
          Sepete Ekle
        </button>
      </div>
    </article>
  );
}
