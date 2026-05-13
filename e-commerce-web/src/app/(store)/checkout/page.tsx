import { CheckoutContent } from "@/components/checkout/checkout-content";
import { Suspense } from "react";

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutContent />
    </Suspense>
  );
}
