<?php

namespace Tests\Feature\Api\V1;

use App\Models\Child;
use App\Models\Food;
use App\Models\FoodLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FoodLogTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T053: Test list food logs
     */
    public function test_list_food_logs_returns_200(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        FoodLog::factory()->count(3)->for($child)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/food-logs");

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    /**
     * T054: Test list food logs for non-owned child
     */
    public function test_list_food_logs_for_non_owned_child_returns_403(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/food-logs");

        $response->assertForbidden();
    }

    public function test_list_food_logs_requires_authentication(): void
    {
        $child = Child::factory()->create();

        $response = $this->getJson("/api/v1/children/{$child->id}/food-logs");

        $response->assertUnauthorized();
    }

    /**
     * T055: Test create food log
     */
    public function test_create_food_log_returns_201(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $food = Food::factory()->create(['is_system' => true, 'created_by' => null, 'is_active' => true]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/children/{$child->id}/food-logs", [
            'log_date' => now()->format('Y-m-d'),
            'meal_time' => 'breakfast',
            'items' => [
                ['food_id' => $food->id, 'quantity' => 1],
            ],
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('food_logs', [
            'child_id' => $child->id,
            'meal_time' => 'breakfast',
        ]);
    }

    /**
     * T056: Test create food log with items
     */
    public function test_create_food_log_with_multiple_items(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $foods = Food::factory()->count(3)->create(['is_system' => true, 'created_by' => null, 'is_active' => true]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/children/{$child->id}/food-logs", [
            'log_date' => now()->format('Y-m-d'),
            'meal_time' => 'lunch',
            'items' => [
                ['food_id' => $foods[0]->id, 'quantity' => 1],
                ['food_id' => $foods[1]->id, 'quantity' => 2],
                ['food_id' => $foods[2]->id, 'quantity' => 0.5],
            ],
        ]);

        $response->assertCreated();
    }

    /**
     * T057: Test create food log validation
     */
    public function test_create_food_log_requires_meal_time(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $food = Food::factory()->create(['is_system' => true, 'created_by' => null, 'is_active' => true]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/children/{$child->id}/food-logs", [
            'log_date' => now()->format('Y-m-d'),
            'items' => [
                ['food_id' => $food->id, 'quantity' => 1],
            ],
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['meal_time']);
    }

    public function test_create_food_log_validates_meal_time_enum(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $food = Food::factory()->create(['is_system' => true, 'created_by' => null, 'is_active' => true]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/children/{$child->id}/food-logs", [
            'log_date' => now()->format('Y-m-d'),
            'meal_time' => 'invalid_meal_time',
            'items' => [
                ['food_id' => $food->id, 'quantity' => 1],
            ],
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['meal_time']);
    }

    /**
     * T058: Test get food log
     */
    public function test_get_food_log_returns_200(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $foodLog = FoodLog::factory()->for($child)->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/food-logs/{$foodLog->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'food_log' => ['id', 'log_date', 'meal_time'],
            ]);
    }

    /**
     * T059: Test update food log
     */
    public function test_update_food_log_returns_200(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $foodLog = FoodLog::factory()->for($child)->create(['meal_time' => 'breakfast']);
        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/children/{$child->id}/food-logs/{$foodLog->id}", [
            'meal_time' => 'lunch',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('food_logs', [
            'id' => $foodLog->id,
            'meal_time' => 'lunch',
        ]);
    }

    /**
     * T060: Test delete food log
     */
    public function test_delete_food_log_returns_200(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $foodLog = FoodLog::factory()->for($child)->create();
        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/v1/children/{$child->id}/food-logs/{$foodLog->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('food_logs', [
            'id' => $foodLog->id,
        ]);
    }

    /**
     * T061: Test nutrition summary
     */
    public function test_nutrition_summary_returns_data(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/nutrition-summary");

        $response->assertOk()
            ->assertJsonStructure([
                'totals',
            ]);
    }

    /**
     * T062: Test nutrition summary with date filter
     */
    public function test_nutrition_summary_with_date_filter(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/nutrition-summary?date=".now()->format('Y-m-d'));

        $response->assertOk();
    }

    /**
     * T063: Test nutrition summary returns zeros for no data
     */
    public function test_nutrition_summary_returns_zeros_for_no_data(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/nutrition-summary");

        $response->assertOk();
    }

    /**
     * T064: Test food log authorization
     */
    public function test_food_log_authorization_returns_403_for_wrong_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($otherUser)->create();
        $foodLog = FoodLog::factory()->for($child)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/food-logs/{$foodLog->id}");

        $response->assertForbidden();
    }
}
