<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Product\StoreProductRequest;
use App\Http\Requests\Product\UpdateProductRequest;
use App\Models\Product;
use App\Services\ProductService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function __construct(private readonly ProductService $products)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $products = $this->products->list([
            'category' => $request->query('category'),
            'category_id' => $request->integer('category_id') ?: null,
            'active' => $request->has('active') ? $request->boolean('active') : null,
        ]);

        return ApiResponse::success([
            'products' => $products->map(fn (Product $product) => $this->productData($product))->values(),
        ]);
    }

    public function show(Product $product): JsonResponse
    {
        return ApiResponse::success([
            'product' => $this->productData($product->load('category')),
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = $this->products->create($request->validated());

        return ApiResponse::success([
            'product' => $this->productData($product),
        ], 'Product created successfully', 201);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product = $this->products->update($product, $request->validated());

        return ApiResponse::success([
            'product' => $this->productData($product),
        ], 'Product updated successfully');
    }

    public function destroy(Product $product): JsonResponse
    {
        $this->products->delete($product);

        return ApiResponse::success(message: 'Product deleted successfully');
    }

    private function productData(Product $product): array
    {
        return [
            'id' => $product->id,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'image_url' => $product->image_url,
            'price' => $product->price,
            'stock' => $product->stock,
            'is_active' => $product->is_active,
        ];
    }
}
