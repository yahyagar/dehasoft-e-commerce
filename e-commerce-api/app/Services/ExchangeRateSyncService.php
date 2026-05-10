<?php

namespace App\Services;

use App\Exceptions\CurrencyException;
use App\Models\ExchangeRate;
use App\Repositories\ExchangeRateRepository;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Collection;

class ExchangeRateSyncService
{
    public function __construct(
        private readonly CurrencyApiClient $client,
        private readonly ExchangeRateRepository $exchangeRates,
    ) {
    }

    /**
     * @return Collection<int, ExchangeRate>
     */
    public function sync(): Collection
    {
        $latestRates = $this->client->latestRates();
        $rates = $latestRates['rates'];
        $rateDate = $latestRates['updated']
            ? CarbonImmutable::createFromTimestamp($latestRates['updated'])->toDateString()
            : now()->toDateString();

        if (! isset($rates['TRY']) || $rates['TRY'] <= 0) {
            throw new CurrencyException('TRY rate is missing from Currency API response', 502);
        }

        $syncedRates = new Collection();

        foreach (ExchangeRateService::SUPPORTED_CURRENCIES as $currency) {
            if (! isset($rates[$currency]) || $rates[$currency] <= 0) {
                throw new CurrencyException("{$currency} rate is missing from Currency API response", 502);
            }

            $rateToTry = $rates['TRY'] / $rates[$currency];

            $syncedRates->push($this->exchangeRates->updateOrCreate(
                $currency,
                number_format($rateToTry, 6, '.', ''),
                $rateDate,
            ));
        }

        return $syncedRates;
    }
}
