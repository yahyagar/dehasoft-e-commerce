"use client";

import { OrderStatusBadge } from "@/components/orders/order-status";
import type { Order, OrdersResponse } from "@/types/order";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

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

export function OrdersList() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active">("all");

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/orders", {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      const result = (await response.json()) as OrdersResponse;

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message);
      }

      setOrders(result.data.orders);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Siparişler yüklenirken hata oluştu."
      );
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadOrders();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadOrders]);

  const visibleOrders = useMemo(() => {
    if (statusFilter === "active") {
      return orders.filter((order) => order.status !== "teslim_edildi");
    }

    return orders;
  }, [orders, statusFilter]);

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-black text-slate-950">Siparişlerim</h1>
          <p className="mt-2 text-lg text-slate-700">
            Geçmiş ve aktif siparişlerinizi buradan takip edebilirsiniz.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`h-12 cursor-pointer rounded-md border px-6 text-lg transition ${
              statusFilter === "all"
                ? "border-blue-200 bg-blue-100 font-semibold text-blue-950"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Tüm Siparişler
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("active")}
            className={`h-12 cursor-pointer rounded-md border px-6 text-lg transition ${
              statusFilter === "active"
                ? "border-blue-200 bg-blue-100 font-semibold text-blue-950"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
            }`}
          >
            Aktifler
          </button>
        </div>
      </div>

      {message ? (
        <div className="mt-8 rounded-md border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-8 space-y-6">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-md border border-slate-200 bg-white"
            />
          ))}
        </div>
      ) : null}

      {!isLoading && !message && visibleOrders.length === 0 ? (
        <div className="mt-8 rounded-md border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-2xl font-black text-slate-950">
            Henüz siparişiniz yok
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-600">
            Sepetinizi oluşturduktan sonra siparişleriniz burada listelenecek.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-12 cursor-pointer items-center justify-center rounded-md bg-blue-900 px-6 font-bold text-white transition hover:bg-blue-800"
          >
            Mağazaya Git
          </Link>
        </div>
      ) : null}

      {!isLoading && !message && visibleOrders.length > 0 ? (
        <div className="mt-8 space-y-6">
          {visibleOrders.map((order) => (
            <article
              key={order.id}
              className="grid overflow-hidden rounded-md border border-slate-300 bg-white shadow-sm lg:grid-cols-[1fr_200px]"
            >
              <div className="grid gap-6 p-6 md:grid-cols-[1fr_1fr_1fr_170px] md:items-center">
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-700">
                    Sipariş No
                  </p>
                  <p className="mt-2 text-2xl font-black text-blue-950">
                    {formatOrderNumber(order.id)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-700">
                    Tarih
                  </p>
                  <p className="mt-2 text-lg font-medium text-slate-950">
                    {formatDate(order.created_at)}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-slate-700">
                    Toplam Tutar
                  </p>
                  <p className="mt-2 text-2xl font-black text-blue-950">
                    {formatOrderTotal(order)}
                  </p>
                </div>

                <div>
                  <OrderStatusBadge status={order.status} />
                </div>
              </div>

              <div className="grid place-items-center border-t border-slate-300 bg-blue-50 p-6 lg:border-l lg:border-t-0">
                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex h-16 w-full cursor-pointer items-center justify-center rounded-md bg-blue-900 px-5 text-xl font-bold text-white transition hover:bg-blue-800"
                >
                  Detayları Gör
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}

    </section>
  );
}
