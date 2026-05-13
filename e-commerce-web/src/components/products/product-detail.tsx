"use client";

import { Breadcrumb } from "@/components/breadcrumb";
import { ProductCard } from "@/components/products/product-card";
import type {
  Product,
  ProductResponse,
  ProductsResponse,
} from "@/types/product";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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

type ProductDetailProps = {
  productId: string;
};

export function ProductDetail({ productId }: ProductDetailProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currencyParam = searchParams.get("currency");
  const selectedCurrency: Currency = isCurrency(currencyParam)
    ? currencyParam
    : "TRY";

  const [product, setProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [cartMessage, setCartMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProduct() {
      setIsLoading(true);
      setMessage(null);

      try {
        const productsParams = new URLSearchParams();
        productsParams.set("currency", selectedCurrency);
        productsParams.set("active", "true");

        const [productResponse, productsResponse] = await Promise.all([
          fetch(`/api/products/${productId}?currency=${selectedCurrency}`, {
            headers: { Accept: "application/json" },
            cache: "no-store",
          }),
          fetch(`/api/products?${productsParams.toString()}`, {
            headers: { Accept: "application/json" },
            cache: "no-store",
          }),
        ]);

        const productData = (await productResponse.json()) as ProductResponse;
        const productsData = (await productsResponse.json()) as ProductsResponse;

        if (!productResponse.ok) {
          throw new Error(productData.message);
        }

        if (!productsResponse.ok) {
          throw new Error(productsData.message);
        }

        if (isMounted) {
          setProduct(productData.data.product);
          setProducts(productsData.data.products);
        }
      } catch (error) {
        if (isMounted) {
          setProduct(null);
          setProducts([]);
          setMessage(
            error instanceof Error
              ? error.message
              : "Ürün detayı yüklenirken hata oluştu."
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, [productId, selectedCurrency]);

  const similarProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products
      .filter((item) => {
        return (
          item.id !== product.id &&
          item.category?.slug === product.category?.slug
        );
      })
      .slice(0, 3);
  }, [product, products]);

  const recommendedProducts = useMemo(() => {
    if (!product) {
      return [];
    }

    return products
      .filter((item) => {
        return (
          item.id !== product.id &&
          item.category?.slug !== product.category?.slug
        );
      })
      .slice(0, 4);
  }, [product, products]);

  async function addToCart() {
    if (!product) {
      return;
    }

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

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="h-[520px] animate-pulse rounded-md border border-slate-200 bg-white" />
      </section>
    );
  }

  if (message || !product) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-5 font-semibold text-red-700">
          {message ?? "Ürün bulunamadı."}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Mağaza", href: "/products" },
            {
              label: product.category?.name ?? "Ürün",
              href: product.category
                ? `/products?category=${product.category.slug}&currency=${selectedCurrency}`
                : "/products",
            },
            { label: product.name },
          ]}
        />
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="overflow-hidden rounded-md border border-slate-300 bg-white">
          <div className="aspect-[4/3] bg-[radial-gradient(circle_at_50%_35%,#e2e8f0_0%,#64748b_45%,#0f172a_100%)]">
            {product.image_url ? (
              <div
                aria-label={product.name}
                role="img"
                className="h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${product.image_url})` }}
              />
            ) : null}
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-sm font-bold uppercase tracking-widest text-blue-800">
            {product.category?.name ?? "Kategori yok"}
          </p>
          <h1 className="mt-3 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 leading-7 text-slate-600">
            {product.description ?? "Bu ürün için açıklama hazırlanıyor."}
          </p>

          <div className="mt-8 rounded-md border border-slate-200 bg-white p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">Fiyat</p>
                <p className="mt-1 text-4xl font-black text-blue-950">
                  {product.display_price.formatted}
                </p>
              </div>
              <div className="rounded-md bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700">
                Stok: {product.stock}
              </div>
            </div>

            <button
              type="button"
              onClick={addToCart}
              className="mt-6 inline-flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-blue-900 px-6 font-bold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
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
        </div>
      </div>

      {similarProducts.length > 0 ? (
        <div className="mt-12 border-t border-slate-200 pt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-950">
                Benzer Ürünler
              </h2>
              <p className="mt-2 text-slate-600">
                Aynı kategoriden diğer seçenekler
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {similarProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      ) : null}

      {recommendedProducts.length > 0 ? (
        <div className="mt-12 rounded-md border border-blue-100 bg-blue-50/50 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-widest text-blue-800">
                Keşfet
              </p>
              <h2 className="mt-2 text-3xl font-black text-slate-950">
                Sizin İçin Önerilenler
              </h2>
              <p className="mt-2 max-w-2xl text-slate-600">
                Farklı kategorilerden sepetini tamamlayabilecek ürünler.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recommendedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
