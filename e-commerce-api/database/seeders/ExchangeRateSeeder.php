<?php

namespace Database\Seeders;

use App\Models\ExchangeRate;
use Illuminate\Database\Seeder;

class ExchangeRateSeeder extends Seeder
{
    public function run(): void
    {
        $rates = [
            'TRY' => '1.000000',
            'USD' => '32.500000',
            'EUR' => '35.200000',
        ];

        foreach ($rates as $currency => $rateToTry) {
            ExchangeRate::query()->updateOrCreate(
                ['currency' => $currency],
                [
                    'rate_to_try' => $rateToTry,
                    'rate_date' => now()->toDateString(),
                ]
            );
        }
    }
}
