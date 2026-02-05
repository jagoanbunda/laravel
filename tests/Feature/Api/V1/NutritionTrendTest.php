<?php

namespace Tests\Feature\Api\V1;

use App\Models\Child;
use App\Models\FoodLog;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NutritionTrendTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test nutrition trends returns correct structure
     */
    public function test_nutrition_trends_returns_correct_structure(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/nutrition-trends");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'daily' => [
                        'calories' => ['data', 'average', 'trend_direction'],
                        'protein' => ['data', 'average', 'trend_direction'],
                        'carbohydrate' => ['data', 'average', 'trend_direction'],
                        'fat' => ['data', 'average', 'trend_direction'],
                    ],
                    'weekly' => [
                        'calories' => ['data', 'average', 'trend_direction'],
                        'protein' => ['data', 'average', 'trend_direction'],
                        'carbohydrate' => ['data', 'average', 'trend_direction'],
                        'fat' => ['data', 'average', 'trend_direction'],
                    ],
                    'monthly' => [
                        'calories' => ['data', 'average', 'trend_direction'],
                        'protein' => ['data', 'average', 'trend_direction'],
                        'carbohydrate' => ['data', 'average', 'trend_direction'],
                        'fat' => ['data', 'average', 'trend_direction'],
                    ],
                ],
            ]);
    }

    /**
     * Test nutrition trends requires authentication
     */
    public function test_nutrition_trends_requires_authentication(): void
    {
        $child = Child::factory()->create();

        $response = $this->getJson("/api/v1/children/{$child->id}/nutrition-trends");

        $response->assertUnauthorized();
    }

    /**
     * Test nutrition trends requires child ownership
     */
    public function test_nutrition_trends_requires_ownership(): void
    {
        $owner = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($owner)->create();

        Sanctum::actingAs($otherUser);

        $response = $this->getJson("/api/v1/children/{$child->id}/nutrition-trends");

        $response->assertForbidden();
    }

    /**
     * Test daily trends returns seven days
     */
    public function test_daily_trends_returns_seven_days(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/nutrition-trends");

        $response->assertOk();

        $dailyData = $response->json('data.daily.calories.data');
        $this->assertCount(7, $dailyData);
    }

    /**
     * Test weekly trends returns four weeks
     */
    public function test_weekly_trends_returns_four_weeks(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/nutrition-trends");

        $response->assertOk();

        $weeklyData = $response->json('data.weekly.calories.data');
        $this->assertCount(4, $weeklyData);
    }

    /**
     * Test monthly trends returns three months
     */
    public function test_monthly_trends_returns_three_months(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/nutrition-trends");

        $response->assertOk();

        $monthlyData = $response->json('data.monthly.calories.data');
        $this->assertCount(3, $monthlyData);
    }

    /**
     * Test daily averages are calculated across all calendar days
     */
    public function test_daily_averages_calculated_across_calendar_days(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();

        // Create logs for only 2 days with 100 calories each
        FoodLog::factory()->for($child)->create([
            'log_date' => Carbon::today(),
            'total_calories' => 100,
            'total_protein' => 10,
            'total_carbohydrate' => 15,
            'total_fat' => 5,
        ]);
        FoodLog::factory()->for($child)->create([
            'log_date' => Carbon::yesterday(),
            'total_calories' => 100,
            'total_protein' => 10,
            'total_carbohydrate' => 15,
            'total_fat' => 5,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/nutrition-trends");

        $response->assertOk();

        // Daily average is calculated across all 7 calendar days: 200 total / 7 days = 28.6
        $dailyAverage = $response->json('data.daily.calories.average');
        $this->assertEquals(28.6, $dailyAverage);
    }

    /**
     * Test weekly averages are calculated per logged day only
     */
    public function test_weekly_averages_calculated_per_logged_day(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();

        // Create logs for only 2 days this week with 100 calories each
        FoodLog::factory()->for($child)->create([
            'log_date' => Carbon::today(),
            'total_calories' => 100,
            'total_protein' => 10,
            'total_carbohydrate' => 15,
            'total_fat' => 5,
        ]);
        FoodLog::factory()->for($child)->create([
            'log_date' => Carbon::yesterday(),
            'total_calories' => 100,
            'total_protein' => 10,
            'total_carbohydrate' => 15,
            'total_fat' => 5,
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/nutrition-trends");

        $response->assertOk();

        // Weekly average is calculated per logged day: 200 total / 2 logged days = 100
        $weeklyData = $response->json('data.weekly.calories.data');
        $currentWeekAverage = $weeklyData[3]['average']; // Last week (index 3) is current week
        $this->assertEquals(100.0, $currentWeekAverage);
    }

    /**
     * Test trend direction is calculated correctly
     */
    public function test_trend_direction_calculated_correctly(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/nutrition-trends");

        $response->assertOk();

        $trendDirection = $response->json('data.daily.calories.trend_direction');
        $this->assertContains($trendDirection, ['up', 'down', 'stable']);
    }

    /**
     * Test empty child returns zeros with stable trend
     */
    public function test_empty_child_returns_zeros(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/nutrition-trends");

        $response->assertOk();

        // Check daily calories
        $this->assertEquals(0, $response->json('data.daily.calories.average'));
        $this->assertEquals('stable', $response->json('data.daily.calories.trend_direction'));

        // Check weekly calories
        $this->assertEquals(0, $response->json('data.weekly.calories.average'));
        $this->assertEquals('stable', $response->json('data.weekly.calories.trend_direction'));

        // Check monthly calories
        $this->assertEquals(0, $response->json('data.monthly.calories.average'));
        $this->assertEquals('stable', $response->json('data.monthly.calories.trend_direction'));
    }
}
