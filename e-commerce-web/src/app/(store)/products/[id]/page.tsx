import { ProductDetail } from "@/components/products/product-detail";
import { Suspense } from "react";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={null}>
      <ProductDetail productId={id} />
    </Suspense>
  );
}
