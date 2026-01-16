<?php

namespace Tests\Feature\Api\V1;

use App\Models\AnthropometryMeasurement;
use App\Models\Child;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AnthropometryTest extends TestCase
{
    use RefreshDatabase;

    /**
     * T029: Test list measurements
     */
    public function test_list_measurements_returns_200(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        AnthropometryMeasurement::factory()->count(3)->for($child)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/anthropometry");

        $response->assertOk()
            ->assertJsonCount(3, 'data');
    }

    /**
     * T030: Test list measurements requires child ownership
     */
    public function test_list_measurements_requires_child_ownership(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/anthropometry");

        $response->assertForbidden();
    }

    public function test_list_measurements_requires_authentication(): void
    {
        $child = Child::factory()->create();

        $response = $this->getJson("/api/v1/children/{$child->id}/anthropometry");

        $response->assertUnauthorized();
    }

    /**
     * T031: Test create measurement
     */
    public function test_create_measurement_returns_201(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/children/{$child->id}/anthropometry", [
            'measurement_date' => now()->subDay()->format('Y-m-d'),
            'weight' => 10.5,
            'height' => 75.0,
            'head_circumference' => 45.0,
        ]);

        $response->assertCreated()
            ->assertJson([
                'message' => 'Data pengukuran berhasil ditambahkan',
            ]);

        $this->assertDatabaseHas('anthropometry_measurements', [
            'child_id' => $child->id,
            'weight' => 10.5,
            'height' => 75.0,
        ]);
    }

    /**
     * T032: Test create measurement validation
     */
    public function test_create_measurement_validation_weight_range(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/children/{$child->id}/anthropometry", [
            'measurement_date' => now()->format('Y-m-d'),
            'weight' => 150, // Too high
            'height' => 75.0,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['weight']);
    }

    public function test_create_measurement_rejects_future_date(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/children/{$child->id}/anthropometry", [
            'measurement_date' => now()->addMonth()->format('Y-m-d'),
            'weight' => 10.5,
            'height' => 75.0,
        ]);

        $response->assertUnprocessable()
            ->assertJsonValidationErrors(['measurement_date']);
    }

    /**
     * T033: Test get measurement
     */
    public function test_get_measurement_returns_200(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $measurement = AnthropometryMeasurement::factory()->for($child)->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/anthropometry/{$measurement->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'measurement' => ['id', 'measurement_date', 'weight', 'height'],
            ]);
    }

    /**
     * T034: Test update measurement
     */
    public function test_update_measurement_returns_200(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $measurement = AnthropometryMeasurement::factory()->for($child)->create();
        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/children/{$child->id}/anthropometry/{$measurement->id}", [
            'weight' => 11.0,
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('anthropometry_measurements', [
            'id' => $measurement->id,
            'weight' => 11.0,
        ]);
    }

    /**
     * T035: Test delete measurement
     */
    public function test_delete_measurement_returns_200(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $measurement = AnthropometryMeasurement::factory()->for($child)->create();
        Sanctum::actingAs($user);

        $response = $this->deleteJson("/api/v1/children/{$child->id}/anthropometry/{$measurement->id}");

        $response->assertOk();

        $this->assertDatabaseMissing('anthropometry_measurements', [
            'id' => $measurement->id,
        ]);
    }

    /**
     * T036: Test growth chart
     */
    public function test_growth_chart_returns_data(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        AnthropometryMeasurement::factory()->count(5)->for($child)->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/growth-chart");

        $response->assertOk()
            ->assertJsonStructure([
                'measurements',
            ]);
    }

    /**
     * T037: Test measurement for non-owned child returns 403
     */
    public function test_measurement_for_non_owned_child_returns_403(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($otherUser)->create();
        $measurement = AnthropometryMeasurement::factory()->for($child)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/anthropometry/{$measurement->id}");

        $response->assertForbidden();
    }

    /**
     * T038: Test measurement not found returns 404
     */
    public function test_measurement_not_found_returns_404(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/anthropometry/99999");

        $response->assertNotFound();
    }
}
