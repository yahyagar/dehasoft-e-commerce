<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cart\StoreCartItemRequest;
use App\Http\Requests\Cart\UpdateCartItemRequest;
use App\Models\CartItem;
use App\Models\User;
use App\Services\CartService;
use App\Services\MoneyService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function __construct(
        private readonly CartService $cart,
        private readonly MoneyService $money,
    )
    {
    }

    public function index(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        return ApiResponse::success($this->cartData($this->cart->getCart($user), $request->query('currency')));
    }

    public function store(StoreCartItemRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        $cartItem = $this->cart->addItem($user, $request->validated());

        return ApiResponse::success([
            'cart_item' => $this->cartItemData($cartItem),
        ], 'Product added to cart', 201);
    }

    public function update(UpdateCartItemRequest $request, CartItem $cartItem): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        $cartItem = $this->cart->updateItem($user, $cartItem, (int) $request->validated('quantity'));

        return ApiResponse::success([
            'cart_item' => $this->cartItemData($cartItem),
        ], 'Cart item updated');
    }

    public function destroy(CartItem $cartItem): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        $this->cart->removeItem($user, $cartItem);

        return ApiResponse::success(message: 'Cart item removed');
    }

    public function clear(): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        $this->cart->clear($user);

        return ApiResponse::success(message: 'Cart cleared');
    }

    private function cartData($cartItems, ?string $currency = null): array
    {
        $items = $cartItems
            ->map(fn (CartItem $cartItem) => $this->cartItemData($cartItem, $currency))
            ->values();
        $subtotalTry = $items->sum('line_total_try');

        return [
            'items' => $items,
            'total_quantity' => $items->sum('quantity'),
            'subtotal_try' => $subtotalTry,
            'display_subtotal' => $this->money->display($subtotalTry, $currency),
        ];
    }

    private function cartItemData(CartItem $cartItem, ?string $currency = null): array
    {
        $lineTotalTry = $cartItem->product->price * $cartItem->quantity;

        return [
            'id' => $cartItem->id,
            'quantity' => $cartItem->quantity,
            'unit_price_try' => $cartItem->product->price,
            'line_total_try' => $lineTotalTry,
            'display_unit_price' => $this->money->display($cartItem->product->price, $currency),
            'display_line_total' => $this->money->display($lineTotalTry, $currency),
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
