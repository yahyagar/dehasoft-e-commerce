<?php

use App\Models\CartItem;
use Tests\Support\ApiTestHelper;

it('adds products to the authenticated user cart', function (): void {
    ApiTestHelper::seedExchangeRates();

    $customer = ApiTestHelper::createCustomer();
    $product = ApiTestHelper::createProduct(['stock' => 5]);

    $this->postJson('/api/cart/items', [
        'product_id' => $product->id,
        'quantity' => 2,
    ], ApiTestHelper::authHeaders($customer))
        ->assertCreated()
        ->assertJsonPath('data.cart_item.quantity', 2);

    $this->assertDatabaseHas('cart_items', [
        'user_id' => $customer->id,
        'product_id' => $product->id,
        'quantity' => 2,
    ]);
});

it('rejects cart quantities above stock', function (): void {
    ApiTestHelper::seedExchangeRates();

    $customer = ApiTestHelper::createCustomer();
    $product = ApiTestHelper::createProduct(['stock' => 1]);

    $this->postJson('/api/cart/items', [
        'product_id' => $product->id,
        'quantity' => 2,
    ], ApiTestHelper::authHeaders($customer))
        ->assertStatus(422)
        ->assertJsonPath('message', 'Requested quantity exceeds product stock');
});

it('prevents users from changing another users cart item', function (): void {
    ApiTestHelper::seedExchangeRates();

    $owner = ApiTestHelper::createCustomer();
    $otherUser = ApiTestHelper::createCustomer();
    $product = ApiTestHelper::createProduct();
    $cartItem = CartItem::query()->create([
        'user_id' => $owner->id,
        'product_id' => $product->id,
        'quantity' => 1,
    ]);

    $this->putJson("/api/cart/items/{$cartItem->id}", [
        'quantity' => 2,
    ], ApiTestHelper::authHeaders($otherUser))
        ->assertNotFound()
        ->assertJsonPath('message', 'Cart item not found');
});
