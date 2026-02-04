<?php

use App\Http\Controllers\Api\V1\AnthropometryController;
use App\Http\Controllers\Api\V1\Asq3Controller;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ChildController;
use App\Http\Controllers\Api\V1\FoodController;
use App\Http\Controllers\Api\V1\FoodLogController;
use App\Http\Controllers\Api\V1\NotificationController;
use App\Http\Controllers\Api\V1\PmtController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// API Version 1
Route::prefix('v1')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Authentication Routes (Public)
    |--------------------------------------------------------------------------
    */
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
    });

    /*
    |--------------------------------------------------------------------------
    | Protected Routes (Requires Authentication - Parents Only)
    |--------------------------------------------------------------------------
    */
    Route::middleware(['auth:sanctum', 'ensure.parent'])->group(function () {

        /*
        |--------------------------------------------------------------------------
        | Authentication Routes (Protected)
        |--------------------------------------------------------------------------
        */
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('refresh', [AuthController::class, 'refresh']);
            Route::get('me', [AuthController::class, 'me']);
            Route::put('profile', [AuthController::class, 'updateProfile']);
        });

        /*
        |--------------------------------------------------------------------------
        | Children Routes
        |--------------------------------------------------------------------------
        */
        Route::apiResource('children', ChildController::class)->names([
            'index' => 'api.children.index',
            'store' => 'api.children.store',
            'show' => 'api.children.show',
            'update' => 'api.children.update',
            'destroy' => 'api.children.destroy',
        ]);
        Route::get('children/{child}/summary', [ChildController::class, 'summary'])->name('api.children.summary');

        /*
        |--------------------------------------------------------------------------
        | Anthropometry Routes (Nested under Children)
        |--------------------------------------------------------------------------
        */
        Route::prefix('children/{child}')->group(function () {
            Route::get('anthropometry', [AnthropometryController::class, 'index']);
            Route::post('anthropometry', [AnthropometryController::class, 'store']);
            Route::get('anthropometry/{anthropometry}', [AnthropometryController::class, 'show']);
            Route::put('anthropometry/{anthropometry}', [AnthropometryController::class, 'update']);
            Route::delete('anthropometry/{anthropometry}', [AnthropometryController::class, 'destroy']);
            Route::get('growth-chart', [AnthropometryController::class, 'growthChart']);
        });

        /*
        |--------------------------------------------------------------------------
        | Foods Routes
        |--------------------------------------------------------------------------
        */
        Route::apiResource('foods', FoodController::class)->names([
            'index' => 'api.foods.index',
            'store' => 'api.foods.store',
            'show' => 'api.foods.show',
            'update' => 'api.foods.update',
            'destroy' => 'api.foods.destroy',
        ]);
        Route::get('foods-categories', [FoodController::class, 'categories'])->name('api.foods.categories');

        /*
        |--------------------------------------------------------------------------
        | Food Logs Routes (Nested under Children)
        |--------------------------------------------------------------------------
        */
        Route::prefix('children/{child}')->group(function () {
            Route::get('food-logs', [FoodLogController::class, 'index']);
            Route::post('food-logs', [FoodLogController::class, 'store']);
            Route::get('food-logs/{foodLog}', [FoodLogController::class, 'show']);
            Route::put('food-logs/{foodLog}', [FoodLogController::class, 'update']);
            Route::delete('food-logs/{foodLog}', [FoodLogController::class, 'destroy']);
            Route::get('nutrition-summary', [FoodLogController::class, 'nutritionSummary']);
        });

        /*
        |--------------------------------------------------------------------------
        | ASQ-3 Routes (Master Data)
        |--------------------------------------------------------------------------
        */
        Route::prefix('asq3')->group(function () {
            Route::get('domains', [Asq3Controller::class, 'domains']);
            Route::get('age-intervals', [Asq3Controller::class, 'ageIntervals']);
            Route::get('age-intervals/{interval}/questions', [Asq3Controller::class, 'questions']);
            Route::get('recommendations', [Asq3Controller::class, 'recommendations']);
        });

        /*
        |--------------------------------------------------------------------------
        | ASQ-3 Screenings Routes (Nested under Children)
        |--------------------------------------------------------------------------
        */
        Route::prefix('children/{child}/screenings')->group(function () {
            Route::get('/', [Asq3Controller::class, 'index']);
            Route::post('/', [Asq3Controller::class, 'store']);
            Route::get('{screening}', [Asq3Controller::class, 'show']);
            Route::put('{screening}', [Asq3Controller::class, 'update']);
            Route::get('{screening}/progress', [Asq3Controller::class, 'progress']);
            Route::post('{screening}/answers', [Asq3Controller::class, 'submitAnswers']);
            Route::get('{screening}/results', [Asq3Controller::class, 'results']);
        });

        /*
        |--------------------------------------------------------------------------
        | PMT Routes
        |--------------------------------------------------------------------------
        */
        Route::get('pmt/menus', [PmtController::class, 'menus']);

        Route::prefix('children/{child}')->group(function () {
            Route::get('pmt-schedules', [PmtController::class, 'schedules']);
            Route::post('pmt-schedules', [PmtController::class, 'createSchedule']);
            Route::get('pmt-progress', [PmtController::class, 'progress']);
        });

        Route::post('pmt-schedules/{schedule}/log', [PmtController::class, 'log']);
        Route::put('pmt-schedules/{schedule}/log', [PmtController::class, 'updateLog']);

        /*
        |--------------------------------------------------------------------------
        | Notifications Routes
        |--------------------------------------------------------------------------
        */
        Route::get('notifications', [NotificationController::class, 'index']);
        Route::get('notifications/unread-count', [NotificationController::class, 'unreadCount']);
        Route::put('notifications/{notification}/read', [NotificationController::class, 'markAsRead']);
        Route::post('notifications/read-all', [NotificationController::class, 'markAllAsRead']);
        Route::delete('notifications/{notification}', [NotificationController::class, 'destroy']);
    });
});
