<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->string('shipping_full_name')->nullable()->after('total_in_currency');
            $table->string('shipping_phone', 30)->nullable()->after('shipping_full_name');
            $table->string('shipping_city', 100)->nullable()->after('shipping_phone');
            $table->string('shipping_district', 100)->nullable()->after('shipping_city');
            $table->text('shipping_address')->nullable()->after('shipping_district');
            $table->text('shipping_note')->nullable()->after('shipping_address');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropColumn([
                'shipping_full_name',
                'shipping_phone',
                'shipping_city',
                'shipping_district',
                'shipping_address',
                'shipping_note',
            ]);
        });
    }
};
