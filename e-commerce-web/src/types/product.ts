import type { ApiResponse } from "@/types/api";

export type ProductCategory = {
  id: number;
  name: string;
  slug: string;
};

export type DisplayPrice = {
  currency: "TRY" | "USD" | "EUR";
  amount: number;
  formatted: string;
  exchange_rate_to_try: string;
};

export type Product = {
  id: number;
  category: ProductCategory | null;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  price_try: number;
  display_price: DisplayPrice;
  stock: number;
  is_active: boolean;
};

export type ProductsResponse = ApiResponse<{
  products: Product[];
}>;

export type ProductResponse = ApiResponse<{
  product: Product;
}>;
