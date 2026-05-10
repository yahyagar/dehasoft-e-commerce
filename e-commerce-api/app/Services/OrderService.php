<?php

namespace App\Services;

use App\Exceptions\CurrencyException;
use App\Exceptions\OrderException;
use App\Models\CartItem;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Repositories\CartRepository;
use App\Repositories\OrderRepository;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class OrderService
{
    public function __construct(
        private readonly CartRepository $cartItems,
        private readonly OrderRepository $orders,
        private readonly ExchangeRateService $exchangeRates,
    ) {
    }

    /**
     * @return Collection<int, Order>
     */
    public function listForUser(User $user): Collection
    {
        return $this->orders->forUser($user);
    }

    public function createFromCart(User $user, string $currency): Order
    {
        $currency = strtoupper($currency);

        if (! $this->exchangeRates->isSupported($currency)) {
            throw new CurrencyException('Unsupported currency');
        }

        $exchangeRate = $this->exchangeRates->getRate($currency);

        if (! $exchangeRate) {
            throw new CurrencyException('Exchange rate not found', 404);
        }

        return DB::transaction(function () use ($user, $currency, $exchangeRate): Order {
            $cartItems = $this->cartItems->forUser($user);

            if ($cartItems->isEmpty()) {
                throw new OrderException('Cart is empty');
            }

            $itemsData = [];
            $totalTry = 0;

            foreach ($cartItems as $cartItem) {
                $product = Product::query()
                    ->whereKey($cartItem->product_id)
                    ->lockForUpdate()
                    ->firstOrFail();

                $this->ensureProductCanBeOrdered($product, $cartItem);

                $lineTotalTry = $product->price * $cartItem->quantity;
                $totalTry += $lineTotalTry;

                $itemsData[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'product_slug' => $product->slug,
                    'product_image_url' => $product->image_url,
                    'unit_price_try' => $product->price,
                    'quantity' => $cartItem->quantity,
                    'line_total_try' => $lineTotalTry,
                ];

                $product->decrement('stock', $cartItem->quantity);
            }

            $order = $this->orders->create($user, [
                'status' => Order::STATUS_RECEIVED,
                'currency' => $currency,
                'exchange_rate_to_try' => $exchangeRate->rate_to_try,
                'total_try' => $totalTry,
                'total_in_currency' => $this->convertFromTry($totalTry, $currency, (float) $exchangeRate->rate_to_try),
            ], $itemsData);

            $this->cartItems->clear($user);

            return $order;
        });
    }

    public function ensureUserCanView(Order $order, User $user): void
    {
        if ($order->user_id !== $user->id && ! $user->isAdmin()) {
            throw new OrderException('Order not found', 404);
        }
    }

    public function updateStatus(Order $order, string $status): Order
    {
        return $this->orders->updateStatus($order, $status);
    }

    private function ensureProductCanBeOrdered(Product $product, CartItem $cartItem): void
    {
        if (! $product->is_active) {
            throw new OrderException("Product {$product->name} is not active");
        }

        if ($product->stock < $cartItem->quantity) {
            throw new OrderException("Product {$product->name} does not have enough stock");
        }
    }

    private function convertFromTry(int $amountTry, string $currency, float $rateToTry): float
    {
        $amountTryDecimal = $amountTry / 100;
        $amount = $currency === 'TRY'
            ? $amountTryDecimal
            : $amountTryDecimal / $rateToTry;

        return round($amount, 2);
    }
}
