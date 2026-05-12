<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Order\StoreOrderRequest;
use App\Http\Requests\Order\UpdateOrderStatusRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Services\OrderService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orders)
    {
    }

    public function index(): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        return ApiResponse::success([
            'orders' => $this->orders
                ->listForUser($user)
                ->map(fn (Order $order) => $this->orderData($order))
                ->values(),
        ]);
    }

    public function store(StoreOrderRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        $order = $this->orders->createFromCart($user, $request->validated());

        return ApiResponse::success([
            'order' => $this->orderData($order),
        ], 'Order created successfully', 201);
    }

    public function show(Order $order): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        $this->orders->ensureUserCanView($order, $user);

        return ApiResponse::success([
            'order' => $this->orderData($order->load('items')),
        ]);
    }

    public function updateStatus(UpdateOrderStatusRequest $request, Order $order): JsonResponse
    {
        $order = $this->orders->updateStatus($order, $request->validated('status'));

        return ApiResponse::success([
            'order' => $this->orderData($order),
        ], 'Order status updated');
    }

    private function orderData(Order $order): array
    {
        return [
            'id' => $order->id,
            'status' => $order->status,
            'currency' => $order->currency,
            'exchange_rate_to_try' => $order->exchange_rate_to_try,
            'total_try' => $order->total_try,
            'total_in_currency' => $order->total_in_currency,
            'shipping' => [
                'full_name' => $order->shipping_full_name,
                'phone' => $order->shipping_phone,
                'city' => $order->shipping_city,
                'district' => $order->shipping_district,
                'address' => $order->shipping_address,
                'note' => $order->shipping_note,
            ],
            'items' => $order->items
                ->map(fn (OrderItem $item) => $this->orderItemData($item))
                ->values(),
            'created_at' => $order->created_at,
        ];
    }

    private function orderItemData(OrderItem $item): array
    {
        return [
            'id' => $item->id,
            'product_id' => $item->product_id,
            'product_name' => $item->product_name,
            'product_slug' => $item->product_slug,
            'product_image_url' => $item->product_image_url,
            'unit_price_try' => $item->unit_price_try,
            'quantity' => $item->quantity,
            'line_total_try' => $item->line_total_try,
        ];
    }
}
