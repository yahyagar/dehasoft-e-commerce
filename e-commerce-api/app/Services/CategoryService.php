<?php

namespace App\Services;

use App\Models\Category;
use App\Repositories\CategoryRepository;
use Illuminate\Database\Eloquent\Collection;

class CategoryService
{
    public function __construct(private readonly CategoryRepository $categories)
    {
    }

    /**
     * @return Collection<int, Category>
     */
    public function listActive(): Collection
    {
        return $this->categories->active();
    }
}
