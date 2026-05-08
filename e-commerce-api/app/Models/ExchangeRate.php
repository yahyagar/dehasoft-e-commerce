<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['currency', 'rate_to_try', 'rate_date'])]
class ExchangeRate extends Model
{
    protected function casts(): array
    {
        return [
            'rate_to_try' => 'decimal:6',
            'rate_date' => 'date',
        ];
    }
}
