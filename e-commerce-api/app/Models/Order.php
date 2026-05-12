<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'user_id',
    'status',
    'currency',
    'exchange_rate_to_try',
    'total_try',
    'total_in_currency',
    'shipping_full_name',
    'shipping_phone',
    'shipping_city',
    'shipping_district',
    'shipping_address',
    'shipping_note',
])]
class Order extends Model
{
    use HasFactory;

    public const STATUS_RECEIVED = 'alindi';
    public const STATUS_PREPARING = 'hazirlaniyor';
    public const STATUS_SHIPPED = 'kargoda';
    public const STATUS_DELIVERED = 'teslim_edildi';

    public const STATUSES = [
        self::STATUS_RECEIVED,
        self::STATUS_PREPARING,
        self::STATUS_SHIPPED,
        self::STATUS_DELIVERED,
    ];

    protected function casts(): array
    {
        return [
            'user_id' => 'integer',
            'exchange_rate_to_try' => 'decimal:6',
            'total_try' => 'integer',
            'total_in_currency' => 'decimal:2',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
