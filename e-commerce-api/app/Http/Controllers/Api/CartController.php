<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\CartException;
use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\StoreCartItemRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Models\CartItem;
use App\Models\User;
use App\Services\CartService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class CartController extends Controller
{
    public function __construct(private readonly CartService $cart)
    {
    }

    public function index(): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        return ApiResponse::success($this->cartData($this->cart->getCart($user)));
    }

    public function store(StoreCartItemRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        try {
            $cartItem = $this->cart->addItem($user, $request->validated());
        } catch (CartException $exception) {
            return ApiResponse::error($exception->getMessage(), $exception->status());
        }

        return ApiResponse::success([
            'cart_item' => $this->cartItemData($cartItem),
        ], 'Product added to cart', 201);
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        try {
            $cartItem = $this->cart->updateItem($user, $cartItem, (int) $request->validated('quantity'));
        } catch (CartException $exception) {
            return ApiResponse::error($exception->getMessage(), $exception->status());
        }

        return ApiResponse::success([
            'cart_item' => $this->cartItemData($cartItem),
        ], 'Cart item updated');
    }

    public function destroy(CartItem $cartItem): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        try {
            $this->cart->removeItem($user, $cartItem);
        } catch (CartException $exception) {
            return ApiResponse::error($exception->getMessage(), $exception->status());
        }

        return ApiResponse::success(message: 'Cart item removed');
    }

    public function clear(): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        $this->cart->clear($user);

        return ApiResponse::success(message: 'Cart cleared');
    }

    private function cartData($cartItems): array
    {
        $items = $cartItems
            ->map(fn (CartItem $cartItem) => $this->cartItemData($cartItem))
            ->values();

        return [
            'items' => $items,
            'total_quantity' => $items->sum('quantity'),
            'subtotal' => $items->sum('line_total'),
        ];
    }

    private function cartItemData(CartItem $cartItem): array
    {
        return [
            'id' => $cartItem->id,
            'quantity' => $cartItem->quantity,
            'unit_price' => $cartItem->product->price,
            'line_total' => $cartItem->product->price * $cartItem->quantity,
            'product' => [
                'id' => $cartItem->product->id,
                'name' => $cartItem->product->name,
                'slug' => $cartItem->product->slug,
                'image_url' => $cartItem->product->image_url,
                'stock' => $cartItem->product->stock,
                'is_active' => $cartItem->product->is_active,
                'category' => [
                    'id' => $cartItem->product->category->id,
                    'name' => $cartItem->product->category->name,
                    'slug' => $cartItem->product->category->slug,
                ],
            ],
        ];
    }
}
