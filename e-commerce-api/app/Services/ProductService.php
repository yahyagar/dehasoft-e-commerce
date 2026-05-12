<?php

namespace App\Services;

use App\Models\Product;
use App\Repositories\ProductRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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
        $oldImageUrl = $product->image_url;
        $storedImagePath = null;

        try {
            $preparedData = $this->prepareData($data, false, $storedImagePath);
            $updatedProduct = $this->products->update($product, $preparedData);

            if ($storedImagePath && $oldImageUrl) {
                $this->deletePublicImage($oldImageUrl);
            }

            return $updatedProduct;
        } catch (\Throwable $exception) {
            if ($storedImagePath) {
                Storage::disk('public')->delete($storedImagePath);
            }

            throw $exception;
        }
    }

    public function delete(Product $product): void
    {
        $this->products->delete($product);
    }

    private function prepareData(array $data, bool $requireSlug = true, ?string &$storedImagePath = null): array
    {
        if (($requireSlug || array_key_exists('name', $data)) && empty($data['slug']) && isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        if (($data['image'] ?? null) instanceof UploadedFile) {
            $storedImagePath = $data['image']->store('products', 'public');
            $data['image_url'] = Storage::disk('public')->url($storedImagePath);
        }

        unset($data['image']);

        return $data;
    }

    private function deletePublicImage(string $imageUrl): void
    {
        $storagePrefix = '/storage/';
        $pathStart = strpos($imageUrl, $storagePrefix);

        if ($pathStart === false) {
            return;
        }

        $path = substr($imageUrl, $pathStart + strlen($storagePrefix));

        if ($path !== false && $path !== '') {
            Storage::disk('public')->delete($path);
        }
    }
}
