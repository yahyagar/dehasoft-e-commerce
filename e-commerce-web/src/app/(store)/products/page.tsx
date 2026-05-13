import { ProductsList } from "@/components/products/products-list";
import { Suspense } from "react";

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsList />
    </Suspense>
  );
}
