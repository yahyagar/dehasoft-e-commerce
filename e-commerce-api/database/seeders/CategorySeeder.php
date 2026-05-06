<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Elektronik',
            'Bilgisayar & Tablet',
            'Telefon & Aksesuar',
            'Ev & Yaşam',
            'Giyim',
            'Ayakkabı & Çanta',
            'Kozmetik',
            'Spor & Outdoor',
            'Kitap & Kırtasiye',
            'Oyuncak',
        ];

        foreach ($categories as $category) {
            Category::query()->updateOrCreate(
                ['slug' => Str::slug($category)],
                ['name' => $category, 'is_active' => true]
            );
        }
    }
}
