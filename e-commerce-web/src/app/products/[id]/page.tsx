import { ProductDetail } from "@/components/products/product-detail";

type ProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { id } = await params;

  return <ProductDetail productId={id} />;
}
