<?php

use Tests\Support\ApiTestHelper;

it('allows admins to create update and delete products', function (): void {
    ApiTestHelper::seedExchangeRates();

    $admin = ApiTestHelper::createAdmin();
    $category = ApiTestHelper::createCategory();

    $createResponse = $this->postJson('/api/products', [
        'category_id' => $category->id,
        'name' => 'Test Kulaklik',
        'description' => 'Bluetooth kulaklik',
        'price' => 250000,
        'stock' => 20,
        'is_active' => true,
    ], ApiTestHelper::authHeaders($admin))
        ->assertCreated()
        ->assertJsonPath('data.product.name', 'Test Kulaklik');

    $productId = $createResponse->json('data.product.id');

    $this->putJson("/api/products/{$productId}", [
        'name' => 'Test Kulaklik Guncel',
        'stock' => 15,
    ], ApiTestHelper::authHeaders($admin))
        ->assertOk()
        ->assertJsonPath('data.product.name', 'Test Kulaklik Guncel')
        ->assertJsonPath('data.product.stock', 15);

    $this->deleteJson("/api/products/{$productId}", [], ApiTestHelper::authHeaders($admin))
        ->assertOk()
        ->assertJsonPath('message', 'Product deleted successfully');

    $this->assertDatabaseMissing('products', [
        'id' => $productId,
    ]);
});

it('hides inactive products from the public active listing', function (): void {
    ApiTestHelper::seedExchangeRates();

    ApiTestHelper::createProduct([
        'name' => 'Aktif Urun',
        'slug' => 'aktif-urun',
        'is_active' => true,
    ]);

    ApiTestHelper::createProduct([
        'name' => 'Pasif Urun',
        'slug' => 'pasif-urun',
        'is_active' => false,
    ]);

    $response = $this->getJson('/api/products?active=true', ApiTestHelper::proxyHeaders())
        ->assertOk();

    expect(collect($response->json('data.products'))->pluck('name')->all())
        ->toContain('Aktif Urun')
        ->not->toContain('Pasif Urun');
});
