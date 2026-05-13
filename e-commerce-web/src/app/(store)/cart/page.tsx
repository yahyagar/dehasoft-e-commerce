import { CartContent } from "@/components/cart/cart-content";
import { Suspense } from "react";

export default function CartPage() {
  return (
    <Suspense fallback={null}>
      <CartContent />
    </Suspense>
  );
}
