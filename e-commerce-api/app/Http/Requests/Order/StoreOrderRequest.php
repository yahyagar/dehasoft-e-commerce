<?php

namespace App\Http\Requests\Order;

use App\Services\ExchangeRateService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'currency' => ['required', 'string', Rule::in(ExchangeRateService::SUPPORTED_CURRENCIES)],
            'shipping' => ['required', 'array'],
            'shipping.full_name' => ['required', 'string', 'max:255'],
            'shipping.phone' => ['required', 'string', 'max:30'],
            'shipping.city' => ['required', 'string', 'max:100'],
            'shipping.district' => ['required', 'string', 'max:100'],
            'shipping.address' => ['required', 'string', 'max:1000'],
            'shipping.note' => ['nullable', 'string', 'max:1000'],
        ];
    }

}
