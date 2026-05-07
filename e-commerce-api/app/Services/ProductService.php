<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class ProductService
{
    public function __construct(private readonly ProductRepository $products) {}

    /**
     * @param  array{category?: string|null, category_id?: int|null, active?: bool|null}  $filters
     * @return Collection<int, Product>
     */
    public function list(array $filters = []): Collection
    {
        return $this->products->all($filters);
    }

    public function create(array $data): Product
    {
        return $this->products->create($this->prepareData($data));
    }

    public function update(Product $product, array $data): Product
    {
        return $this->products->update($product, $this->prepareData($data, false));
    }

    public function delete(Product $product): void
    {
        $this->products->delete($product);
    }

    private function prepareData(array $data, bool $requireSlug = true): array
    {
        if (($requireSlug || array_key_exists('name', $data)) && empty($data['slug']) && isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        return $data;
    }
}
