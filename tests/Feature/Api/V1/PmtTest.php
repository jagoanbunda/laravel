<?php

namespace Tests\Feature\Api\V1;

use App\Models\Child;
use App\Models\PmtMenu;
use App\Models\PmtSchedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
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

    /**
     * T097: Test log PMT with photo upload stores file
     */
    public function test_log_pmt_with_photo_upload_stores_file(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $menu = PmtMenu::factory()->create(['is_active' => true]);
        $schedule = PmtSchedule::factory()->for($child)->create(['menu_id' => $menu->id]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/pmt-schedules/{$schedule->id}/log", [
            'portion' => 'habis',
            'photo' => UploadedFile::fake()->image('photo.jpg'),
        ]);

        $response->assertCreated();

        $log = $schedule->fresh()->log;
        $this->assertNotNull($log->photo_url);
        $this->assertStringStartsWith('pmt-logs/photos/', $log->photo_url);
        Storage::disk('public')->assertExists($log->photo_url);
    }

    /**
     * T098: Test log PMT without photo returns 201
     */
    public function test_log_pmt_without_photo_returns_201(): void
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

        $log = $schedule->fresh()->log;
        $this->assertNull($log->photo_url);
    }

    /**
     * T099: Test log PMT rejects non-image file
     */
    public function test_log_pmt_rejects_non_image_file(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $menu = PmtMenu::factory()->create(['is_active' => true]);
        $schedule = PmtSchedule::factory()->for($child)->create(['menu_id' => $menu->id]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/pmt-schedules/{$schedule->id}/log", [
            'portion' => 'habis',
            'photo' => UploadedFile::fake()->create('document.pdf', 100, 'application/pdf'),
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['photo']);
    }

    /**
     * T100: Test log PMT rejects oversized image
     */
    public function test_log_pmt_rejects_oversized_image(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $menu = PmtMenu::factory()->create(['is_active' => true]);
        $schedule = PmtSchedule::factory()->for($child)->create(['menu_id' => $menu->id]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/pmt-schedules/{$schedule->id}/log", [
            'portion' => 'habis',
            'photo' => UploadedFile::fake()->image('large.jpg')->size(3000),
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['photo']);
    }

    /**
     * T101: Test update PMT log replaces photo and deletes old
     */
    public function test_update_pmt_log_replaces_photo_and_deletes_old(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $menu = PmtMenu::factory()->create(['is_active' => true]);
        $schedule = PmtSchedule::factory()->for($child)->create(['menu_id' => $menu->id]);
        Sanctum::actingAs($user);

        // Create log with photo
        $this->postJson("/api/v1/pmt-schedules/{$schedule->id}/log", [
            'portion' => 'habis',
            'photo' => UploadedFile::fake()->image('original.jpg'),
        ]);

        $oldPhotoUrl = $schedule->fresh()->log->photo_url;
        Storage::disk('public')->assertExists($oldPhotoUrl);

        // Update with new photo
        $response = $this->putJson("/api/v1/pmt-schedules/{$schedule->id}/log", [
            'photo' => UploadedFile::fake()->image('replacement.jpg'),
        ]);

        $response->assertOk();

        $newPhotoUrl = $schedule->fresh()->log->photo_url;
        $this->assertNotEquals($oldPhotoUrl, $newPhotoUrl);
        Storage::disk('public')->assertMissing($oldPhotoUrl);
        Storage::disk('public')->assertExists($newPhotoUrl);
    }

    /**
     * T102: Test update PMT log without photo preserves existing
     */
    public function test_update_pmt_log_without_photo_preserves_existing(): void
    {
        Storage::fake('public');

        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $menu = PmtMenu::factory()->create(['is_active' => true]);
        $schedule = PmtSchedule::factory()->for($child)->create(['menu_id' => $menu->id]);
        Sanctum::actingAs($user);

        // Create log with photo
        $this->postJson("/api/v1/pmt-schedules/{$schedule->id}/log", [
            'portion' => 'habis',
            'photo' => UploadedFile::fake()->image('keep-me.jpg'),
        ]);

        $originalPhotoUrl = $schedule->fresh()->log->photo_url;

        // Update only notes, no photo
        $response = $this->putJson("/api/v1/pmt-schedules/{$schedule->id}/log", [
            'notes' => 'Updated notes only',
        ]);

        $response->assertOk();

        $log = $schedule->fresh()->log;
        $this->assertEquals($originalPhotoUrl, $log->photo_url);
        $this->assertEquals('Updated notes only', $log->notes);
        Storage::disk('public')->assertExists($originalPhotoUrl);
    }
}
