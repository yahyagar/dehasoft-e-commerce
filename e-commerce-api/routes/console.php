<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('exchange-rates:sync', function () {
    $rates = app(\App\Services\ExchangeRateSyncService::class)->sync();

    $this->info('Exchange rates synced successfully.');

    $rates->each(function (\App\Models\ExchangeRate $rate): void {
        $this->line("{$rate->currency}: {$rate->rate_to_try} TRY ({$rate->rate_date->toDateString()})");
    });
})->purpose('Sync exchange rates from CurrencyApi.net');

Schedule::command('exchange-rates:sync')->daily();
