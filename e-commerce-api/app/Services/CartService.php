<?php

namespace App\Services;

use App\Exceptions\CartException;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use App\Repositories\CartRepository;
use Illuminate\Database\Eloquent\Collection;

class CartService
{
    public function __construct(private readonly CartRepository $cartItems)
    {
    }

    /**
     * @return Collection<int, CartItem>
     */
    public function getCart(User $user): Collection
    {
        return $this->cartItems->forUser($user);
    }

    public function addItem(User $user, array $data): CartItem
    {
        $product = Product::query()->findOrFail($data['product_id']);
        $this->ensureProductCanBeAdded($product);

        $existingItem = $this->cartItems->findProductForUser($user, $product->id);
        $quantity = $existingItem
            ? $existingItem->quantity + (int) $data['quantity']
            : (int) $data['quantity'];

        $this->ensureStockIsEnough($product, $quantity);

        if ($existingItem) {
            return $this->cartItems->updateQuantity($existingItem, $quantity);
        }

        return $this->cartItems->create($user, $product->id, $quantity);
    }

    public function updateItem(User $user, CartItem $cartItem, int $quantity): CartItem
    {
        $this->ensureCartItemBelongsToUser($cartItem, $user);
        $cartItem->loadMissing('product.category');
        $this->ensureProductCanBeAdded($cartItem->product);
        $this->ensureStockIsEnough($cartItem->product, $quantity);

        return $this->cartItems->updateQuantity($cartItem, $quantity);
    }

    public function removeItem(User $user, CartItem $cartItem): void
    {
        $this->ensureCartItemBelongsToUser($cartItem, $user);
        $this->cartItems->delete($cartItem);
    }

    public function clear(User $user): void
    {
        $this->cartItems->clear($user);
    }

    private function ensureProductCanBeAdded(Product $product): void
    {
        if (! $product->is_active) {
            throw new CartException('Product is not active');
        }

        if ($product->stock < 1) {
            throw new CartException('Product is out of stock');
        }
    }

    private function ensureStockIsEnough(Product $product, int $quantity): void
    {
        if ($quantity > $product->stock) {
            throw new CartException('Requested quantity exceeds product stock');
        }
    }

    private function ensureCartItemBelongsToUser(CartItem $cartItem, User $user): void
    {
        if ($cartItem->user_id !== $user->id) {
            throw new CartException('Cart item not found', 404);
        }
    }
}
