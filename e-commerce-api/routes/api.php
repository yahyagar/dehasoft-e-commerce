<?php

use App\Http\Controllers\Api\AuthController;
use App\Support\ApiResponse;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => ApiResponse::success([
    'status' => 'ok',
]));

Route::middleware('proxy.secret')->prefix('auth')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:api')->group(function () {
        Route::get('/me', [AuthController::class, 'me']);
        Route::post('/logout', [AuthController::class, 'logout']);
    });
});
