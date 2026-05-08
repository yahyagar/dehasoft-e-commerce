<?php

namespace App\Repositories;

use App\Models\ExchangeRate;
use Illuminate\Database\Eloquent\Collection;

class ExchangeRateRepository
{
    /**
     * @return Collection<int, ExchangeRate>
     */
    public function all(): Collection
    {
        return ExchangeRate::query()
            ->orderByRaw("CASE currency WHEN 'TRY' THEN 1 WHEN 'USD' THEN 2 WHEN 'EUR' THEN 3 ELSE 4 END")
            ->get();
    }

    public function findByCurrency(string $currency): ?ExchangeRate
    {
        return ExchangeRate::query()
            ->where('currency', strtoupper($currency))
            ->first();
    }
}
