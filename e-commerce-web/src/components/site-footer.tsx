import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-blue-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-5 px-4 py-10 text-center sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-bold text-blue-950">
          DehaCommerce
        </Link>
        <nav
          aria-label="Footer navigasyon"
          className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-slate-700"
        >
          <Link href="/privacy" className="transition hover:text-blue-900">
            Gizlilik Politikası
          </Link>
          <Link href="/terms" className="transition hover:text-blue-900">
            Kullanım Şartları
          </Link>
          <Link href="/help" className="transition hover:text-blue-900">
            Yardım Merkezi
          </Link>
          <Link href="/contact" className="transition hover:text-blue-900">
            Bize Ulaşın
          </Link>
        </nav>
        <p className="text-xs text-slate-600">
          © 2026 DehaCommerce. Tüm hakları saklıdır.
        </p>
      </div>
    </footer>
  );
}
