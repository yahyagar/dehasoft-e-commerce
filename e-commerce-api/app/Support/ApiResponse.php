<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(array|object|null $data = null, string $message = 'Success', int $status = 200): JsonResponse
    {
        return response()->json([
            'data' => $data ?? new \stdClass(),
            'message' => $message,
        ], $status);
    }

    public static function error(string $message, int $status = 400, array|object|null $data = null): JsonResponse
    {
        return response()->json([
            'data' => $data ?? new \stdClass(),
            'message' => $message,
        ], $status);
    }
}
