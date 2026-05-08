<?php

use App\Exceptions\CartException;
use App\Exceptions\CurrencyException;
use App\Support\ApiResponse;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        api: __DIR__ . '/../routes/api.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'proxy.secret' => \App\Http\Middleware\VerifyProxySecret::class,
            'admin' => \App\Http\Middleware\VerifyAdmin::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (CartException $exception, Request $request) {
            return ApiResponse::error($exception->getMessage(), $exception->status());
        });

        $exceptions->render(function (CurrencyException $exception, Request $request) {
            return ApiResponse::error($exception->getMessage(), $exception->status());
        });
    })->create();
