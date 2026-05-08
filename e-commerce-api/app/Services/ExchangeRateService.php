<?php

namespace App\Services;

use App\Models\ExchangeRate;
use App\Repositories\ExchangeRateRepository;
use Illuminate\Database\Eloquent\Collection;

class ExchangeRateService
{
    public const SUPPORTED_CURRENCIES = ['TRY', 'USD', 'EUR'];

    public function __construct(private readonly ExchangeRateRepository $exchangeRates)
    {
    }

    /**
     * @return Collection<int, ExchangeRate>
     */
    public function list(): Collection
    {
        return $this->exchangeRates->all();
    }

    public function getRate(string $currency): ?ExchangeRate
    {
        return $this->exchangeRates->findByCurrency($currency);
    }

    public function isSupported(string $currency): bool
    {
        return in_array(strtoupper($currency), self::SUPPORTED_CURRENCIES, true);
    }
}
