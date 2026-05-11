import Link from "next/link";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BreadcrumbProps = {
  items: BreadcrumbItem[];
};

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav aria-label="Sayfa yolu" className="flex items-center gap-2 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.href && !isLast ? (
              <Link
                href={item.href}
                className="font-medium text-slate-500 transition hover:text-blue-900"
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? "font-semibold text-slate-950" : "font-medium text-slate-500"}
              >
                {item.label}
              </span>
            )}

            {!isLast ? <span className="text-slate-400">/</span> : null}
          </div>
        );
      })}
    </nav>
  );
}
