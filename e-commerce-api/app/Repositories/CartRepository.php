<?php

namespace App\Repositories;

use App\Models\CartItem;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

class CartRepository
{
    /**
     * @return Collection<int, CartItem>
     */
    public function forUser(User $user): Collection
    {
        return CartItem::query()
            ->with('product.category')
            ->where('user_id', $user->id)
            ->latest()
            ->get();
    }

    public function findProductForUser(User $user, int $productId): ?CartItem
    {
        return CartItem::query()
            ->where('user_id', $user->id)
            ->where('product_id', $productId)
            ->first();
    }

    public function create(User $user, int $productId, int $quantity): CartItem
    {
        return CartItem::query()
            ->create([
                'user_id' => $user->id,
                'product_id' => $productId,
                'quantity' => $quantity,
            ])
            ->load('product.category');
    }

    public function updateQuantity(CartItem $cartItem, int $quantity): CartItem
    {
        $cartItem->update(['quantity' => $quantity]);

        return $cartItem->refresh()->load('product.category');
    }

    public function delete(CartItem $cartItem): void
    {
        $cartItem->delete();
    }

    public function clear(User $user): void
    {
        CartItem::query()
            ->where('user_id', $user->id)
            ->delete();
    }
}
