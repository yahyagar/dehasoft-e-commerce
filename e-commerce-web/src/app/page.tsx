import Link from "next/link";

const featuredProducts = [
  {
    name: "Kablosuz Mouse",
    category: "Elektronik",
    price: "249.90 TRY",
    image:
      "linear-gradient(135deg, #0f172a 0%, #164e63 55%, #e2e8f0 55%, #f8fafc 100%)",
  },
  {
    name: "Executive Smart Chrono",
    category: "Aksesuar",
    price: "1,850.00 TRY",
    image:
      "radial-gradient(circle at center, #f8fafc 0%, #cbd5e1 42%, #334155 100%)",
  },
  {
    name: "Optic Pro Series Z",
    category: "Elektronik",
    price: "7,200.00 TRY",
    image:
      "linear-gradient(160deg, #020617 0%, #0f172a 48%, #9a3412 49%, #111827 100%)",
  },
  {
    name: "Veloce Performance Run",
    category: "Spor & Outdoor",
    price: "2,450.00 TRY",
    image:
      "radial-gradient(circle at 65% 42%, #ef4444 0%, #dc2626 28%, #111827 29%, #0f172a 100%)",
  },
];

export default function Home() {
  return (
    <>
      <section className="bg-slate-950">
        <div className="mx-auto grid min-h-[520px] w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-flex bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
              Yeni sezon fırsatları
            </span>
            <h1 className="mt-6 max-w-xl text-5xl font-black leading-tight text-white sm:text-6xl">
              DehaCommerce mağaza deneyimi başladı
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
              Kategorileri keşfet, sepetini hazırla ve siparişlerini güvenli
              Next.js proxy katmanı üzerinden yönet.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex h-14 items-center justify-center rounded-md bg-blue-800 px-8 font-bold text-white transition hover:bg-blue-700"
              >
                Hemen Al
              </Link>
              <Link
                href="/orders"
                className="inline-flex h-14 items-center justify-center rounded-md border border-white/40 px-8 font-bold text-white transition hover:bg-white/10"
              >
                Siparişleri Gör
              </Link>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="min-h-80 rounded-md border border-white/10 bg-[radial-gradient(circle_at_35%_30%,#2563eb_0%,#0f172a_34%,#020617_72%)] shadow-2xl shadow-blue-950/40"
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-blue-950">
              Öne Çıkan Ürünler
            </h2>
            <p className="mt-2 text-slate-600">
              Demo vitrin için seçilmiş ürün kartları
            </p>
          </div>
          <Link href="/products" className="font-semibold text-blue-900">
            Tüm Ürünleri Gör
          </Link>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.map((product) => (
            <article
              key={product.name}
              className="overflow-hidden rounded-md border border-slate-200 bg-white"
            >
              <div
                className="aspect-[4/3]"
                style={{ background: product.image }}
              />
              <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">
                  {product.category}
                </p>
                <h3 className="mt-2 text-lg font-bold text-slate-950">
                  {product.name}
                </h3>
                <div className="mt-5 flex items-center justify-between gap-3">
                  <p className="text-xl font-bold text-blue-950">
                    {product.price}
                  </p>
                  <button className="rounded-md bg-blue-900 px-4 py-2 font-semibold text-white transition hover:bg-blue-800">
                    Hızlı Ekle
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
