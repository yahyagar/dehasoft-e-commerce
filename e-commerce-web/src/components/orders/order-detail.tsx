"use client";

import { Breadcrumb } from "@/components/breadcrumb";
import { OrderStatusBadge } from "@/components/orders/order-status";
import type { Order, OrderResponse } from "@/types/order";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type OrderDetailProps = {
  orderId: string;
};

function formatOrderTotal(order: Order) {
  return `${order.total_in_currency} ${order.currency}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

function formatOrderNumber(orderId: number) {
  return `#CP-${String(orderId).padStart(5, "0")}`;
}

function formatTryAmount(amount: number) {
  return `${(amount / 100).toFixed(2)} TRY`;
}

function formatOrderCurrencyAmount(amountTry: number, order: Order) {
  const exchangeRate = Number(order.exchange_rate_to_try);

  if (order.currency === "TRY" || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    return formatTryAmount(amountTry);
  }

  return `${(amountTry / 100 / exchangeRate).toFixed(2)} ${order.currency}`;
}

export function OrderDetail({ orderId }: OrderDetailProps) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const result = (await response.json()) as OrderResponse;

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message);
      }

      setOrder(result.data.order);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Sipariş detayı yüklenirken hata oluştu."
      );
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrder();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadOrder]);

  if (isLoading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="h-96 animate-pulse rounded-md border border-slate-200 bg-white" />
      </section>
    );
  }

  if (message || !order) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-md border border-red-200 bg-red-50 p-5 font-semibold text-red-700">
          {message ?? "Sipariş bulunamadı."}
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div>
        <Breadcrumb
          items={[
            { label: "Siparişlerim", href: "/orders" },
            { label: formatOrderNumber(order.id) },
          ]}
        />
        <div className="mt-5 grid gap-5 rounded-md border border-slate-300 bg-white p-6 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wide text-slate-700">
              Sipariş No
            </p>
            <h1 className="mt-2 text-4xl font-black text-blue-950">
              {formatOrderNumber(order.id)}
            </h1>
            <p className="mt-2 text-slate-600">
              {formatDate(order.created_at)} tarihinde oluşturuldu.
            </p>
          </div>
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_390px]">
        <div className="space-y-5">
          <div className="rounded-md border border-slate-300 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Sipariş Ürünleri
            </h2>

            <div className="mt-5 space-y-4">
              {order.items.map((item) => (
                <article
                  key={item.id}
                  className="grid gap-4 border-b border-slate-200 pb-4 last:border-b-0 last:pb-0 sm:grid-cols-[96px_1fr]"
                >
                  <Link
                    href={`/products/${item.product_id}?currency=${order.currency}`}
                    className="aspect-square overflow-hidden rounded-md bg-[radial-gradient(circle_at_50%_35%,#e2e8f0_0%,#64748b_45%,#0f172a_100%)]"
                    aria-label={`${item.product_name} detayını görüntüle`}
                  >
                    {item.product_image_url ? (
                      <div
                        aria-label={item.product_name}
                        role="img"
                        className="h-full w-full bg-cover bg-center"
                        style={{
                          backgroundImage: `url(${item.product_image_url})`,
                        }}
                      />
                    ) : null}
                  </Link>

                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <Link
                        href={`/products/${item.product_id}?currency=${order.currency}`}
                        className="block text-xl font-black text-slate-950 transition hover:text-blue-900"
                      >
                        {item.product_name}
                      </Link>
                      <p className="mt-2 text-sm text-slate-500">
                        Adet: {item.quantity}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Birim fiyat: {formatOrderCurrencyAmount(item.unit_price_try, order)}
                      </p>
                    </div>

                    <p className="text-2xl font-black text-blue-950">
                      {formatOrderCurrencyAmount(item.line_total_try, order)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-md bg-blue-900 p-7 text-white">
            <h2 className="text-3xl font-black">Alışverişe devam edin</h2>
            <p className="mt-3 max-w-2xl leading-7 text-blue-50">
              Benzer ürünleri inceleyerek sepetinizi sonraki siparişler için
              hazırlayabilirsiniz.
            </p>
            <Link
              href="/products"
              className="mt-5 inline-flex h-12 cursor-pointer items-center justify-center rounded-md bg-white px-6 font-bold text-blue-950 transition hover:bg-blue-50"
            >
              Mağazaya Git
            </Link>
          </div>
        </div>

        <aside className="h-fit space-y-5">
          <div className="rounded-md border border-blue-200 bg-blue-100 p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Sipariş Özeti
            </h2>
            <div className="mt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Toplam</span>
                <span className="text-2xl font-black text-blue-950">
                  {formatOrderTotal(order)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">TRY karşılığı</span>
                <span className="font-bold text-slate-950">
                  {formatTryAmount(order.total_try)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Kur</span>
                <span className="font-bold text-slate-950">
                  {order.exchange_rate_to_try}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-slate-300 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Teslimat Bilgileri
            </h2>
            <div className="mt-5 space-y-3 text-sm text-slate-700">
              <p className="font-bold text-slate-950">
                {order.shipping.full_name}
              </p>
              <p>{order.shipping.phone}</p>
              <p>
                {order.shipping.city} / {order.shipping.district}
              </p>
              <p className="leading-6">{order.shipping.address}</p>
              {order.shipping.note ? (
                <p className="rounded-md bg-slate-100 p-3">
                  {order.shipping.note}
                </p>
              ) : null}
            </div>
          </div>

          <div className="rounded-md border border-blue-200 bg-blue-100 p-6 text-center shadow-sm">
            <p className="text-xl font-black text-slate-950">
              Yardıma mı ihtiyacınız var?
            </p>
            <p className="mt-2 text-slate-700">
              Müşteri hizmetlerimiz 7/24 yanınızda.
            </p>
            <Link
              href="/help"
              className="mt-4 inline-block font-bold text-blue-950 underline"
            >
              Destek Merkezi
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
