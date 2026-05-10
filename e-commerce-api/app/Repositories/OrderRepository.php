<?php

namespace App\Repositories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class OrderRepository
{
    /**
     * @return Collection<int, Order>
     */
    public function forUser(User $user): Collection
    {
        return Order::query()
            ->with('items')
            ->where('user_id', $user->id)
            ->latest()
            ->get();
    }

    public function create(User $user, array $orderData, array $itemsData): Order
    {
        $order = Order::query()->create([
            ...$orderData,
            'user_id' => $user->id,
        ]);

        $order->items()->createMany($itemsData);

        return $order->load('items');
    }

    public function updateStatus(Order $order, string $status): Order
    {
        $order->update(['status' => $status]);

        return $order->refresh()->load('items');
    }
}
