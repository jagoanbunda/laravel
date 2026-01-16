<?php

namespace Tests\Feature\Api\V1;

use App\Models\Food;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class FoodTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T041: Test list foods
     */
    public function test_list_foods_returns_system_and_user_foods(): void
    {
        $user = User::factory()->create();
        Food::factory()->count(3)->create(['is_system' => true, 'created_by' => null]);
        Food::factory()->count(2)->create(['is_system' => false, 'created_by' => $user->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/foods');

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    '*' => ['id', 'name', 'category', 'nutrition' => ['calories']],
                ],
            ]);
    }

    /**
     * T042: Test list foods requires auth
     */
    public function test_list_foods_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/foods');

        $response->assertUnauthorized();
    }

    /**
     * T043: Test create custom food
     */
    public function test_create_custom_food_returns_201(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/foods', [
            'name' => 'Custom Food',
            'category' => 'Protein',
            'serving_size' => 100,
            'calories' => 200,
            'protein' => 25,
            'fat' => 10,
            'carbohydrate' => 5,
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('foods', [
            'name' => 'Custom Food',
            'created_by' => $user->id,
            'is_system' => false,
        ]);
    }

    /**
     * T044: Test create food validation
     */
    public function test_create_food_requires_name(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/foods', [
            'category' => 'Protein',
            'calories' => 200,
            'protein' => 25,
            'fat' => 10,
            'carbohydrate' => 5,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    /**
     * T045: Test get food details
     */
    public function test_get_food_details_returns_200(): void
    {
        $user = User::factory()->create();
        $food = Food::factory()->create(['is_system' => true, 'created_by' => null]);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/foods/{$food->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'food' => ['id', 'name', 'category', 'nutrition' => ['calories', 'protein', 'fat', 'carbohydrate']],
            ]);
    }

    /**
     * T046: Test update user-created food
     */
    public function test_update_user_created_food_returns_200(): void
    {
        $user = User::factory()->create();
        $food = Food::factory()->create(['is_system' => false, 'created_by' => $user->id]);
        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/foods/{$food->id}", [
            'name' => 'Updated Food Name',
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('foods', [
            'id' => $food->id,
            'name' => 'Updated Food Name',
        ]);
    }

    /**
     * T047: Test cannot update system food
     */
    public function test_cannot_update_system_food(): void
    {
        $user = User::factory()->create();
        $food = Food::factory()->create(['is_system' => true, 'created_by' => null]);
        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/foods/{$food->id}", [
            'name' => 'Hacked Name',
        ]);

        $response->assertForbidden();
    }

    /**
     * T048: Test delete user-created food (soft delete, sets is_active = false)
     */
    public function test_delete_user_created_food_returns_200(): void
    {
        $user = User::factory()->create();
        $food = Food::factory()->create(['is_system' => false, 'created_by' => $user->id, 'is_active' => true]);
        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/v1/foods/{$food->id}");

        $response->assertOk();

        // Food is soft-deleted by setting is_active = false
        $this->assertDatabaseHas('foods', [
            'id' => $food->id,
            'is_active' => false,
        ]);
    }

    /**
     * T049: Test cannot delete system food
     */
    public function test_cannot_delete_system_food(): void
    {
        $user = User::factory()->create();
        $food = Food::factory()->create(['is_system' => true, 'created_by' => null]);
        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/v1/foods/{$food->id}");

        $response->assertForbidden();
    }

    /**
     * T050: Test get food categories
     */
    public function test_get_food_categories_returns_array(): void
    {
        $user = User::factory()->create();
        Food::factory()->create(['category' => 'Protein', 'is_active' => true]);
        Food::factory()->create(['category' => 'Karbohidrat', 'is_active' => true]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/foods-categories');

        $response->assertOk()
            ->assertJsonStructure([
                'categories',
            ]);
    }

    public function test_food_not_found_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/foods/99999');

        $response->assertNotFound();
    }

    public function test_cannot_update_another_users_food(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $food = Food::factory()->create(['is_system' => false, 'created_by' => $otherUser->id]);
        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/foods/{$food->id}", [
            'name' => 'Hacked Name',
        ]);

        $response->assertForbidden();
    }
}
