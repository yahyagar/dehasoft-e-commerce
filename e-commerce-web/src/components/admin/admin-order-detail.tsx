"use client";

import { OrderStatusBadge } from "@/components/orders/order-status";
import type { Order, OrderResponse, OrderStatus } from "@/types/order";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type AdminOrderDetailProps = {
  orderId: string;
};

const orderStatuses: { value: OrderStatus; label: string }[] = [
  { value: "alindi", label: "Alındı" },
  { value: "hazirlaniyor", label: "Hazırlanıyor" },
  { value: "kargoda", label: "Kargoda" },
  { value: "teslim_edildi", label: "Tamamlandı" },
];

function formatTryAmount(amount: number) {
  return `${(amount / 100).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TRY`;
}

function formatOrderTotal(order: Order) {
  return `${order.total_in_currency} ${order.currency}`;
}

function formatOrderCurrencyAmount(amountTry: number, order: Order) {
  const exchangeRate = Number(order.exchange_rate_to_try);

  if (order.currency === "TRY" || !Number.isFinite(exchangeRate) || exchangeRate <= 0) {
    return formatTryAmount(amountTry);
  }

  return `${(amountTry / 100 / exchangeRate).toFixed(2)} ${order.currency}`;
}

function orderNumber(orderId: number) {
  return `#ORD-${String(orderId).padStart(4, "0")}`;
}

function customerName(order: Order) {
  return order.shipping.full_name || "Müşteri bilgisi yok";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("tr-TR");
}

export function AdminOrderDetail({ orderId }: AdminOrderDetailProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>("alindi");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const loadOrder = useCallback(async () => {
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
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
      setSelectedStatus(result.data.order.status);
    } catch (error) {
      setOrder(null);
      setMessage(
        error instanceof Error
          ? error.message
          : "Sipariş detayı yüklenirken hata oluştu."
      );
    } finally {
      setIsLoading(false);
    }
  }, [orderId, router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrder();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOrder]);

  const itemCount = useMemo(() => {
    return order?.items.reduce((total, item) => total + item.quantity, 0) ?? 0;
  }, [order]);

  async function updateOrderStatus() {
    if (!order) {
      return;
    }

    setIsUpdatingStatus(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/orders/${order.id}/status`, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: selectedStatus }),
      });
      const result = (await response.json()) as { message?: string };

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message ?? "Sipariş durumu güncellenemedi.");
      }

      await loadOrder();
      setMessage("Sipariş durumu güncellendi.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Sipariş durumu güncellenemedi."
      );
    } finally {
      setIsUpdatingStatus(false);
    }
  }

  if (isLoading) {
    return (
      <section className="p-6 lg:p-10">
        <div className="h-96 animate-pulse rounded-md border border-slate-200 bg-white" />
      </section>
    );
  }

  if (!order) {
    return (
      <section className="p-6 lg:p-10">
        <div className="rounded-md border border-red-200 bg-red-50 p-5 font-semibold text-red-700">
          {message ?? "Sipariş bulunamadı."}
        </div>
      </section>
    );
  }

  const name = customerName(order);

  return (
    <section className="min-h-screen bg-slate-50 p-6 lg:p-10">
      <div className="flex flex-col gap-4 border-b border-slate-300 pb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <h1 className="text-3xl font-black text-slate-950">
            Sipariş {orderNumber(order.id)} Detayı
          </h1>
          <OrderStatusBadge status={order.status} />
        </div>
        <Link
          href="/admin/orders"
          className="inline-flex h-11 w-fit items-center justify-center rounded-md border border-slate-300 px-5 font-bold text-blue-950 transition hover:bg-white"
        >
          Siparişlere Dön
        </Link>
      </div>

      {message ? (
        <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4 font-semibold text-blue-900">
          {message}
        </div>
      ) : null}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-md border border-slate-300 bg-white">
            <div className="flex items-center justify-between border-b border-slate-300 px-6 py-5">
              <h2 className="text-xl font-black text-slate-950">
                Sipariş Verilen Ürünler
              </h2>
              <span className="font-bold text-slate-500">
                {itemCount} ürün
              </span>
            </div>

            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead className="bg-blue-50 text-sm uppercase tracking-wide text-slate-600">
                <tr>
                  <th className="px-6 py-4">Ürün</th>
                  <th className="px-6 py-4">Fiyat</th>
                  <th className="px-6 py-4">Adet</th>
                  <th className="px-6 py-4 text-right">Toplam</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 overflow-hidden rounded-md border border-slate-300 bg-slate-100">
                          {item.product_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.product_image_url}
                              alt={item.product_name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-black text-slate-950">
                            {item.product_name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            SKU: PR-{String(item.product_id).padStart(4, "0")}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-700">
                      {formatOrderCurrencyAmount(item.unit_price_try, order)}
                    </td>
                    <td className="px-6 py-5 font-bold text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-5 text-right font-black text-blue-950">
                      {formatOrderCurrencyAmount(item.line_total_try, order)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="rounded-md border border-slate-300 bg-white p-6">
            <h2 className="text-xl font-black text-slate-950">Sipariş Özeti</h2>
            <div className="mt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Ara Toplam</span>
                <span className="font-bold text-slate-950">
                  {formatTryAmount(order.total_try)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Kargo Ücreti</span>
                <span className="font-bold text-emerald-700">Ücretsiz</span>
              </div>
              <div className="border-t border-slate-200 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black text-slate-950">
                    Genel Toplam
                  </span>
                  <span className="text-2xl font-black text-blue-950">
                    {formatOrderTotal(order)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-md border border-blue-200 bg-blue-100 p-6">
            <h2 className="font-black text-slate-950">
              Sipariş Durumunu Güncelle
            </h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] xl:grid-cols-1">
              <select
                value={selectedStatus}
                onChange={(event) =>
                  setSelectedStatus(event.target.value as OrderStatus)
                }
                className="h-12 cursor-pointer rounded-md border border-slate-300 bg-white px-3 font-bold text-slate-800 outline-none transition focus:border-blue-900"
              >
                {orderStatuses.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={updateOrderStatus}
                disabled={isUpdatingStatus}
                className="h-12 cursor-pointer rounded-md bg-blue-900 px-6 font-black text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isUpdatingStatus ? "Güncelleniyor" : "Güncelle"}
              </button>
            </div>
          </section>

          <section className="overflow-hidden rounded-md border border-slate-300 bg-white">
            <h2 className="border-b border-slate-300 bg-blue-50 px-6 py-4 font-black uppercase tracking-wide text-slate-700">
              Müşteri Bilgileri
            </h2>
            <div className="p-6">
              <div className="flex items-center gap-4">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-blue-100 text-lg font-black text-blue-950">
                  {initials(name) || "M"}
                </span>
                <div>
                  <p className="text-lg font-black text-slate-950">{name}</p>
                  <p className="text-sm text-slate-500">Müşteri</p>
                </div>
              </div>
              <div className="mt-5 space-y-2 text-sm text-slate-700">
                <p>{order.shipping.phone || "Telefon yok"}</p>
                <p>{order.items.length} ürün kalemi</p>
                <p>Kur: {order.exchange_rate_to_try}</p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-md border border-slate-300 bg-white">
            <h2 className="border-b border-slate-300 bg-blue-50 px-6 py-4 font-black uppercase tracking-wide text-slate-700">
              Teslimat Adresi
            </h2>
            <div className="space-y-3 p-6 text-sm leading-6 text-slate-700">
              <p className="font-bold text-slate-950">
                {order.shipping.city || "-"} / {order.shipping.district || "-"}
              </p>
              <p>{order.shipping.address || "Adres bilgisi yok"}</p>
              {order.shipping.note ? (
                <p className="rounded-md bg-slate-100 p-3">
                  {order.shipping.note}
                </p>
              ) : null}
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
