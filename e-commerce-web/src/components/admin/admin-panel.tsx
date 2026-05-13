"use client";

import { OrderStatusBadge } from "@/components/orders/order-status";
import type { Order, OrdersResponse } from "@/types/order";
import type { Product, ProductsResponse } from "@/types/product";
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

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toLocaleUpperCase("tr-TR");
}

function uniqueCustomerCount(orders: Order[]) {
  return new Set(
    orders
      .map((order) =>
        (order.shipping.full_name ?? "").trim().toLocaleLowerCase("tr-TR")
      )
      .filter(Boolean)
  ).size;
}

export function AdminPanel() {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadDashboardData = useCallback(async () => {
    setMessage(null);

    try {
      const [productsResponse, ordersResponse] = await Promise.all([
        fetch("/api/products?currency=TRY", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        }),
        fetch("/api/admin/orders", {
          headers: { Accept: "application/json" },
          cache: "no-store",
        }),
      ]);

      const productsData = (await productsResponse.json()) as ProductsResponse;
      const ordersData = (await ordersResponse.json()) as OrdersResponse;

      if (!productsResponse.ok) {
        throw new Error(productsData.message);
      }

      if (!ordersResponse.ok) {
        throw new Error(ordersData.message);
      }

      setProducts(productsData.data.products);
      setOrders(ordersData.data.orders);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Admin verileri yüklenirken hata oluştu."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadDashboardData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadDashboardData]);

  const totalSalesTry = useMemo(() => {
    return orders.reduce((total, order) => total + order.total_try, 0);
  }, [orders]);

  const activeProducts = useMemo(() => {
    return products.filter((product) => product.is_active).length;
  }, [products]);

  const totalStock = useMemo(() => {
    return products.reduce((total, product) => total + product.stock, 0);
  }, [products]);

  const latestOrders = useMemo(() => {
    return orders.slice(0, 5);
  }, [orders]);

  const stats = [
    {
      title: "Toplam Satış",
      value: formatTryAmount(totalSalesTry),
      label: "TL",
    },
    {
      title: "Toplam Sipariş",
      value: orders.length.toLocaleString("tr-TR"),
      label: "SP",
    },
    {
      title: "Aktif Ürün",
      value: activeProducts.toLocaleString("tr-TR"),
      label: "ÜR",
    },
    {
      title: "Toplam Stok",
      value: totalStock.toLocaleString("tr-TR"),
      label: "ST",
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
    <section id="dashboard" className="min-h-screen bg-slate-50">
      <div className="p-6 lg:p-10">
        <div>
          <h1 className="text-4xl font-black text-slate-950">
            Hoş Geldiniz, Admin
          </h1>
          <p className="mt-2 text-xl text-slate-700">
            İşletmenizin güncel sipariş ve ürün özeti.
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
              className="rounded-md border border-slate-300 bg-white p-7"
            >
              <div className="grid h-16 w-16 place-items-center rounded-md bg-blue-100 text-lg font-black text-blue-950">
                {stat.label}
              </div>
              <p className="mt-6 text-sm font-bold uppercase tracking-widest text-slate-700">
                {stat.title}
              </p>
              <p className="mt-4 text-3xl font-black text-slate-950">
                {stat.value}
              </p>
            </article>
          ))}
        </div>

        <div
          id="orders"
          className="mt-8 rounded-md border border-slate-300 bg-white"
        >
          <div className="flex items-center justify-between border-b border-slate-200 p-6">
            <div>
              <h2 className="text-2xl font-black text-slate-950">
                Son Siparişler
              </h2>
              <p className="mt-1 text-sm text-slate-600">
                {uniqueCustomerCount(orders)} müşteri, {orders.length} sipariş
              </p>
            </div>
            <span className="font-bold text-blue-950">
              {orders.length} kayıt
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left">
              <thead>
                <tr className="bg-blue-50 text-sm uppercase tracking-wide text-slate-700">
                  <th className="px-6 py-4">Sipariş No</th>
                  <th className="px-6 py-4">Müşteri</th>
                  <th className="px-6 py-4">Tarih</th>
                  <th className="px-6 py-4">Tutar</th>
                  <th className="px-6 py-4">Durum</th>
                </tr>
              </thead>
              <tbody>
                {latestOrders.map((order) => {
                  const customerName = order.shipping.full_name || "Müşteri";

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-slate-200 last:border-b-0"
                    >
                      <td className="px-6 py-6 font-black text-blue-950">
                        {orderNumber(order.id)}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center gap-4">
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-sm font-black text-blue-950">
                            {initials(customerName)}
                          </span>
                          <span className="font-semibold text-slate-950">
                            {customerName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-6 text-slate-700">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-6 font-bold text-slate-950">
                        {formatOrderTotal(order)}
                      </td>
                      <td className="px-6 py-6">
                        <OrderStatusBadge status={order.status} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {latestOrders.length === 0 ? (
            <p className="p-6 font-semibold text-slate-600">
              Aramaya uygun sipariş bulunamadı.
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
