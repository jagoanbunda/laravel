<?php

namespace Tests\Feature\Api\V1;

use App\Models\Child;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ChildTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T017: Test list children requires auth
     */
    public function test_list_children_requires_authentication(): void
    {
        $response = $this->getJson('/api/v1/children');

        $response->assertUnauthorized();
    }

    /**
     * T018: Test list children returns user's children only
     */
    public function test_list_children_returns_only_users_children(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();

        $userChildren = Child::factory()->count(2)->for($user)->create();
        Child::factory()->count(3)->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/children');

        $response->assertOk()
            ->assertJsonCount(2, 'data');

        foreach ($userChildren as $child) {
            $response->assertJsonFragment(['id' => $child->id]);
        }
    }

    public function test_list_children_returns_empty_when_user_has_no_children(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/children');

        $response->assertOk()
            ->assertJsonCount(0, 'data');
    }

    /**
     * T019: Test create child success
     */
    public function test_user_can_create_child(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/children', [
            'name' => 'Budi',
            'birthday' => '2023-01-15',
            'gender' => 'male',
            'birth_weight' => 3.2,
            'birth_height' => 50.0,
            'head_circumference' => 35.0,
        ]);

        $response->assertCreated()
            ->assertJsonStructure([
                'message',
                'child' => ['id', 'name', 'birthday', 'gender'],
            ])
            ->assertJson([
                'message' => 'Data anak berhasil ditambahkan',
            ]);

        $this->assertDatabaseHas('children', [
            'user_id' => $user->id,
            'name' => 'Budi',
            'gender' => 'male',
        ]);
    }

    /**
     * T020: Test create child validation
     */
    public function test_create_child_requires_name(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/children', [
            'birthday' => '2023-01-15',
            'gender' => 'male',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['name']);
    }

    public function test_create_child_requires_valid_gender(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/children', [
            'name' => 'Budi',
            'birthday' => '2023-01-15',
            'gender' => 'invalid',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['gender']);
    }

    public function test_create_child_rejects_future_birthday(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $futureDate = now()->addYear()->format('Y-m-d');

        $response = $this->postJson('/api/v1/children', [
            'name' => 'Budi',
            'birthday' => $futureDate,
            'gender' => 'male',
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['birthday']);
    }

    /**
     * T021: Test get child
     */
    public function test_user_can_get_child(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create([
            'name' => 'Budi',
        ]);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'child' => ['id', 'name', 'birthday', 'gender'],
            ])
            ->assertJson([
                'child' => [
                    'id' => $child->id,
                    'name' => 'Budi',
                ],
            ]);
    }

    /**
     * T022: Test get child returns 403 for another user's child
     */
    public function test_user_cannot_access_another_users_child(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}");

        $response->assertForbidden();
    }

    /**
     * T023: Test get child returns 404 for non-existent child
     */
    public function test_get_nonexistent_child_returns_404(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/children/99999');

        $response->assertNotFound();
    }

    /**
     * T024: Test update child
     */
    public function test_user_can_update_child(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create([
            'name' => 'Budi',
        ]);
        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/children/{$child->id}", [
            'name' => 'Budi Updated',
        ]);

        $response->assertOk()
            ->assertJson([
                'message' => 'Data anak berhasil diperbarui',
            ]);

        $this->assertDatabaseHas('children', [
            'id' => $child->id,
            'name' => 'Budi Updated',
        ]);
    }

    public function test_user_cannot_update_another_users_child(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/children/{$child->id}", [
            'name' => 'Hacked Name',
        ]);

        $response->assertForbidden();
    }

    /**
     * T025: Test delete child soft deletes
     */
    public function test_user_can_delete_child(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/v1/children/{$child->id}");

        $response->assertOk()
            ->assertJson([
                'message' => 'Data anak berhasil dihapus',
            ]);

        $this->assertSoftDeleted('children', [
            'id' => $child->id,
        ]);
    }

    public function test_user_cannot_delete_another_users_child(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/v1/children/{$child->id}");

        $response->assertForbidden();
    }

    /**
     * T026: Test child summary
     */
    public function test_user_can_get_child_summary(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/summary");

        $response->assertOk()
            ->assertJsonStructure([
                'child',
                'age',
            ]);
    }

    public function test_user_cannot_access_another_users_child_summary(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/summary");

        $response->assertForbidden();
    }

    /**
     * Test create child with avatar file upload
     */
    public function test_user_can_create_child_with_avatar(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('avatar.jpg', 200, 200);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/children', [
            'name' => 'Test Child',
            'birthday' => '2023-01-15',
            'gender' => 'male',
            'avatar' => $file,
        ]);

        $response->assertCreated();
        Storage::disk('public')->assertExists('children/avatars/'.$file->hashName());
        $this->assertDatabaseHas('children', [
            'name' => 'Test Child',
            'avatar_url' => 'children/avatars/'.$file->hashName(),
        ]);
    }

    /**
     * Test update child with avatar file upload
     */
    public function test_user_can_update_child_avatar(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $file = UploadedFile::fake()->image('new-avatar.jpg', 200, 200);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/children/{$child->id}", [
            'avatar' => $file,
        ]);

        $response->assertOk();
        Storage::disk('public')->assertExists('children/avatars/'.$file->hashName());
        $this->assertDatabaseHas('children', [
            'id' => $child->id,
            'avatar_url' => 'children/avatars/'.$file->hashName(),
        ]);
    }

    /**
     * Test avatar upload deletes old avatar
     */
    public function test_avatar_upload_deletes_old_avatar(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create([
            'avatar_url' => 'children/avatars/old-avatar.jpg',
        ]);

        // Create the old file
        Storage::disk('public')->put('children/avatars/old-avatar.jpg', 'old content');

        $newFile = UploadedFile::fake()->image('new-avatar.jpg', 200, 200);

        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/children/{$child->id}", [
            'avatar' => $newFile,
        ]);

        $response->assertOk();
        Storage::disk('public')->assertMissing('children/avatars/old-avatar.jpg');
        Storage::disk('public')->assertExists('children/avatars/'.$newFile->hashName());
    }

    /**
     * Test avatar upload validates file type
     */
    public function test_avatar_upload_validates_file_type(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $file = UploadedFile::fake()->create('document.pdf', 100);

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/children', [
            'name' => 'Test Child',
            'birthday' => '2023-01-15',
            'gender' => 'male',
            'avatar' => $file,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['avatar']);
    }

    /**
     * Test avatar upload validates file size
     */
    public function test_avatar_upload_validates_file_size(): void
    {
        Storage::fake('public');
        $user = User::factory()->create();
        $file = UploadedFile::fake()->image('large.jpg')->size(3000); // 3MB

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/v1/children', [
            'name' => 'Test Child',
            'birthday' => '2023-01-15',
            'gender' => 'male',
            'avatar' => $file,
        ]);

        $response->assertUnprocessable();
        $response->assertJsonValidationErrors(['avatar']);
    }
}
