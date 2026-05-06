<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::query()->updateOrCreate(
            ['email' => 'admin@dehasoft.com'],
            [
                'name' => 'Admin User',
                'password' => 'password123',
                'role' => 'admin',
            ]
        );
    }
}
