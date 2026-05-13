<?php

use Tests\Support\ApiTestHelper;

it('registers users as customers and returns a token', function (): void {
    $this->postJson('/api/auth/register', [
        'name' => 'Yeni Kullanici',
        'email' => 'yeni@dehasoft.test',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ], ApiTestHelper::proxyHeaders())
        ->assertCreated()
        ->assertJsonPath('data.user.role', 'customer')
        ->assertJsonStructure([
            'data' => [
                'user' => ['id', 'name', 'email', 'role'],
                'token',
            ],
            'message',
        ]);
});

it('logs in existing users and returns their role', function (): void {
    ApiTestHelper::createAdmin([
        'email' => 'admin@dehasoft.test',
    ]);

    $this->postJson('/api/auth/login', [
        'email' => 'admin@dehasoft.test',
        'password' => 'password123',
    ], ApiTestHelper::proxyHeaders())
        ->assertOk()
        ->assertJsonPath('data.user.role', 'admin')
        ->assertJsonStructure(['data' => ['token']]);
});

it('prevents customers from admin product management', function (): void {
    ApiTestHelper::seedExchangeRates();

    $customer = ApiTestHelper::createCustomer();
    $category = ApiTestHelper::createCategory();

    $this->postJson('/api/products', [
        'category_id' => $category->id,
        'name' => 'Admin Only Product',
        'price' => 1000,
        'stock' => 10,
        'is_active' => true,
    ], ApiTestHelper::authHeaders($customer))
        ->assertForbidden()
        ->assertJsonPath('message', 'Forbidden');
});
