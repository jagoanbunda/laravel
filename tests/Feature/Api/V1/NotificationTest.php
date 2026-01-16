<?php

namespace Tests\Feature\Api\V1;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class NotificationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T099: Test list notifications
     */
    public function test_list_notifications_returns_users_notifications(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        Notification::factory()->count(3)->for($user)->create();
        Notification::factory()->count(2)->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/notifications');

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    /**
     * T100: Test list notifications requires auth
     */
    public function test_list_notifications_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/notifications');

        $response->assertUnauthorized();
    }

    /**
     * T101: Test list notifications with unread_only filter
     */
    public function test_list_notifications_with_unread_only_filter(): void
    {
        $user = User::factory()->create();

        Notification::factory()->count(2)->for($user)->unread()->create();
        Notification::factory()->count(3)->for($user)->read()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/notifications?unread_only=true');

        $response->assertOk()
            ->assertJsonCount(2, 'data');
    }

    /**
     * T102: Test get unread count
     */
    public function test_get_unread_count_returns_count(): void
    {
        $user = User::factory()->create();

        Notification::factory()->count(5)->for($user)->unread()->create();
        Notification::factory()->count(2)->for($user)->read()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/notifications/unread-count');

        $response->assertOk()
            ->assertJson([
                'unread_count' => 5,
            ]);
    }

    /**
     * T103: Test mark as read
     */
    public function test_mark_as_read_sets_read_at(): void
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->for($user)->unread()->create();
        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertOk()
            ->assertJson([
                'message' => 'Notifikasi ditandai sudah dibaca',
            ]);

        $this->assertNotNull($notification->fresh()->read_at);
    }

    /**
     * T104: Test mark as read requires ownership
     */
    public function test_mark_as_read_requires_ownership(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $notification = Notification::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/notifications/{$notification->id}/read");

        $response->assertForbidden();
    }

    /**
     * T105: Test mark all as read
     */
    public function test_mark_all_as_read_returns_count(): void
    {
        $user = User::factory()->create();

        Notification::factory()->count(5)->for($user)->unread()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/notifications/read-all');

        $response->assertOk()
            ->assertJsonStructure([
                'message',
            ]);

        $this->assertEquals(0, $user->notifications()->whereNull('read_at')->count());
    }

    /**
     * T106: Test delete notification
     */
    public function test_delete_notification_returns_200(): void
    {
        $user = User::factory()->create();
        $notification = Notification::factory()->for($user)->create();
        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/v1/notifications/{$notification->id}");

        $response->assertOk()
            ->assertJson([
                'message' => 'Notifikasi berhasil dihapus',
            ]);

        $this->assertDatabaseMissing('notifications', [
            'id' => $notification->id,
        ]);
    }

    /**
     * T107: Test delete requires ownership
     */
    public function test_delete_requires_ownership(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $notification = Notification::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/v1/notifications/{$notification->id}");

        $response->assertForbidden();
    }

    /**
     * T108: Test notification not found - use PUT method for read endpoint
     */
    public function test_notification_not_found_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->putJson('/api/v1/notifications/99999/read');

        $response->assertNotFound();
    }

    /**
     * T109: Test notifications ordered by created_at desc
     */
    public function test_notifications_ordered_by_created_at_desc(): void
    {
        $user = User::factory()->create();

        $old = Notification::factory()->for($user)->create(['created_at' => now()->subDay()]);
        $new = Notification::factory()->for($user)->create(['created_at' => now()]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/notifications');

        $response->assertOk();

        $data = $response->json('data');
        $this->assertEquals($new->id, $data[0]['id']);
        $this->assertEquals($old->id, $data[1]['id']);
    }

    /**
     * T110: Test different notification types
     */
    public function test_different_notification_types(): void
    {
        $user = User::factory()->create();

        Notification::factory()->for($user)->screeningReminder()->create();
        Notification::factory()->for($user)->pmtReminder()->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/notifications');

        $response->assertOk()
            ->assertJsonCount(2, 'data');

        $types = collect($response->json('data'))->pluck('type')->toArray();
        $this->assertContains('screening_reminder', $types);
        $this->assertContains('pmt_reminder', $types);
    }

    public function test_unread_count_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/notifications/unread-count');

        $response->assertUnauthorized();
    }
}
