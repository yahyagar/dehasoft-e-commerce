import { laravelProxy } from "@/lib/laravel-api";

export async function GET() {
  return laravelProxy("/categories");
}
