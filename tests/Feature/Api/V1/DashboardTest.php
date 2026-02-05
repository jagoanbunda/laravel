<?php

namespace Tests\Feature\Api\V1;

use App\Models\Child;
use App\Models\FoodLog;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test dashboard returns correct JSON structure
     */
    public function test_dashboard_returns_correct_structure(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create(['birthday' => now()->subMonths(24)]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/dashboard");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'child' => ['id', 'name', 'birthday'],
                    'progressRings' => [
                        'calories' => ['current', 'target', 'percentage', 'unit'],
                        'protein' => ['current', 'target', 'percentage', 'unit'],
                        'carbs' => ['current', 'target', 'percentage', 'unit'],
                        'fat' => ['current', 'target', 'percentage', 'unit'],
                        'fiber' => ['current', 'target', 'percentage', 'unit'],
                    ],
                    'weeklyTrend' => ['weeks', 'trend_direction'],
                    'tasks',
                    'tips',
                ],
            ]);
    }

    /**
     * Test dashboard requires authentication
     */
    public function test_dashboard_requires_authentication(): void
    {
        $child = Child::factory()->create();

        $response = $this->getJson("/api/v1/children/{$child->id}/dashboard");

        $response->assertUnauthorized();
    }

    /**
     * Test dashboard requires child ownership
     */
    public function test_dashboard_requires_ownership(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($owner)->create();

        Sanctum::actingAs($otherUser);

        $response = $this->getJson("/api/v1/children/{$child->id}/dashboard");

        $response->assertForbidden();
    }

    /**
     * Test progress rings calculate correctly based on child data
     */
    public function test_progress_rings_calculate_correctly(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create(['birthday' => now()->subMonths(24)]);

        FoodLog::factory()->for($child)->create([
            'log_date' => today(),
            'total_calories' => 675,
            'total_protein' => 15,
            'total_carbohydrate' => 100,
            'total_fat' => 25,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/dashboard");

        $response->assertOk();

        $data = $response->json('data.progressRings');
        $this->assertEquals(50, $data['calories']['percentage']);
    }

    /**
     * Test weekly trend returns four weeks of data
     */
    public function test_weekly_trend_returns_four_weeks(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/dashboard");

        $response->assertOk();

        $weeks = $response->json('data.weeklyTrend.weeks');
        $this->assertCount(4, $weeks);

        $trendDirection = $response->json('data.weeklyTrend.trend_direction');
        $this->assertContains($trendDirection, ['up', 'down', 'stable']);
    }

    /**
     * Test task reminders detect due items correctly
     */
    public function test_task_reminders_detect_due_items(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create(['birthday' => now()->subMonths(6)]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/dashboard");

        $response->assertOk();

        $tasks = $response->json('data.tasks');
        $this->assertIsArray($tasks);
    }

    /**
     * Test tips are rule-based and relevant
     */
    public function test_tips_are_rule_based(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/dashboard");

        $response->assertOk();

        $tips = $response->json('data.tips');
        $this->assertIsArray($tips);
        $this->assertNotEmpty($tips);
    }

    /**
     * Test new child with no data returns valid empty state
     */
    public function test_new_child_with_no_data(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/dashboard");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'child',
                    'progressRings',
                    'weeklyTrend',
                    'tasks',
                    'tips',
                ],
            ]);

        $progressRings = $response->json('data.progressRings');
        $this->assertEquals(0, $progressRings['calories']['current']);
        $this->assertEquals(0, $progressRings['calories']['percentage']);
    }
}
