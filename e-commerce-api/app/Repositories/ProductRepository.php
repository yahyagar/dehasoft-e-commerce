<?php

namespace App\Repositories;

use App\Models\Product;
use Illuminate\Database\Eloquent\Collection;

class ProductRepository
{
    /**
     * @param  array{category?: string|null, category_id?: int|null, active?: bool|null}  $filters
     * @return Collection<int, Product>
     */
    public function all(array $filters = []): Collection
    {
        return Product::query()
            ->with('category')
            ->when($filters['category'] ?? null, function ($query, string $slug): void {
                $query->whereHas('category', fn($categoryQuery) => $categoryQuery->where('slug', $slug));
            })
            ->when($filters['category_id'] ?? null, fn($query, int $categoryId) => $query->where('category_id', $categoryId))
            ->when($filters['active'] !== null, fn($query) => $query->where('is_active', $filters['active']))
            ->latest()
            ->get();
    }

    public function create(array $data): Product
    {
        return Product::query()->create($data)->load('category');
    }

    public function update(Product $product, array $data): Product
    {
        $product->update($data);

        return $product->refresh()->load('category');
    }

    public function delete(Product $product): void
    {
        $product->delete();
    }
}
