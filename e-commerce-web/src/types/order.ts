import type { ApiResponse } from "@/types/api";

export type OrderStatus =
  | "alindi"
  | "hazirlaniyor"
  | "kargoda"
  | "teslim_edildi";

export type OrderCurrency = "TRY" | "USD" | "EUR";

export type OrderItem = {
  id: number;
  product_id: number;
  product_name: string;
  product_slug: string;
  product_image_url: string | null;
  unit_price_try: number;
  quantity: number;
  line_total_try: number;
};

export type OrderShipping = {
  full_name: string;
  phone: string;
  city: string;
  district: string;
  address: string;
  note: string | null;
};

export type Order = {
  id: number;
  status: OrderStatus;
  currency: OrderCurrency;
  exchange_rate_to_try: string;
  total_try: number;
  total_in_currency: string;
  shipping: OrderShipping;
  items: OrderItem[];
  created_at: string;
};

export type OrdersResponse = ApiResponse<{
  orders: Order[];
}>;

export type OrderResponse = ApiResponse<{
  order: Order;
}>;

export type CreateOrderPayload = {
  currency: OrderCurrency;
  shipping: {
    full_name: string;
    phone: string;
    city: string;
    district: string;
    address: string;
    note?: string;
  };
};

export type UpdateOrderStatusPayload = {
  status: OrderStatus;
};
