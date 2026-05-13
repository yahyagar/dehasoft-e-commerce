<?php

namespace Tests\Support;

use App\Models\Category;
use App\Models\ExchangeRate;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Tymon\JWTAuth\Facades\JWTAuth;

class ApiTestHelper
{
    public static function proxyHeaders(array $headers = []): array
    {
        return [
            'Accept' => 'application/json',
            'Proxy-Secret-Key' => config('api.proxy_secret'),
            ...$headers,
        ];
    }

    public static function authHeaders(User $user, array $headers = []): array
    {
        return self::proxyHeaders([
            'Authorization' => 'Bearer '.JWTAuth::fromUser($user),
            ...$headers,
        ]);
    }

    public static function createCustomer(array $attributes = []): User
    {
        return self::createUser([
            'role' => 'customer',
            ...$attributes,
        ]);
    }

    public static function createAdmin(array $attributes = []): User
    {
        return self::createUser([
            'role' => 'admin',
            ...$attributes,
        ]);
    }

    public static function createCategory(array $attributes = []): Category
    {
        return Category::query()->create([
            'name' => 'Elektronik',
            'slug' => 'elektronik-'.fake()->unique()->numberBetween(1000, 9999),
            'description' => 'Elektronik urunler',
            'is_active' => true,
            ...$attributes,
        ]);
    }

    public static function createProduct(array $attributes = []): Product
    {
        $category = $attributes['category'] ?? self::createCategory();
        unset($attributes['category']);

        return Product::query()->create([
            'category_id' => $category->id,
            'name' => 'Kablosuz Mouse',
            'slug' => 'kablosuz-mouse-'.fake()->unique()->numberBetween(1000, 9999),
            'description' => 'Ergonomik kablosuz mouse',
            'image_url' => 'https://example.com/mouse.jpg',
            'price' => 24990,
            'stock' => 25,
            'is_active' => true,
            ...$attributes,
        ]);
    }

    public static function seedExchangeRates(): void
    {
        foreach ([
            ['currency' => 'TRY', 'rate_to_try' => '1.000000'],
            ['currency' => 'USD', 'rate_to_try' => '40.000000'],
            ['currency' => 'EUR', 'rate_to_try' => '50.000000'],
        ] as $rate) {
            ExchangeRate::query()->updateOrCreate(
                ['currency' => $rate['currency']],
                [
                    'rate_to_try' => $rate['rate_to_try'],
                    'rate_date' => now()->toDateString(),
                ],
            );
        }
    }

    public static function orderPayload(array $overrides = []): array
    {
        return [
            'currency' => 'TRY',
            'shipping' => [
                'full_name' => 'Yahya Agar',
                'phone' => '5334962131',
                'city' => 'Istanbul',
                'district' => 'Bakirkoy',
                'address' => 'Hanımelicegi sk.',
                'note' => 'Kapiya birakilmasin',
            ],
            ...$overrides,
        ];
    }

    public static function createOrder(User $user, array $attributes = []): Order
    {
        return Order::query()->create([
            'user_id' => $user->id,
            'status' => Order::STATUS_RECEIVED,
            'currency' => 'TRY',
            'exchange_rate_to_try' => '1.000000',
            'total_try' => 24990,
            'total_in_currency' => '249.90',
            'shipping_full_name' => 'Yahya Agar',
            'shipping_phone' => '5334962131',
            'shipping_city' => 'Istanbul',
            'shipping_district' => 'Bakirkoy',
            'shipping_address' => 'Hanımelicegi sk.',
            'shipping_note' => null,
            ...$attributes,
        ]);
    }

    private static function createUser(array $attributes): User
    {
        return User::query()->create([
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password' => Hash::make('password123'),
            ...$attributes,
        ]);
    }
}
