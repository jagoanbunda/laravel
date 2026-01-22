<?php

namespace Tests\Feature\Api\V1;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class CrossAuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T007: Test nakes user cannot login via API - expects 403 with NAKES_WEB_ONLY error_code
     */
    public function test_nakes_cannot_login_via_api(): void
    {
        $nakes = User::factory()->asNakes()->create([
            'email' => 'bidan@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'bidan@example.com',
            'password' => 'password',
        ]);

        $response->assertForbidden()
            ->assertJson([
                'message' => 'Akun tenaga kesehatan hanya dapat login melalui web.',
                'error_code' => 'NAKES_WEB_ONLY',
            ]);
    }

    /**
     * T008: Test nakes cannot register via API - registration creates parent user only
     */
    public function test_api_registration_creates_parent_user_only(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'New Parent',
            'email' => 'newparent@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'phone' => '081234567890',
        ]);

        $response->assertCreated()
            ->assertJson([
                'user' => [
                    'user_type' => 'parent',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'newparent@example.com',
            'user_type' => 'parent',
        ]);

        // Verify no nakes_profile was created
        $user = User::where('email', 'newparent@example.com')->first();
        $this->assertNull($user->nakesProfile);
    }

    /**
     * T009: Test ensure.parent middleware blocks nakes user with token
     */
    public function test_ensure_parent_middleware_blocks_nakes_token(): void
    {
        $nakes = User::factory()->asNakes()->create();

        // Authenticate as nakes user (simulating a case where nakes somehow has a token)
        Sanctum::actingAs($nakes);

        // Try to access a protected API endpoint
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertForbidden()
            ->assertJson([
                'message' => 'Akses ditolak. API hanya untuk orang tua.',
                'error_code' => 'PARENT_API_ONLY',
            ]);
    }

    /**
     * Additional test: Parent user can login via API successfully
     */
    public function test_parent_can_login_via_api(): void
    {
        $parent = User::factory()->asParent()->create([
            'email' => 'parent@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'parent@example.com',
            'password' => 'password',
        ]);

        $response->assertOk()
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'user_type'],
                'token',
            ])
            ->assertJson([
                'message' => 'Login berhasil',
                'user' => [
                    'user_type' => 'parent',
                ],
            ]);
    }

    /**
     * Additional test: Parent user can access protected API endpoints
     */
    public function test_parent_can_access_protected_api_endpoints(): void
    {
        $parent = User::factory()->asParent()->create([
            'name' => 'Parent User',
            'email' => 'parent@example.com',
        ]);

        Sanctum::actingAs($parent);

        $response = $this->getJson('/api/v1/auth/me');

        $response->assertOk()
            ->assertJson([
                'user' => [
                    'name' => 'Parent User',
                    'email' => 'parent@example.com',
                    'user_type' => 'parent',
                ],
            ]);
    }

    /**
     * Additional test: Nakes cannot access children API endpoint
     */
    public function test_nakes_cannot_access_children_api_endpoint(): void
    {
        $nakes = User::factory()->asNakes()->create();

        Sanctum::actingAs($nakes);

        $response = $this->getJson('/api/v1/children');

        $response->assertForbidden()
            ->assertJson([
                'error_code' => 'PARENT_API_ONLY',
            ]);
    }
}
