import { FeaturedProducts } from "@/components/home/featured-products";
import { HeroSlider } from "@/components/home/hero-slider";
import { Suspense } from "react";

export default function Home() {
  return (
    <>
      <Suspense fallback={null}>
        <HeroSlider />
      </Suspense>

      <Suspense fallback={null}>
        <FeaturedProducts />
      </Suspense>
    </>
  );
}
