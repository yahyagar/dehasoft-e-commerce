"use client";

import type { Product } from "@/types/product";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

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

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currency = searchParams.get("currency");
  const productHref = currency
    ? `/products/${product.id}?currency=${currency}`
    : `/products/${product.id}`;
  const [isAdding, setIsAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  async function addToCart() {
    setIsAdding(true);
    setCartMessage(null);

    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: product.id,
          quantity: 1,
        }),
      });
      const result = (await response.json()) as { message?: string };

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message ?? "Ürün sepete eklenemedi.");
      }

      setCartMessage("Sepete eklendi.");
      window.dispatchEvent(new Event("cart:updated"));
    } catch (error) {
      setCartMessage(
        error instanceof Error ? error.message : "Ürün sepete eklenemedi."
      );
    } finally {
      setIsAdding(false);
    }
  }

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
        </Link>
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
          onClick={addToCart}
          className="mt-5 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-900 px-4 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isAdding || !product.is_active || product.stock < 1}
        >
          <CartIcon />
          {isAdding ? "Ekleniyor" : "Sepete Ekle"}
        </button>
        {cartMessage ? (
          <p className="mt-3 text-sm font-semibold text-slate-600">
            {cartMessage}
          </p>
        ) : null}
      </div>
    </article>
  );
}
