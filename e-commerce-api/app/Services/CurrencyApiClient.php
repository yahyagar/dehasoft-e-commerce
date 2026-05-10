<?php

namespace App\Services;

use App\Exceptions\CurrencyException;
use Illuminate\Support\Facades\Http;

class CurrencyApiClient
{
    /**
     * @return array{base: string, updated: int|null, rates: array<string, float>}
     */
    public function latestRates(): array
    {
        $url = config('services.currency_api.url');
        $key = config('services.currency_api.key');
        $base = strtoupper((string) config('services.currency_api.base', 'USD'));
        $timeout = (int) config('services.currency_api.timeout', 10);

        if (! $key) {
            throw new CurrencyException('Currency API key is not configured', 500);
        }

        $response = Http::timeout($timeout)
            ->acceptJson()
            ->get($url, [
                'key' => $key,
                'base' => $base,
                'output' => 'json',
            ]);

        if ($response->failed()) {
            throw new CurrencyException('Currency API request failed', 502);
        }

        $payload = $response->json();

        if (! is_array($payload) || ($payload['valid'] ?? false) !== true) {
            throw new CurrencyException('Currency API returned invalid response', 502);
        }

        if (! isset($payload['rates']) || ! is_array($payload['rates'])) {
            throw new CurrencyException('Currency API rates are missing', 502);
        }

        $base = strtoupper((string) ($payload['base'] ?? $base));
        $rates = [];

        foreach ($payload['rates'] as $currency => $rate) {
            if (is_numeric($rate)) {
                $rates[strtoupper((string) $currency)] = (float) $rate;
            }
        }

        $rates[$base] = $rates[$base] ?? 1.0;

        return [
            'base' => $base,
            'updated' => isset($payload['updated']) && is_numeric($payload['updated']) ? (int) $payload['updated'] : null,
            'rates' => $rates,
        ];
    }
}
