<?php

namespace Tests\Feature;

use App\Models\Child;
use App\Models\PmtProgram;
use App\Models\PmtSchedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PmtProgramTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Child $child;

    protected function setUp(): void
    {
        parent::setUp();

        // Web routes require nakes users
        $this->user = User::factory()->asNakes()->create();
        $this->child = Child::factory()->create(['user_id' => $this->user->id]);
    }

    public function test_can_view_pmt_programs_list(): void
    {
        PmtProgram::factory()
            ->count(3)
            ->create(['created_by' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->get(route('pmt.programs.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('pmt/programs/index')
                ->has('programs.data', 3)
        );
    }

    public function test_can_filter_programs_by_status(): void
    {
        PmtProgram::factory()
            ->active()
            ->create(['child_id' => $this->child->id, 'created_by' => $this->user->id]);

        PmtProgram::factory()
            ->completed()
            ->create(['created_by' => $this->user->id]);

        $response = $this->actingAs($this->user)
            ->get(route('pmt.programs.index', ['status' => 'active']));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('pmt/programs/index')
                ->has('programs.data', 1)
        );
    }

    public function test_can_view_create_program_form(): void
    {
        $response = $this->actingAs($this->user)
            ->get(route('pmt.programs.create'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('pmt/programs/create')
                ->has('children')
        );
    }

    public function test_can_create_90_day_program(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('pmt.programs.store'), [
                'child_id' => $this->child->id,
                'start_date' => now()->format('Y-m-d'),
                'duration_days' => 90,
                'notes' => 'Test program notes',
            ]);

        $response->assertRedirect(route('pmt.programs.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('pmt_programs', [
            'child_id' => $this->child->id,
            'duration_days' => 90,
            'status' => 'active',
            'created_by' => $this->user->id,
        ]);

        // Verify 90 schedules were created
        $program = PmtProgram::where('child_id', $this->child->id)->first();
        $this->assertCount(90, $program->schedules);
    }

    public function test_can_create_120_day_program(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('pmt.programs.store'), [
                'child_id' => $this->child->id,
                'start_date' => now()->format('Y-m-d'),
                'duration_days' => 120,
            ]);

        $response->assertRedirect(route('pmt.programs.index'));

        $this->assertDatabaseHas('pmt_programs', [
            'child_id' => $this->child->id,
            'duration_days' => 120,
            'status' => 'active',
        ]);

        // Verify 120 schedules were created
        $program = PmtProgram::where('child_id', $this->child->id)->first();
        $this->assertCount(120, $program->schedules);
    }

    public function test_schedule_dates_are_sequential_from_start_date(): void
    {
        $startDate = now()->addDays(1);

        $this->actingAs($this->user)
            ->post(route('pmt.programs.store'), [
                'child_id' => $this->child->id,
                'start_date' => $startDate->format('Y-m-d'),
                'duration_days' => 90,
            ]);

        $program = PmtProgram::where('child_id', $this->child->id)->first();
        $schedules = $program->schedules()->orderBy('scheduled_date')->get();

        // Check first and last schedule dates
        $this->assertEquals(
            $startDate->format('Y-m-d'),
            $schedules->first()->scheduled_date->format('Y-m-d')
        );
        $this->assertEquals(
            $startDate->copy()->addDays(89)->format('Y-m-d'),
            $schedules->last()->scheduled_date->format('Y-m-d')
        );
    }

    public function test_cannot_create_duplicate_active_program_for_same_child(): void
    {
        // Create an active program first
        PmtProgram::factory()
            ->active()
            ->ninetyDays()
            ->create([
                'child_id' => $this->child->id,
                'created_by' => $this->user->id,
            ]);

        // Try to create another active program for the same child
        $response = $this->actingAs($this->user)
            ->post(route('pmt.programs.store'), [
                'child_id' => $this->child->id,
                'start_date' => now()->format('Y-m-d'),
                'duration_days' => 90,
            ]);

        $response->assertSessionHasErrors('child_id');

        // Still only 1 program
        $this->assertEquals(1, PmtProgram::where('child_id', $this->child->id)->count());
    }

    public function test_can_create_program_for_child_with_completed_program(): void
    {
        // Create a completed program
        PmtProgram::factory()
            ->completed()
            ->create([
                'child_id' => $this->child->id,
                'created_by' => $this->user->id,
            ]);

        // Should be able to create new active program
        $response = $this->actingAs($this->user)
            ->post(route('pmt.programs.store'), [
                'child_id' => $this->child->id,
                'start_date' => now()->format('Y-m-d'),
                'duration_days' => 90,
            ]);

        $response->assertRedirect(route('pmt.programs.index'));
        $this->assertEquals(2, PmtProgram::where('child_id', $this->child->id)->count());
    }

    public function test_can_view_program_details(): void
    {
        $program = PmtProgram::factory()
            ->active()
            ->ninetyDays()
            ->create([
                'child_id' => $this->child->id,
                'created_by' => $this->user->id,
            ]);

        // Create some schedules
        for ($i = 0; $i < 10; $i++) {
            PmtSchedule::factory()->create([
                'program_id' => $program->id,
                'child_id' => $this->child->id,
                'scheduled_date' => now()->addDays($i),
            ]);
        }

        $response = $this->actingAs($this->user)
            ->get(route('pmt.programs.show', $program));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('pmt/programs/show')
                ->has('program')
                ->has('schedules')
                ->has('statistics')
        );
    }

    public function test_can_discontinue_active_program(): void
    {
        $program = PmtProgram::factory()
            ->active()
            ->create([
                'child_id' => $this->child->id,
                'created_by' => $this->user->id,
            ]);

        $response = $this->actingAs($this->user)
            ->post(route('pmt.programs.discontinue', $program));

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $program->refresh();
        $this->assertEquals('discontinued', $program->status);
    }

    public function test_cannot_discontinue_completed_program(): void
    {
        $program = PmtProgram::factory()
            ->completed()
            ->create([
                'child_id' => $this->child->id,
                'created_by' => $this->user->id,
            ]);

        $response = $this->actingAs($this->user)
            ->post(route('pmt.programs.discontinue', $program));

        $response->assertSessionHas('error');

        $program->refresh();
        $this->assertEquals('completed', $program->status);
    }

    public function test_cannot_discontinue_already_discontinued_program(): void
    {
        $program = PmtProgram::factory()
            ->discontinued()
            ->create([
                'child_id' => $this->child->id,
                'created_by' => $this->user->id,
            ]);

        $response = $this->actingAs($this->user)
            ->post(route('pmt.programs.discontinue', $program));

        $response->assertSessionHas('error');
    }

    public function test_progress_percentage_calculates_correctly(): void
    {
        $program = PmtProgram::factory()
            ->ninetyDays()
            ->create([
                'child_id' => $this->child->id,
                'created_by' => $this->user->id,
                'duration_days' => 90,
            ]);

        // Initially 0% progress
        $this->assertEquals(0, $program->progress_percentage);
        $this->assertEquals(90, $program->pending_days);
        $this->assertEquals(0, $program->logged_days);
    }

    public function test_validates_required_fields(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('pmt.programs.store'), []);

        $response->assertSessionHasErrors(['child_id', 'start_date', 'duration_days']);
    }

    public function test_validates_duration_must_be_90_or_120(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('pmt.programs.store'), [
                'child_id' => $this->child->id,
                'start_date' => now()->format('Y-m-d'),
                'duration_days' => 60,
            ]);

        $response->assertSessionHasErrors('duration_days');
    }

    public function test_validates_child_exists(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('pmt.programs.store'), [
                'child_id' => 99999,
                'start_date' => now()->format('Y-m-d'),
                'duration_days' => 90,
            ]);

        $response->assertSessionHasErrors('child_id');
    }

    public function test_validates_start_date_not_in_past(): void
    {
        $response = $this->actingAs($this->user)
            ->post(route('pmt.programs.store'), [
                'child_id' => $this->child->id,
                'start_date' => now()->subDay()->format('Y-m-d'),
                'duration_days' => 90,
            ]);

        $response->assertSessionHasErrors('start_date');
    }

    public function test_can_delete_program(): void
    {
        $program = PmtProgram::factory()->create([
            'child_id' => $this->child->id,
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->delete(route('pmt.programs.destroy', $program));

        $response->assertRedirect(route('pmt.programs.index'));
        $this->assertDatabaseMissing('pmt_programs', ['id' => $program->id]);
    }

    public function test_can_update_program_notes(): void
    {
        $program = PmtProgram::factory()->create([
            'child_id' => $this->child->id,
            'created_by' => $this->user->id,
            'notes' => 'Original notes',
        ]);

        $response = $this->actingAs($this->user)
            ->put(route('pmt.programs.update', $program), [
                'notes' => 'Updated notes',
            ]);

        $response->assertRedirect(route('pmt.programs.show', $program));

        $program->refresh();
        $this->assertEquals('Updated notes', $program->notes);
    }

    public function test_search_programs_by_child_name(): void
    {
        $searchChild = Child::factory()->create([
            'user_id' => $this->user->id,
            'name' => 'UniqueSearchName',
        ]);

        PmtProgram::factory()->create([
            'child_id' => $searchChild->id,
            'created_by' => $this->user->id,
        ]);

        PmtProgram::factory()->create([
            'child_id' => $this->child->id,
            'created_by' => $this->user->id,
        ]);

        $response = $this->actingAs($this->user)
            ->get(route('pmt.programs.index', ['search' => 'UniqueSearchName']));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('pmt/programs/index')
                ->has('programs.data', 1)
        );
    }

    public function test_program_end_date_calculated_correctly(): void
    {
        $startDate = now();

        $this->actingAs($this->user)
            ->post(route('pmt.programs.store'), [
                'child_id' => $this->child->id,
                'start_date' => $startDate->format('Y-m-d'),
                'duration_days' => 90,
            ]);

        $program = PmtProgram::where('child_id', $this->child->id)->first();

        // End date should be start_date + (duration - 1) days
        $expectedEndDate = $startDate->copy()->addDays(89)->format('Y-m-d');
        $this->assertEquals($expectedEndDate, $program->end_date->format('Y-m-d'));
    }
}
