<?php

namespace App\Http\Middleware;

use App\Support\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyProxySecret
{
    public function handle(Request $request, Closure $next): Response
    {
        $configuredSecret = config('api.proxy_secret');
        $requestSecret = (string) $request->header('Proxy-Secret-Key');

        if (! $configuredSecret) {
            return ApiResponse::error('Proxy secret is not configured', 500);
        }

        if (! hash_equals($configuredSecret, $requestSecret)) {
            return ApiResponse::error('Forbidden', 403);
        }

        return $next($request);
    }
}
