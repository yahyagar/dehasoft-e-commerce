<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ExchangeRate;
use App\Services\ExchangeRateService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class ExchangeRateController extends Controller
{
    public function __construct(private readonly ExchangeRateService $exchangeRates)
    {
    }

    public function index(): JsonResponse
    {
        return ApiResponse::success([
            'rates' => $this->exchangeRates->list()
                ->map(fn (ExchangeRate $exchangeRate) => [
                    'currency' => $exchangeRate->currency,
                    'rate_to_try' => $exchangeRate->rate_to_try,
                    'rate_date' => $exchangeRate->rate_date->toDateString(),
                ])
                ->values(),
        ]);
    }
}
