<?php

namespace Tests\Feature\Web;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class NakesAuthTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T010: Test nakes can view login page
     */
    public function test_nakes_can_view_login_page(): void
    {
        $response = $this->get('/login');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page->component('auth/login'));
    }

    /**
     * T011: Test nakes can login via web - creates session, redirects to /dashboard
     */
    public function test_nakes_can_login_via_web(): void
    {
        $nakes = User::factory()->asNakes()->create([
            'email' => 'bidan@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'email' => 'bidan@example.com',
            'password' => 'password',
        ]);

        $response->assertRedirect(route('dashboard'));
        $this->assertAuthenticatedAs($nakes);
    }

    /**
     * T013: Test nakes can logout via web - destroys session, redirects to /login
     */
    public function test_nakes_can_logout_via_web(): void
    {
        $nakes = User::factory()->asNakes()->create();

        $response = $this->actingAs($nakes)
            ->post('/logout');

        $response->assertRedirect(route('login'));
        $this->assertGuest();
    }

    /**
     * T014: Test nakes can access dashboard - with auth+ensure.nakes middleware
     */
    public function test_nakes_can_access_dashboard(): void
    {
        $nakes = User::factory()->asNakes()->create([
            'name' => 'Bidan Test',
        ]);

        $response = $this->actingAs($nakes)
            ->get('/dashboard');

        $response->assertOk()
            ->assertInertia(fn ($page) => $page->component('dashboard/index'));
    }

    /**
     * Additional: Test nakes can access protected web routes
     */
    public function test_nakes_can_access_children_web_route(): void
    {
        $nakes = User::factory()->asNakes()->create();

        $response = $this->actingAs($nakes)
            ->get('/children');

        $response->assertOk();
    }

    /**
     * Additional: Test login validation errors
     */
    public function test_login_requires_valid_credentials(): void
    {
        $response = $this->post('/login', [
            'email' => '',
            'password' => '',
        ]);

        $response->assertSessionHasErrors(['email', 'password']);
    }

    /**
     * Additional: Test login fails with wrong password
     */
    public function test_login_fails_with_wrong_password(): void
    {
        $nakes = User::factory()->asNakes()->create([
            'email' => 'bidan@example.com',
            'password' => bcrypt('password'),
        ]);

        $response = $this->post('/login', [
            'email' => 'bidan@example.com',
            'password' => 'wrongpassword',
        ]);

        $response->assertSessionHasErrors(['email']);
        $this->assertGuest();
    }

    /**
     * Additional: Test authenticated nakes cannot access login page
     */
    public function test_authenticated_nakes_cannot_access_login_page(): void
    {
        $nakes = User::factory()->asNakes()->create();

        $response = $this->actingAs($nakes)
            ->get('/login');

        $response->assertRedirect(route('dashboard'));
    }

    /**
     * Note: Nakes registration is admin-only (via seeder/phpMyAdmin).
     * No web registration route exists. Parents register via mobile app API.
     */
}
