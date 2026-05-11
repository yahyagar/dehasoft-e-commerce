import type { ApiResponse } from "@/types/api";

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active?: boolean;
};

export type CategoriesResponse = ApiResponse<{
  categories: Category[];
}>;
