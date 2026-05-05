<?php

namespace App\Support;

use Illuminate\Http\JsonResponse;

class ApiResponse
{ //fix api response
    public static function success(array|object|null $data = null, string $message = 'Success', int $status = 200): JsonResponse
    { //fix api response
        return response()->json([
            'data' => $data ?? new \stdClass(),
            'message' => $message,
        ], $status);
    }

    public static function error(string $message, int $status = 400, array|object|null $data = null): JsonResponse
    { //fix api response
        return response()->json([
            'data' => $data ?? new \stdClass(),
            'message' => $message,
        ], $status);
    }
}
