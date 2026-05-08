<?php

namespace App\Services;

use App\Exceptions\CurrencyException;

class MoneyService
{
    public function __construct(private readonly ExchangeRateService $exchangeRates)
    {
    }

    /**
     * @return array{currency: string, amount: float, formatted: string, exchange_rate_to_try: string}
     */
    public function display(int $amountTry, ?string $currency = null): array
    {
        $currency = strtoupper($currency ?: 'TRY');

        if (! $this->exchangeRates->isSupported($currency)) {
            throw new CurrencyException('Unsupported currency');
        }

        $exchangeRate = $this->exchangeRates->getRate($currency);

        if (! $exchangeRate) {
            throw new CurrencyException('Exchange rate not found', 404);
        }

        $amountTryDecimal = $amountTry / 100;
        $amount = $currency === 'TRY'
            ? $amountTryDecimal
            : $amountTryDecimal / (float) $exchangeRate->rate_to_try;

        return [
            'currency' => $currency,
            'amount' => round($amount, 2),
            'formatted' => number_format($amount, 2, '.', '').' '.$currency,
            'exchange_rate_to_try' => $exchangeRate->rate_to_try,
        ];
    }
}
