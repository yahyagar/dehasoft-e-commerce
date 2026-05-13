"use client";

import { Breadcrumb } from "@/components/breadcrumb";
import { ProductCard } from "@/components/products/product-card";
import type { CategoriesResponse, Category } from "@/types/category";
import type { Product, ProductsResponse } from "@/types/product";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const currencies = ["TRY", "USD", "EUR"] as const;

type Currency = (typeof currencies)[number];

function isCurrency(value: string | null): value is Currency {
  return currencies.includes(value as Currency);
}

function buildProductsPath(currency: Currency, category: string | null) {
  const params = new URLSearchParams();
  params.set("currency", currency);
  params.set("active", "true");

  if (category) {
    params.set("category", category);
  }

  return `/api/products?${params.toString()}`;
}

export function ProductsList() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedCategory = searchParams.get("category");
  const currencyParam = searchParams.get("currency");
  const selectedCurrency: Currency = isCurrency(currencyParam)
    ? currencyParam
    : "TRY";

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setIsLoading(true);
      setMessage(null);

      try {
        const [categoryResponse, productResponse] = await Promise.all([
          fetch("/api/categories", {
            headers: { Accept: "application/json" },
            cache: "no-store",
          }),
          fetch(buildProductsPath(selectedCurrency, selectedCategory), {
            headers: { Accept: "application/json" },
            cache: "no-store",
          }),
        ]);

        const categoryData =
          (await categoryResponse.json()) as CategoriesResponse;
        const productData = (await productResponse.json()) as ProductsResponse;

        if (!categoryResponse.ok) {
          throw new Error(categoryData.message);
        }

        if (!productResponse.ok) {
          throw new Error(productData.message);
        }

        if (isMounted) {
          setCategories(categoryData.data.categories);
          setProducts(productData.data.products);
        }
      } catch (error) {
        if (isMounted) {
          setMessage(
            error instanceof Error
              ? error.message
              : "Ürünler yüklenirken hata oluştu."
          );
          setCategories([]);
          setProducts([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [selectedCategory, selectedCurrency]);

  const visibleProducts = useMemo(() => {
    return products
      .sort((first, second) => {
        if (sort === "price-asc") {
          return first.display_price.amount - second.display_price.amount;
        }

        if (sort === "price-desc") {
          return second.display_price.amount - first.display_price.amount;
        }

        return second.id - first.id;
      });
  }, [products, sort]);

  const pageTitle =
    categories.find((category) => category.slug === selectedCategory)?.name ??
    "Tüm Ürünler";

  function updateQuery(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Breadcrumb
            items={[
              { label: "Ana Sayfa", href: "/" },
              { label: "Mağaza", href: "/products" },
              { label: pageTitle },
            ]}
          />
          <h1 className="mt-4 text-4xl font-black text-slate-950">
            {pageTitle}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="sort">
            Sıralama
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
            className="h-12 cursor-pointer rounded-md border border-slate-300 bg-white px-4 font-semibold text-slate-800 outline-none transition hover:border-blue-300 hover:bg-blue-50 focus:border-blue-900"
          >
            <option value="newest">Sıralama: En yeni</option>
            <option value="price-asc">Fiyat: Artan</option>
            <option value="price-desc">Fiyat: Azalan</option>
          </select>
        </div>
      </div>

      <div className="mt-8 grid gap-7 lg:grid-cols-[280px_1fr]">
        <aside className="h-fit rounded-md border border-slate-300 bg-white p-6">
          <h2 className="text-2xl font-bold text-slate-950">Kategoriler</h2>
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => updateQuery("category", null)}
              className={`flex w-full cursor-pointer items-center justify-between rounded-md px-3 py-2 text-left font-semibold transition ${
                selectedCategory
                  ? "text-slate-700 hover:bg-slate-100"
                  : "bg-blue-900 text-white"
              }`}
            >
              Tümü
              <span
                className={`text-sm ${
                  selectedCategory ? "text-slate-500" : "text-blue-100"
                }`}
              >
                {products.length}
              </span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => updateQuery("category", category.slug)}
                className={`block w-full cursor-pointer rounded-md px-3 py-2 text-left font-semibold transition ${
                  selectedCategory === category.slug
                    ? "bg-blue-900 text-white"
                    : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </aside>

        <div>
          <div className="mb-5 flex items-center justify-between gap-4 text-sm text-slate-600">
            <p>
              {visibleProducts.length} ürün gösteriliyor
              {selectedCategory ? ` / ${selectedCategory}` : ""}
            </p>
          </div>

          {message ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-5 font-semibold text-red-700">
              {message}
            </div>
          ) : null}

          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-[430px] animate-pulse rounded-md border border-slate-200 bg-white"
                />
              ))}
            </div>
          ) : null}

          {!isLoading && !message ? (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visibleProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : null}

          {!isLoading && !message && visibleProducts.length === 0 ? (
            <div className="rounded-md border border-slate-200 bg-white p-8 text-center font-semibold text-slate-600">
              Bu filtrelere uygun ürün bulunamadı.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
