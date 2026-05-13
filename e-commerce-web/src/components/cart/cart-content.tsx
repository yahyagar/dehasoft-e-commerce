"use client";

import { Breadcrumb } from "@/components/breadcrumb";
import type { Cart, CartResponse } from "@/types/cart";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const currencies = ["TRY", "USD", "EUR"] as const;

type Currency = (typeof currencies)[number];

function isCurrency(value: string | null): value is Currency {
  return currencies.includes(value as Currency);
}

function buildCartPath(currency: Currency) {
  const params = new URLSearchParams();
  params.set("currency", currency);

  return `/api/cart?${params.toString()}`;
}

function MinusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function TrashIcon() {
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
        d="M6 7h12M10 11v6M14 11v6M9 7l1-2h4l1 2M8 7l1 12h6l1-12"
      />
    </svg>
  );
}

export function CartContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currencyParam = searchParams.get("currency");
  const selectedCurrency: Currency = isCurrency(currencyParam)
    ? currencyParam
    : "TRY";

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingItemId, setPendingItemId] = useState<number | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const loadCart = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(buildCartPath(selectedCurrency), {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const result = (await response.json()) as CartResponse;

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message);
      }

      setCart(result.data);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Sepet yüklenirken hata oluştu."
      );
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  }, [router, selectedCurrency]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadCart();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadCart]);

  async function updateQuantity(cartItemId: number, quantity: number) {
    if (quantity < 1) {
      return;
    }

    setPendingItemId(cartItemId);
    setMessage(null);

    try {
      const response = await fetch(`/api/cart/items/${cartItemId}`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });
      const result = (await response.json()) as CartResponse;

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message);
      }

      await loadCart();
      window.dispatchEvent(new Event("cart:updated"));
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Sepet satırı güncellenemedi."
      );
    } finally {
      setPendingItemId(null);
    }
  }

  async function removeItem(cartItemId: number) {
    setPendingItemId(cartItemId);
    setMessage(null);

    try {
      const response = await fetch(`/api/cart/items/${cartItemId}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      const result = (await response.json()) as CartResponse;

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message);
      }

      await loadCart();
      window.dispatchEvent(new Event("cart:updated"));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Ürün sepetten kaldırılamadı."
      );
    } finally {
      setPendingItemId(null);
    }
  }

  async function clearCart() {
    setIsClearing(true);
    setMessage(null);

    try {
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      const result = (await response.json()) as CartResponse;

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message);
      }

      await loadCart();
      window.dispatchEvent(new Event("cart:updated"));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Sepet temizlenemedi."
      );
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="border-b border-slate-200 pb-6">
        <Breadcrumb
          items={[
            { label: "Ana Sayfa", href: "/" },
            { label: "Mağaza", href: "/products" },
            { label: "Sepet" },
          ]}
        />
        <h1 className="mt-4 text-4xl font-black text-slate-950">Sepet</h1>
      </div>

      {message ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="h-80 animate-pulse rounded-md border border-slate-200 bg-white" />
          <div className="h-64 animate-pulse rounded-md border border-slate-200 bg-white" />
        </div>
      ) : null}

      {!isLoading && cart && cart.items.length === 0 ? (
        <div className="mt-8 rounded-md border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-2xl font-black text-slate-950">
            Sepetiniz boş
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-600">
            Ürünleri inceleyip sepetinize ekledikten sonra sipariş adımına
            geçebilirsiniz.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-12 cursor-pointer items-center justify-center rounded-md bg-blue-900 px-6 font-bold text-white transition hover:bg-blue-800"
          >
            Ürünleri Gör
          </Link>
        </div>
      ) : null}

      {!isLoading && cart && cart.items.length > 0 ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {cart.items.map((item) => {
              const isPending = pendingItemId === item.id;

              return (
                <article
                  key={item.id}
                  className="grid gap-4 rounded-md border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr]"
                >
                  <Link
                    href={`/products/${item.product.id}?currency=${selectedCurrency}`}
                    className="aspect-square overflow-hidden rounded-md bg-[radial-gradient(circle_at_50%_35%,#e2e8f0_0%,#64748b_45%,#0f172a_100%)]"
                    aria-label={`${item.product.name} detayını görüntüle`}
                  >
                    {item.product.image_url ? (
                      <div
                        aria-label={item.product.name}
                        role="img"
                        className="h-full w-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${item.product.image_url})`,
                        }}
                      />
                    ) : null}
                  </Link>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wide text-blue-800">
                        {item.product.category.name}
                      </p>
                      <Link
                        href={`/products/${item.product.id}?currency=${selectedCurrency}`}
                        className="mt-1 block text-xl font-black text-slate-950 transition hover:text-blue-900"
                      >
                        {item.product.name}
                      </Link>
                      <p className="mt-2 text-sm text-slate-500">
                        Birim fiyat: {item.display_unit_price.formatted}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Stok: {item.product.stock}
                      </p>
                    </div>

                    <div className="flex flex-col items-start gap-4 sm:items-end">
                      <p className="text-2xl font-black text-blue-950">
                        {item.display_line_total.formatted}
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="flex h-11 items-center overflow-hidden rounded-md border border-slate-300">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            disabled={isPending || item.quantity <= 1}
                            className="grid h-full w-11 cursor-pointer place-items-center text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                            aria-label="Adedi azalt"
                            title="Adedi azalt"
                          >
                            <MinusIcon />
                          </button>
                          <span className="grid h-full min-w-12 place-items-center border-x border-slate-300 px-3 font-bold text-slate-950">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            disabled={isPending || item.quantity >= item.product.stock}
                            className="grid h-full w-11 cursor-pointer place-items-center text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
                            aria-label="Adedi artır"
                            title="Adedi artır"
                          >
                            <PlusIcon />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          disabled={isPending}
                          className="grid h-11 w-11 cursor-pointer place-items-center rounded-md border border-slate-300 text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                          aria-label="Ürünü sepetten kaldır"
                          title="Ürünü sepetten kaldır"
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="h-fit rounded-md border border-slate-300 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Sipariş Özeti
            </h2>

            <div className="mt-6 space-y-4 border-b border-slate-200 pb-5">
              <div className="flex items-center justify-between text-slate-600">
                <span>Toplam ürün</span>
                <span className="font-bold text-slate-950">
                  {cart.total_quantity}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Ara toplam</span>
                <span className="font-bold text-slate-950">
                  {cart.display_subtotal.formatted}
                </span>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <span className="font-bold text-slate-950">Ödenecek tutar</span>
              <span className="text-2xl font-black text-blue-950">
                {cart.display_subtotal.formatted}
              </span>
            </div>

            <Link
              href={`/checkout?currency=${selectedCurrency}`}
              className="mt-6 flex h-12 w-full cursor-pointer items-center justify-center rounded-md bg-blue-900 px-4 font-bold text-white transition hover:bg-blue-800"
            >
              Devam Et
            </Link>

            <button
              type="button"
              onClick={clearCart}
              disabled={isClearing}
              className="mt-3 h-11 w-full cursor-pointer rounded-md border border-slate-300 px-4 font-bold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Sepeti Temizle
            </button>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
