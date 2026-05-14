<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class CustomerUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'test@dehasoft.com'],
            [
                'name' => 'Test User',
                'password' => 'password123',
                'role' => 'customer',
            ]
        );
    }
}
