<?php

use Tests\Support\ApiTestHelper;

it('blocks protected api requests without proxy secret', function (): void {
    $this->getJson('/api/products')
        ->assertForbidden()
        ->assertJsonPath('message', 'Forbidden');
});

it('allows public catalog requests with proxy secret', function (): void {
    $this->getJson('/api/products', ApiTestHelper::proxyHeaders())
        ->assertOk()
        ->assertJsonPath('message', 'Success');
});
