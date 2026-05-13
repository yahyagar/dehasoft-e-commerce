<?php

use App\Models\CartItem;
use App\Models\Order;
use Tests\Support\ApiTestHelper;

it('does not create an order from an empty cart', function (): void {
    ApiTestHelper::seedExchangeRates();

    $customer = ApiTestHelper::createCustomer();

    $this->postJson('/api/orders', ApiTestHelper::orderPayload(), ApiTestHelper::authHeaders($customer))
        ->assertStatus(422)
        ->assertJsonPath('message', 'Cart is empty');
});

it('creates an order from cart, decreases stock, and clears the cart', function (): void {
    ApiTestHelper::seedExchangeRates();

    $customer = ApiTestHelper::createCustomer();
    $product = ApiTestHelper::createProduct([
        'price' => 24990,
        'stock' => 5,
    ]);

    CartItem::query()->create([
        'user_id' => $customer->id,
        'product_id' => $product->id,
        'quantity' => 2,
    ]);

    $response = $this->postJson('/api/orders', ApiTestHelper::orderPayload(), ApiTestHelper::authHeaders($customer))
        ->assertCreated()
        ->assertJsonPath('data.order.status', Order::STATUS_RECEIVED)
        ->assertJsonPath('data.order.total_try', 49980);

    $orderId = $response->json('data.order.id');

    expect($product->fresh()->stock)->toBe(3);
    expect(CartItem::query()->where('user_id', $customer->id)->count())->toBe(0);

    $this->assertDatabaseHas('orders', [
        'id' => $orderId,
        'user_id' => $customer->id,
        'total_try' => 49980,
    ]);

    $this->assertDatabaseHas('order_items', [
        'order_id' => $orderId,
        'product_id' => $product->id,
        'quantity' => 2,
        'line_total_try' => 49980,
    ]);
});

it('returns only the authenticated customers orders', function (): void {
    $customer = ApiTestHelper::createCustomer();
    $otherCustomer = ApiTestHelper::createCustomer();

    $ownOrder = ApiTestHelper::createOrder($customer);
    ApiTestHelper::createOrder($otherCustomer);

    $response = $this->getJson('/api/orders', ApiTestHelper::authHeaders($customer))
        ->assertOk();

    expect(collect($response->json('data.orders'))->pluck('id')->all())
        ->toBe([$ownOrder->id]);
});

it('prevents customers from viewing other customers order detail', function (): void {
    $owner = ApiTestHelper::createCustomer();
    $otherCustomer = ApiTestHelper::createCustomer();
    $order = ApiTestHelper::createOrder($owner);

    $this->getJson("/api/orders/{$order->id}", ApiTestHelper::authHeaders($otherCustomer))
        ->assertNotFound()
        ->assertJsonPath('message', 'Order not found');
});

it('allows admins to list and update order status', function (): void {
    $admin = ApiTestHelper::createAdmin();
    $customer = ApiTestHelper::createCustomer();
    $order = ApiTestHelper::createOrder($customer);

    $this->getJson('/api/admin/orders', ApiTestHelper::authHeaders($admin))
        ->assertOk()
        ->assertJsonCount(1, 'data.orders');

    $this->putJson("/api/admin/orders/{$order->id}/status", [
        'status' => Order::STATUS_PREPARING,
    ], ApiTestHelper::authHeaders($admin))
        ->assertOk()
        ->assertJsonPath('data.order.status', Order::STATUS_PREPARING);
});
