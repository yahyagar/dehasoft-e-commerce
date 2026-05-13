"use client";

import type { Product, ProductsResponse } from "@/types/product";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function buildProductHref(product: Product, currency: string) {
  const params = new URLSearchParams();
  params.set("currency", currency);

  return `/products/${product.id}?${params.toString()}`;
}

function FeaturedProductCard({
  product,
  currency,
}: {
  product: Product;
  currency: string;
}) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const productHref = buildProductHref(product, currency);

  async function addToCart() {
    setIsAdding(true);
    setMessage(null);

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

      setMessage("Sepete eklendi.");
      window.dispatchEvent(new Event("cart:updated"));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Ürün sepete eklenemedi."
      );
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <article className="overflow-hidden rounded-md border border-slate-200 bg-white">
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

      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">
          {product.category?.name ?? "Kategori yok"}
        </p>
        <Link
          href={productHref}
          className="mt-2 block min-h-12 text-lg font-bold leading-6 text-slate-950 transition hover:text-blue-900"
        >
          {product.name}
        </Link>
        <div className="mt-5 flex items-center justify-between gap-3">
          <p className="text-xl font-bold text-blue-950">
            {product.display_price.formatted}
          </p>
          <button
            type="button"
            onClick={addToCart}
            disabled={isAdding || !product.is_active || product.stock < 1}
            className="min-h-10 cursor-pointer rounded-md bg-blue-900 px-4 py-2 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isAdding ? "Ekleniyor" : "Hızlı Ekle"}
          </button>
        </div>
        {message ? (
          <p className="mt-3 text-sm font-semibold text-slate-600">
            {message}
          </p>
        ) : null}
      </div>
    </article>
  );
}

export function FeaturedProducts() {
  const searchParams = useSearchParams();
  const currency = searchParams.get("currency") ?? "TRY";
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const featuredProducts = useMemo(
    () => products.filter((product) => product.is_active).slice(0, 4),
    [products]
  );

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      setMessage(null);

      try {
        const params = new URLSearchParams();
        params.set("currency", currency);
        params.set("active", "true");

        const response = await fetch(`/api/products?${params.toString()}`, {
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const result = (await response.json()) as ProductsResponse;

        if (!response.ok) {
          throw new Error(result.message ?? "Ürünler yüklenemedi.");
        }

        setProducts(result.data.products);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Ürünler yüklenemedi."
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, [currency]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-blue-950">
            Öne Çıkan Ürünler
          </h2>
          <p className="mt-2 text-slate-600">
            Mağazadaki aktif ürünlerden seçilen vitrin kartları
          </p>
        </div>
        <Link
          href={`/products?currency=${currency}`}
          className="font-semibold text-blue-900"
        >
          Tüm Ürünleri Gör
        </Link>
      </div>

      {message ? (
        <div className="mt-8 rounded-md border border-red-200 bg-red-50 p-5 font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-96 animate-pulse rounded-md border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && featuredProducts.length > 0 ? (
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <FeaturedProductCard
              key={product.id}
              product={product}
              currency={currency}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && !message && featuredProducts.length === 0 ? (
        <p className="mt-8 rounded-md border border-slate-200 bg-white p-5 font-semibold text-slate-600">
          Henüz öne çıkarılacak aktif ürün bulunmuyor.
        </p>
      ) : null}
    </section>
  );
}
