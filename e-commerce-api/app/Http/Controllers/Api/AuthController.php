<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Tymon\JWTAuth\Exceptions\JWTException;
use Tymon\JWTAuth\Facades\JWTAuth;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validation failed', 422, [
                'errors' => $validator->errors(),
            ]);
        }

        $user = User::create([
            'name' => $request->get('name'),
            'email' => $request->get('email'),
            'password' => Hash::make($request->get('password')),
        ]);
        $token = JWTAuth::fromUser($user);

        return ApiResponse::success([
            'user' => $this->userData($user),
            'token' => $token,
        ], 'Registration successful', 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validation failed', 422, [
                'errors' => $validator->errors(),
            ]);
        }

        try {
            $token = JWTAuth::attempt($validator->validated());

            if (! $token) {
                return ApiResponse::error('Invalid credentials', 401);
            }

            /** @var User $user */
            $user = auth('api')->user();

            return ApiResponse::success([
                'user' => $this->userData($user),
                'token' => $token,
            ], 'Login successful');
        } catch (JWTException) {
            return ApiResponse::error('Could not create token', 500);
        }
    }

    public function me(): JsonResponse
    {
        /** @var User $user */
        $user = auth('api')->user();

        return ApiResponse::success([
            'user' => $this->userData($user),
        ]);
    }

    public function logout(): JsonResponse
    {
        try {
            $token = JWTAuth::getToken();

            if (! $token) {
                return ApiResponse::error('Token not provided', 400);
            }

            JWTAuth::setToken($token)->invalidate();

            return ApiResponse::success(message: 'Logout successful');
        } catch (JWTException) {
            return ApiResponse::error('Token is invalid or expired', 401);
        }
    }


    /**
     * @return array{id: int, name: string, email: string}
     */
    private function userData(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
        ];
    }
}
