"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const slides = [
  {
    eyebrow: "Yeni sezon fırsatları",
    title: "DehaCommerce mağaza deneyimi başladı",
    description:
      "Kategorileri keşfet, sepetini hazırla ve siparişlerini güvenli Next.js proxy katmanı üzerinden yönet.",
    primaryLabel: "Hemen Al",
    visualClass:
      "bg-[radial-gradient(circle_at_35%_30%,#2563eb_0%,#0f172a_34%,#020617_72%)]",
  },
  {
    eyebrow: "Çoklu para birimi desteği",
    title: "TRY, USD ve EUR ile alışverişi takip et",
    description:
      "Ürün fiyatlarını seçtiğin para biriminde görüntüle, sepet ve sipariş toplamlarını aynı akışta kontrol et.",
    primaryLabel: "Ürünleri Keşfet",
    visualClass:
      "bg-[radial-gradient(circle_at_72%_34%,#facc15_0%,#1d4ed8_26%,#0f172a_55%,#020617_82%)]",
  },
] as const;

export function HeroSlider() {
  const searchParams = useSearchParams();
  const [activeIndex, setActiveIndex] = useState(0);
  const activeSlide = slides[activeIndex];
  const currency = searchParams.get("currency");
  const productsHref = currency ? `/products?currency=${currency}` : "/products";

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) =>
        currentIndex === slides.length - 1 ? 0 : currentIndex + 1
      );
    }, 6000);

    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="bg-slate-950">
      <div className="mx-auto grid min-h-[520px] w-full max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="max-w-2xl">
          <span className="inline-flex bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-widest text-white">
            {activeSlide.eyebrow}
          </span>
          <h1 className="mt-6 max-w-xl text-5xl font-black leading-tight text-white sm:text-6xl">
            {activeSlide.title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200">
            {activeSlide.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href={productsHref}
              className="inline-flex h-14 items-center justify-center rounded-md bg-blue-800 px-8 font-bold text-white transition hover:bg-blue-700"
            >
              {activeSlide.primaryLabel}
            </Link>
          </div>

          <div className="mt-8 flex items-center gap-3">
            {slides.map((slide, index) => (
              <button
                key={slide.title}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`h-2.5 cursor-pointer rounded-full transition ${
                  activeIndex === index
                    ? "w-8 bg-white"
                    : "w-2.5 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`${index + 1}. slayta geç`}
                aria-current={activeIndex === index}
              />
            ))}
          </div>
        </div>

        <div className="relative">
          <div
            aria-label={activeSlide.title}
            role="img"
            className={`min-h-80 rounded-md border border-white/10 shadow-2xl shadow-blue-950/40 transition ${activeSlide.visualClass}`}
          >
            <div className="h-full min-h-80 rounded-md bg-[linear-gradient(135deg,transparent_0%,rgba(255,255,255,0.08)_48%,transparent_49%)]" />
          </div>
        </div>
      </div>
    </section>
  );
}
