<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CrossAuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T015: Test parent user cannot login via web - redirect with flash error message
     */
    public function test_parent_cannot_login_via_web(): void
    {
        $parent = User::factory()->asParent()->create([
            'email' => 'parent@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'email' => 'parent@example.com',
            'password' => 'password',
        ]);

        $response->assertRedirect()
            ->assertSessionHas('error');

        // Verify the specific error message
        $response->assertSessionHas(
            'error',
            'Akun orang tua hanya dapat login melalui aplikasi mobile.'
        );

        // User should not be authenticated
        $this->assertGuest();
    }

    /**
     * T016: Test parent user cannot access dashboard - even if session exists, ensure.nakes blocks
     */
    public function test_parent_cannot_access_dashboard(): void
    {
        $parent = User::factory()->asParent()->create();

        // Force login as parent (simulating a session that somehow exists)
        $response = $this->actingAs($parent)
            ->get('/dashboard');

        // Should be redirected to login with error
        $response->assertRedirect(route('login'))
            ->assertSessionHasErrors(['email']);

        // User should be logged out
        $this->assertGuest();
    }

    /**
     * T017: Test ensure.nakes middleware blocks parent session
     */
    public function test_ensure_nakes_middleware_blocks_parent_session(): void
    {
        $parent = User::factory()->asParent()->create();

        // Try to access various protected web routes as parent
        $protectedRoutes = [
            '/dashboard',
            '/children',
            '/parents',
            '/foods',
        ];

        foreach ($protectedRoutes as $route) {
            $response = $this->actingAs($parent)
                ->get($route);

            $response->assertRedirect(route('login'));
        }
    }

    /**
     * Additional: Test parent cannot access logout route directly
     */
    public function test_parent_cannot_access_logout_route(): void
    {
        $parent = User::factory()->asParent()->create();

        $response = $this->actingAs($parent)
            ->post('/logout');

        // Should be blocked by ensure.nakes middleware before reaching logout
        $response->assertRedirect(route('login'));
    }

    /**
     * Additional: Test unauthenticated user is redirected to login
     */
    public function test_unauthenticated_user_redirected_to_login(): void
    {
        $response = $this->get('/dashboard');

        $response->assertRedirect(route('login'));
    }

    /**
     * Additional: Verify flash error message is displayed correctly
     */
    public function test_parent_login_rejection_has_correct_error_message(): void
    {
        $parent = User::factory()->asParent()->create([
            'email' => 'parent@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->from('/login')
            ->post('/login', [
                'email' => 'parent@example.com',
                'password' => 'password',
            ]);

        $response->assertRedirect('/login')
            ->assertSessionHas(
                'error',
                'Akun orang tua hanya dapat login melalui aplikasi mobile.'
            );
    }

    /**
     * Note: No web registration exists.
     * - Nakes registration is admin-only (via seeder/phpMyAdmin)
     * - Parents register via mobile app (API only)
     */
}
