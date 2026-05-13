"use client";

import { AdminProductForm } from "@/components/admin/admin-product-form";
import type { CategoriesResponse, Category } from "@/types/category";
import type { Product, ProductPayload, ProductsResponse } from "@/types/product";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function productCode(product: Product) {
  return `SKU: PR-${String(product.id).padStart(4, "0")}`;
}

function stockBarWidth(stock: number, maxStock: number) {
  if (maxStock === 0) {
    return "0%";
  }

  return `${Math.max(6, Math.round((stock / maxStock) * 100))}%`;
}

function ActionIcon({ type }: { type: "edit" | "delete" }) {
  const commonProps = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  if (type === "edit") {
    return (
      <svg {...commonProps}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
      </svg>
    );
  }

  return (
    <svg {...commonProps}>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v5" />
      <path d="M14 11v5" />
    </svg>
  );
}

export function AdminProducts() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSavingProduct, setIsSavingProduct] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadProductData = useCallback(async () => {
    setMessage(null);

    try {
      const [categoriesResponse, productsResponse] = await Promise.all([
        fetch("/api/categories", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        }),
        fetch("/api/products?currency=TRY", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        }),
      ]);

      const categoriesData =
        (await categoriesResponse.json()) as CategoriesResponse;
      const productsData = (await productsResponse.json()) as ProductsResponse;

      if (!categoriesResponse.ok) {
        throw new Error(categoriesData.message);
      }

      if (!productsResponse.ok) {
        throw new Error(productsData.message);
      }

      setCategories(categoriesData.data.categories);
      setProducts(productsData.data.products);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Ürün verileri yüklenirken hata oluştu."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProductData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProductData]);

  const activeProductCount = useMemo(() => {
    return products.filter((product) => product.is_active).length;
  }, [products]);

  const passiveProductCount = products.length - activeProductCount;
  const maxStock = Math.max(0, ...products.map((product) => product.stock));

  const stats = [
    { title: "Toplam Ürün", value: products.length.toLocaleString("tr-TR") },
    { title: "Aktif Ürün", value: activeProductCount.toLocaleString("tr-TR") },
    { title: "Toplam Kategori", value: categories.length.toLocaleString("tr-TR") },
    { title: "Pasif Ürünler", value: passiveProductCount.toLocaleString("tr-TR") },
  ];

  function openNewProductForm() {
    setSelectedProduct(null);
    setIsFormOpen(true);
  }

  function editProduct(product: Product) {
    setSelectedProduct(product);
    setIsFormOpen(true);
  }

  function closeProductForm() {
    setSelectedProduct(null);
    setIsFormOpen(false);
  }

  async function saveProduct(payload: ProductPayload, productId?: number) {
    setIsSavingProduct(true);
    setMessage(null);

    const isEditing = productId !== undefined;

    try {
      const response = await fetch(
        isEditing ? `/api/products/${productId}` : "/api/products",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { Accept: "application/json" },
          body: payload,
        }
      );
      const result = (await response.json()) as { message?: string };

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message ?? "Ürün kaydedilemedi.");
      }

      closeProductForm();
      await loadProductData();
      setMessage(isEditing ? "Ürün güncellendi." : "Yeni ürün eklendi.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Ürün kaydedilemedi."
      );
    } finally {
      setIsSavingProduct(false);
    }
  }

  async function deleteProduct(productId: number) {
    setMessage(null);

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      const result = (await response.json()) as { message?: string };

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message ?? "Ürün silinemedi.");
      }

      await loadProductData();
      setMessage("Ürün silindi.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ürün silinemedi.");
    }
  }

  if (isLoading) {
    return (
      <section className="p-6 lg:p-10">
        <div className="h-96 animate-pulse rounded-md border border-slate-200 bg-white" />
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50">
      <div className="p-6 lg:p-10">
        {message ? (
          <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4 font-semibold text-blue-900">
            {message}
          </div>
        ) : null}

        {isFormOpen ? (
          <AdminProductForm
            key={selectedProduct?.id ?? "new"}
            categories={categories}
            product={selectedProduct}
            isSaving={isSavingProduct}
            onCancel={closeProductForm}
            onSubmit={saveProduct}
          />
        ) : (
          <>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="text-4xl font-black text-slate-950">
                  Ürün Listesi
                </h1>
                <p className="mt-2 text-lg text-slate-700">
                  Envanterinizdeki tüm ürünleri buradan yönetebilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={openNewProductForm}
                className="inline-flex h-14 cursor-pointer items-center justify-center gap-3 rounded-md bg-blue-900 px-7 font-black text-white transition hover:bg-blue-800"
              >
                <span className="text-2xl leading-none">+</span>
                Yeni Ürün Ekle
              </button>
            </div>

            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <article
                  key={stat.title}
                  className="rounded-md border border-slate-300 bg-white p-6"
                >
                  <p className="font-bold text-slate-700">{stat.title}</p>
                  <p className="mt-3 text-3xl font-black text-slate-950">
                    {stat.value}
                  </p>
                </article>
              ))}
            </div>

        <div className="mt-8 overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="border-b border-slate-300 bg-blue-50">
              <tr className="text-sm uppercase tracking-widest text-slate-700">
                <th className="px-6 py-5">Ürün Bilgisi</th>
                <th className="px-6 py-5">Kategori</th>
                <th className="px-6 py-5">Stok</th>
                <th className="px-6 py-5">Fiyat</th>
                <th className="px-6 py-5 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {products.map((product) => {
                const stockIsLow = product.stock <= 5;

                return (
                  <tr
                    key={product.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => editProduct(product)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        editProduct(product);
                      }
                    }}
                    className="cursor-pointer transition hover:bg-blue-50/50"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 overflow-hidden rounded-md border border-slate-300 bg-slate-100">
                          {product.image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-950">
                            {product.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {productCode(product)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="rounded-full bg-blue-100 px-4 py-1.5 text-xs font-bold text-slate-700">
                        {product.category?.name ?? "-"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-slate-300">
                          <div
                            className={`h-full rounded-full ${
                              stockIsLow ? "bg-red-700" : "bg-blue-900"
                            }`}
                            style={{
                              width: stockBarWidth(product.stock, maxStock),
                            }}
                          />
                        </div>
                        <span
                          className={`font-bold ${
                            stockIsLow ? "text-red-700" : "text-slate-950"
                          }`}
                        >
                          {product.stock}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-2xl font-black text-blue-950">
                      {product.display_price.formatted}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            editProduct(product);
                          }}
                          aria-label={`${product.name} ürününü düzenle`}
                          className="grid h-10 w-10 cursor-pointer place-items-center rounded-md text-slate-700 transition hover:bg-blue-50 hover:text-blue-900"
                        >
                          <ActionIcon type="edit" />
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            deleteProduct(product.id);
                          }}
                          aria-label={`${product.name} ürününü sil`}
                          className="grid h-10 w-10 cursor-pointer place-items-center rounded-md text-slate-700 transition hover:bg-red-50 hover:text-red-700"
                        >
                          <ActionIcon type="delete" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {products.length === 0 ? (
            <p className="p-6 font-semibold text-slate-600">
              Henüz ürün bulunmuyor.
            </p>
          ) : null}

        </div>
          </>
        )}
      </div>
    </section>
  );
}
