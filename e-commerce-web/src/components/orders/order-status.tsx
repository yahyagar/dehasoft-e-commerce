import type { OrderStatus } from "@/types/order";

const statusLabels: Record<OrderStatus, string> = {
  alindi: "Alındı",
  hazirlaniyor: "Hazırlanıyor",
  kargoda: "Kargoda",
  teslim_edildi: "Tamamlandı",
};

const statusClasses: Record<OrderStatus, string> = {
  alindi: "bg-slate-200 text-slate-800",
  hazirlaniyor: "bg-blue-100 text-blue-950",
  kargoda: "bg-slate-200 text-slate-900",
  teslim_edildi: "bg-emerald-100 text-emerald-800",
};

type OrderStatusBadgeProps = {
  status: OrderStatus;
};

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  return (
    <span
      className={`inline-flex min-w-32 items-center justify-center rounded-full px-4 py-1.5 text-sm font-bold ${statusClasses[status]}`}
    >
      {statusLabels[status]}
    </span>
  );
}

export function getOrderStatusLabel(status: OrderStatus) {
  return statusLabels[status];
}
