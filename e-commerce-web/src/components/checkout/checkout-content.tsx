"use client";

import { Breadcrumb } from "@/components/breadcrumb";
import type { Cart, CartResponse } from "@/types/cart";
import type { CreateOrderPayload, OrderResponse } from "@/types/order";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";

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

export function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currencyParam = searchParams.get("currency");
  const selectedCurrency: Currency = isCurrency(currencyParam)
    ? currencyParam
    : "TRY";

  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [shippingForm, setShippingForm] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    city: "",
    district: "",
    address: "",
    note: "",
  });

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

  function updateShippingField(
    field: keyof typeof shippingForm,
    value: string
  ) {
    setShippingForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function createOrder(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsCreatingOrder(true);
    setMessage(null);

    const payload: CreateOrderPayload = {
      currency: selectedCurrency,
      shipping: {
        full_name: `${shippingForm.first_name} ${shippingForm.last_name}`.trim(),
        phone: shippingForm.phone,
        city: shippingForm.city,
        district: shippingForm.district,
        address: shippingForm.address,
        note: shippingForm.note || undefined,
      },
    };

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as OrderResponse;

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (!response.ok) {
        throw new Error(result.message);
      }

      window.dispatchEvent(new Event("cart:updated"));
      router.push(`/orders/${result.data.order.id}`);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Sipariş oluşturulamadı."
      );
    } finally {
      setIsCreatingOrder(false);
    }
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div>
        <Breadcrumb
          items={[
            { label: "Sepet", href: "/cart" },
            { label: "Ödeme" },
          ]}
        />
        <h1 className="mt-4 text-4xl font-black text-slate-950">
          Güvenli Ödeme
        </h1>
      </div>

      {message ? (
        <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 font-semibold text-red-700">
          {message}
        </div>
      ) : null}

      {isLoading ? (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px]">
          <div className="h-[620px] animate-pulse rounded-md border border-slate-200 bg-white" />
          <div className="h-[520px] animate-pulse rounded-md border border-slate-200 bg-blue-100" />
        </div>
      ) : null}

      {!isLoading && cart && cart.items.length === 0 ? (
        <div className="mt-8 rounded-md border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-2xl font-black text-slate-950">
            Sepetiniz boş
          </h2>
          <p className="mx-auto mt-3 max-w-md text-slate-600">
            Sipariş oluşturmak için önce sepetinize ürün eklemelisiniz.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex h-12 cursor-pointer items-center justify-center rounded-md bg-blue-900 px-6 font-bold text-white transition hover:bg-blue-800"
          >
            Mağazaya Git
          </Link>
        </div>
      ) : null}

      {!isLoading && cart && cart.items.length > 0 ? (
        <form
          onSubmit={createOrder}
          className="mt-8 grid gap-8 lg:grid-cols-[1fr_390px]"
        >
          <div className="space-y-6">
            <div className="rounded-md border border-slate-300 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-lg font-black text-blue-950">
                  1
                </span>
                <h2 className="text-2xl font-black text-slate-950">
                  Teslimat ve Fatura Adresi
                </h2>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="shipping-first-name"
                    className="text-sm font-bold text-slate-700"
                  >
                    Ad
                  </label>
                  <input
                    id="shipping-first-name"
                    required
                    placeholder="Örn. Ahmet"
                    value={shippingForm.first_name}
                    onChange={(event) =>
                      updateShippingField("first_name", event.target.value)
                    }
                    className="mt-1 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base outline-none transition hover:border-blue-300 focus:border-blue-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shipping-last-name"
                    className="text-sm font-bold text-slate-700"
                  >
                    Soyad
                  </label>
                  <input
                    id="shipping-last-name"
                    required
                    placeholder="Örn. Yılmaz"
                    value={shippingForm.last_name}
                    onChange={(event) =>
                      updateShippingField("last_name", event.target.value)
                    }
                    className="mt-1 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base outline-none transition hover:border-blue-300 focus:border-blue-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="shipping-phone"
                    className="text-sm font-bold text-slate-700"
                  >
                    Telefon Numarası
                  </label>
                  <div className="mt-1 flex">
                    <span className="grid h-12 w-14 place-items-center rounded-l-md border border-r-0 border-slate-300 bg-blue-50 text-sm font-bold text-blue-950">
                      +90
                    </span>
                    <input
                      id="shipping-phone"
                      required
                      placeholder="5XX XXX XX XX"
                      value={shippingForm.phone}
                      onChange={(event) =>
                        updateShippingField("phone", event.target.value)
                      }
                      className="h-12 min-w-0 flex-1 rounded-r-md border border-slate-300 bg-white px-4 text-base outline-none transition hover:border-blue-300 focus:border-blue-900"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="shipping-address"
                    className="text-sm font-bold text-slate-700"
                  >
                    Adres
                  </label>
                  <textarea
                    id="shipping-address"
                    required
                    rows={4}
                    placeholder="Mahalle, sokak, no ve daire bilgilerini giriniz."
                    value={shippingForm.address}
                    onChange={(event) =>
                      updateShippingField("address", event.target.value)
                    }
                    className="mt-1 w-full resize-none rounded-md border border-slate-300 bg-white px-4 py-3 text-base outline-none transition hover:border-blue-300 focus:border-blue-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shipping-city"
                    className="text-sm font-bold text-slate-700"
                  >
                    Şehir
                  </label>
                  <input
                    id="shipping-city"
                    required
                    placeholder="İstanbul"
                    value={shippingForm.city}
                    onChange={(event) =>
                      updateShippingField("city", event.target.value)
                    }
                    className="mt-1 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base outline-none transition hover:border-blue-300 focus:border-blue-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="shipping-district"
                    className="text-sm font-bold text-slate-700"
                  >
                    İlçe
                  </label>
                  <input
                    id="shipping-district"
                    required
                    placeholder="Kadıköy"
                    value={shippingForm.district}
                    onChange={(event) =>
                      updateShippingField("district", event.target.value)
                    }
                    className="mt-1 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base outline-none transition hover:border-blue-300 focus:border-blue-900"
                  />
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="shipping-note"
                    className="text-sm font-bold text-slate-700"
                  >
                    Sipariş Notu
                  </label>
                  <textarea
                    id="shipping-note"
                    rows={3}
                    value={shippingForm.note}
                    onChange={(event) =>
                      updateShippingField("note", event.target.value)
                    }
                    className="mt-1 w-full resize-none rounded-md border border-slate-300 bg-white px-4 py-3 text-base outline-none transition hover:border-blue-300 focus:border-blue-900"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-md border border-slate-300 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-100 text-lg font-black text-blue-950">
                  2
                </span>
                <h2 className="text-2xl font-black text-slate-950">
                  Ödeme Yöntemi
                </h2>
              </div>

              <div className="mt-6 grid rounded-md bg-blue-50 p-1 sm:grid-cols-2">
                <button
                  type="button"
                  className="h-14 rounded-md border border-slate-300 bg-white font-bold text-blue-950 shadow-sm"
                >
                  Kredi / Banka Kartı
                </button>
                <button
                  type="button"
                  className="h-14 rounded-md font-bold text-slate-600 transition hover:bg-white"
                >
                  Havale / EFT
                </button>
              </div>

              <div className="mt-6 grid gap-4">
                <div>
                  <label
                    htmlFor="card-name"
                    className="text-sm font-bold text-slate-700"
                  >
                    Kart Üzerindeki İsim
                  </label>
                  <input
                    id="card-name"
                    placeholder="Ad Soyad"
                    className="mt-1 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base outline-none transition hover:border-blue-300 focus:border-blue-900"
                  />
                </div>

                <div>
                  <label
                    htmlFor="card-number"
                    className="text-sm font-bold text-slate-700"
                  >
                    Kart Numarası
                  </label>
                  <input
                    id="card-number"
                    placeholder="0000 0000 0000 0000"
                    className="mt-1 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base outline-none transition hover:border-blue-300 focus:border-blue-900"
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="card-expiry"
                      className="text-sm font-bold text-slate-700"
                    >
                      Son Kullanma
                    </label>
                    <input
                      id="card-expiry"
                      placeholder="MM / YY"
                      className="mt-1 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base outline-none transition hover:border-blue-300 focus:border-blue-900"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="card-cvv"
                      className="text-sm font-bold text-slate-700"
                    >
                      CVV
                    </label>
                    <input
                      id="card-cvv"
                      placeholder="123"
                      className="mt-1 h-12 w-full rounded-md border border-slate-300 bg-white px-4 text-base outline-none transition hover:border-blue-300 focus:border-blue-900"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-4 border-t border-slate-200 pt-5 text-xs font-bold uppercase tracking-wide text-slate-700">
                <span>SSL Secure</span>
                <span>256-bit Encryption</span>
                <span>PCI-DSS Compliant</span>
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-md border border-blue-200 bg-blue-100 p-6 shadow-sm">
            <h2 className="text-2xl font-black text-slate-950">
              Sipariş Özeti
            </h2>

            <div className="mt-6 space-y-4">
              {cart.items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  <Link
                    href={`/products/${item.product.id}?currency=${selectedCurrency}`}
                    className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-[radial-gradient(circle_at_50%_35%,#e2e8f0_0%,#64748b_45%,#0f172a_100%)]"
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
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-950">
                      {item.product.name}
                    </p>
                    <p className="mt-1 text-sm text-slate-700">
                      Adet: {item.quantity}
                    </p>
                    <p className="mt-1 font-bold text-blue-950">
                      {item.display_line_total.formatted}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-4 border-t border-blue-200 pt-6">
              <div className="flex items-center justify-between text-slate-700">
                <span>Ara Toplam</span>
                <span className="font-bold text-slate-950">
                  {cart.display_subtotal.formatted}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Kargo</span>
                <span className="font-bold text-slate-950">Ücretsiz</span>
              </div>
              <div className="flex items-center justify-between text-xl font-black text-slate-950">
                <span>Toplam</span>
                <span className="text-blue-950">
                  {cart.display_subtotal.formatted}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isCreatingOrder}
              className="mt-7 h-14 w-full cursor-pointer rounded-md bg-blue-900 px-4 text-lg font-black text-white shadow-sm transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {isCreatingOrder ? "Tamamlanıyor" : "Ödemeyi Tamamla"}
            </button>

            <p className="mt-5 text-center text-xs font-semibold leading-5 text-slate-700">
              Ödemenizi tamamlayarak Mesafeli Satış Sözleşmesi ve Kullanım
              Koşulları&apos;nı kabul etmiş olursunuz.
            </p>

            <div className="mt-6 rounded-md border border-dashed border-slate-400 p-4 text-sm font-semibold text-slate-700">
              Yardıma mı ihtiyacınız var? Müşteri hizmetlerimiz 7/24 yanınızda.
            </div>
          </aside>
        </form>
      ) : null}
    </section>
  );
}
