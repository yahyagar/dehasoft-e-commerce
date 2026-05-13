"use client";

import { OrderStatusBadge } from "@/components/orders/order-status";
import type { Order, OrdersResponse } from "@/types/order";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function formatTryAmount(amount: number) {
  return `${(amount / 100).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TRY`;
}

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

export function AdminOrders() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setMessage(null);

    try {
      const response = await fetch("/api/admin/orders", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const result = (await response.json()) as OrdersResponse;

      if (!response.ok) {
        throw new Error(result.message);
      }

      setOrders(result.data.orders);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Sipariş verileri yüklenirken hata oluştu."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadOrders]);

  const totalSalesTry = useMemo(() => {
    return orders.reduce((total, order) => total + order.total_try, 0);
  }, [orders]);

  const preparingCount = useMemo(() => {
    return orders.filter((order) => order.status === "hazirlaniyor").length;
  }, [orders]);

  const shippedCount = useMemo(() => {
    return orders.filter((order) => order.status === "kargoda").length;
  }, [orders]);

  const completedCount = useMemo(() => {
    return orders.filter((order) => order.status === "teslim_edildi").length;
  }, [orders]);

  const stats = [
    { title: "Toplam Sipariş", value: orders.length.toLocaleString("tr-TR") },
    { title: "Toplam Satış", value: formatTryAmount(totalSalesTry) },
    { title: "Hazırlanan", value: preparingCount.toLocaleString("tr-TR") },
    {
      title: "Kargoda / Tamamlanan",
      value: `${shippedCount.toLocaleString("tr-TR")} / ${completedCount.toLocaleString("tr-TR")}`,
    },
  ];

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
        <div>
          <h1 className="text-4xl font-black text-slate-950">
            Sipariş Listesi
          </h1>
          <p className="mt-2 text-lg text-slate-700">
            Tüm siparişleri görüntüleyin ve durumlarını yönetin.
          </p>
        </div>

        {message ? (
          <div className="mt-6 rounded-md border border-blue-200 bg-blue-50 p-4 font-semibold text-blue-900">
            {message}
          </div>
        ) : null}

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
          <table className="w-full min-w-[980px] border-collapse text-left">
            <thead className="border-b border-slate-300 bg-blue-50">
              <tr className="text-sm uppercase tracking-widest text-slate-700">
                <th className="px-6 py-5">Sipariş</th>
                <th className="px-6 py-5">Müşteri</th>
                <th className="px-6 py-5">Teslimat</th>
                <th className="px-6 py-5">Tarih</th>
                <th className="px-6 py-5">Tutar</th>
                <th className="px-6 py-5">Durum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {orders.map((order) => {
                const name = customerName(order);

                return (
                  <tr
                    key={order.id}
                    role="link"
                    tabIndex={0}
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        router.push(`/admin/orders/${order.id}`);
                      }
                    }}
                    className="cursor-pointer transition hover:bg-blue-50/50"
                  >
                    <td className="px-6 py-5 font-black text-blue-950">
                      {orderNumber(order.id)}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <span className="grid h-11 w-11 place-items-center rounded-full bg-blue-100 text-sm font-black text-blue-950">
                          {initials(name) || "M"}
                        </span>
                        <div>
                          <p className="font-black text-slate-950">{name}</p>
                          <p className="mt-1 text-xs text-slate-500">
                            {order.shipping.phone || "Telefon yok"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-slate-700">
                      <p className="font-bold text-slate-950">
                        {order.shipping.city || "-"}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {order.shipping.district || "-"}
                      </p>
                    </td>
                    <td className="px-6 py-5 text-slate-700">
                      {formatDate(order.created_at)}
                    </td>
                    <td className="px-6 py-5 text-2xl font-black text-blue-950">
                      {formatOrderTotal(order)}
                    </td>
                    <td className="px-6 py-5">
                      <OrderStatusBadge status={order.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {orders.length === 0 ? (
            <p className="p-6 font-semibold text-slate-600">
              Henüz sipariş bulunmuyor.
            </p>
          ) : null}

        </div>
      </div>
    </section>
  );
}
