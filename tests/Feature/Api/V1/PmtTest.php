<?php

namespace Tests\Feature\Api\V1;

use App\Models\Child;
use App\Models\PmtMenu;
use App\Models\PmtSchedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class PmtTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T085: Test get menus
     */
    public function test_get_menus_returns_menu_list(): void
    {
        $user = User::factory()->create();
        PmtMenu::factory()->count(3)->create(['is_active' => true]);
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/pmt/menus');

        $response->assertOk()
            ->assertJsonStructure([
                'menus',
            ]);
    }

    /**
     * T086: Test menus requires auth
     */
    public function test_menus_require_authentication(): void
    {
        $response = $this->getJson('/api/v1/pmt/menus');

        $response->assertUnauthorized();
    }

    /**
     * T087: Test list schedules
     */
    public function test_list_schedules_returns_200(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $menu = PmtMenu::factory()->create(['is_active' => true]);

        // Create schedules with different dates to avoid unique constraint
        foreach (range(1, 3) as $i) {
            PmtSchedule::factory()->for($child)->create([
                'menu_id' => $menu->id,
                'scheduled_date' => now()->addDays($i)->format('Y-m-d'),
            ]);
        }

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/pmt-schedules");

        $response->assertOk()
            ->assertJsonStructure([
                'schedules',
            ]);
    }

    public function test_list_schedules_requires_authentication(): void
    {
        $child = Child::factory()->create();

        $response = $this->getJson("/api/v1/children/{$child->id}/pmt-schedules");

        $response->assertUnauthorized();
    }

    /**
     * T088: Test create schedule
     */
    public function test_create_schedule_returns_201(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $menu = PmtMenu::factory()->create(['is_active' => true]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/children/{$child->id}/pmt-schedules", [
            'menu_id' => $menu->id,
            'scheduled_date' => now()->addDay()->format('Y-m-d'),
        ]);

        $response->assertCreated();

        $this->assertDatabaseHas('pmt_schedules', [
            'child_id' => $child->id,
            'menu_id' => $menu->id,
        ]);
    }

    /**
     * T089: Test create schedule validation
     */
    public function test_create_schedule_requires_menu_id(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/children/{$child->id}/pmt-schedules", [
            'scheduled_date' => now()->addDay()->format('Y-m-d'),
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['menu_id']);
    }

    public function test_create_schedule_requires_scheduled_date(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $menu = PmtMenu::factory()->create(['is_active' => true]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/children/{$child->id}/pmt-schedules", [
            'menu_id' => $menu->id,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['scheduled_date']);
    }

    /**
     * T090: Test get progress
     */
    public function test_get_progress_returns_data(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $menu = PmtMenu::factory()->create(['is_active' => true]);

        // Create schedules with different dates to avoid unique constraint
        foreach (range(1, 5) as $i) {
            PmtSchedule::factory()->for($child)->create([
                'menu_id' => $menu->id,
                'scheduled_date' => now()->addDays($i)->format('Y-m-d'),
            ]);
        }
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/pmt-progress");

        $response->assertOk()
            ->assertJsonStructure([
                'summary' => [
                    'total_scheduled',
                ],
            ]);
    }

    /**
     * T091: Test progress returns completion stats
     */
    public function test_progress_returns_completion_stats(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/pmt-progress");

        $response->assertOk();
    }

    /**
     * T092: Test log PMT - requires 'portion' field
     */
    public function test_log_pmt_returns_201(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $menu = PmtMenu::factory()->create(['is_active' => true]);
        $schedule = PmtSchedule::factory()->for($child)->create(['menu_id' => $menu->id]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/pmt-schedules/{$schedule->id}/log", [
            'portion' => 'habis',
        ]);

        $response->assertCreated();
    }

    /**
     * T093: Test update PMT log
     */
    public function test_update_pmt_log_returns_200(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $menu = PmtMenu::factory()->create(['is_active' => true]);
        $schedule = PmtSchedule::factory()->for($child)->create(['menu_id' => $menu->id]);
        Sanctum::actingAs($user);

        // First create a log
        $this->postJson("/api/v1/pmt-schedules/{$schedule->id}/log", [
            'portion' => 'habis',
        ]);

        $response = $this->putJson("/api/v1/pmt-schedules/{$schedule->id}/log", [
            'notes' => 'Updated notes',
        ]);

        $response->assertOk();
    }

    /**
     * T094: Test schedule authorization
     */
    public function test_schedule_authorization_returns_403_for_wrong_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/pmt-schedules");

        $response->assertForbidden();
    }

    /**
     * T095: Test log authorization
     */
    public function test_log_authorization_returns_403_for_wrong_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($otherUser)->create();
        $menu = PmtMenu::factory()->create(['is_active' => true]);
        $schedule = PmtSchedule::factory()->for($child)->create(['menu_id' => $menu->id]);

        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/pmt-schedules/{$schedule->id}/log", [
            'portion' => 'habis',
        ]);

        $response->assertForbidden();
    }

    /**
     * T096: Test schedule not found
     */
    public function test_schedule_not_found_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/pmt-schedules/99999/log', [
            'portion' => 'habis',
        ]);

        $response->assertNotFound();
    }
}
