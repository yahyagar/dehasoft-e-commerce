import type { ApiResponse } from "@/types/api";
import type { DisplayPrice, ProductCategory } from "@/types/product";

export type CartProduct = {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  stock: number;
  is_active: boolean;
  category: ProductCategory;
};

export type CartItem = {
  id: number;
  quantity: number;
  unit_price_try: number;
  line_total_try: number;
  display_unit_price: DisplayPrice;
  display_line_total: DisplayPrice;
  product: CartProduct;
};

export type Cart = {
  items: CartItem[];
  total_quantity: number;
  subtotal_try: number;
  display_subtotal: DisplayPrice;
};

export type CartResponse = ApiResponse<Cart>;

export type CartItemResponse = ApiResponse<{
  cart_item: CartItem;
}>;
