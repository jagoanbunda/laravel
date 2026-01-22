<?php

namespace Tests\Feature;

use App\Models\Child;
use App\Models\PmtLog;
use App\Models\PmtMenu;
use App\Models\PmtProgram;
use App\Models\PmtSchedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PmtReportsTest extends TestCase
{
    use RefreshDatabase;

    protected User $nakes;

    protected User $parent;

    protected Child $child;

    protected PmtProgram $program;

    protected function setUp(): void
    {
        parent::setUp();

        // Create nakes user for web routes
        $this->nakes = User::factory()->asNakes()->create();

        // Create parent user and child
        $this->parent = User::factory()->asParent()->create();
        $this->child = Child::factory()->create(['user_id' => $this->parent->id]);

        // Create a PMT program with schedules
        $this->program = PmtProgram::factory()->create([
            'child_id' => $this->child->id,
            'created_by' => $this->nakes->id,
        ]);
    }

    public function test_unauthenticated_user_redirected_to_login(): void
    {
        $response = $this->get(route('pmt.reports.index'));

        $response->assertRedirect(route('login'));
    }

    public function test_authenticated_nakes_can_view_reports_page(): void
    {
        $response = $this->actingAs($this->nakes)
            ->get(route('pmt.reports.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('pmt/reports/index')
                ->has('logs')
                ->has('stats')
                ->has('programs')
                ->has('filters')
        );
    }

    public function test_reports_page_shows_pmt_logs(): void
    {
        $menu = PmtMenu::factory()->create();
        $schedule = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);

        PmtLog::factory()->create([
            'schedule_id' => $schedule->id,
            'portion' => 'habis',
        ]);

        $response = $this->actingAs($this->nakes)
            ->get(route('pmt.reports.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->component('pmt/reports/index')
                ->has('logs.data', 1)
        );
    }

    public function test_can_filter_by_date_from(): void
    {
        $menu = PmtMenu::factory()->create();

        // Schedule and log from yesterday
        $schedule1 = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);
        PmtLog::factory()->create([
            'schedule_id' => $schedule1->id,
            'logged_at' => now()->subDay(),
        ]);

        // Schedule and log from today
        $schedule2 = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);
        PmtLog::factory()->create([
            'schedule_id' => $schedule2->id,
            'logged_at' => now(),
        ]);

        // Filter from today - should only get 1 result
        $response = $this->actingAs($this->nakes)
            ->get(route('pmt.reports.index', ['date_from' => now()->format('Y-m-d')]));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('logs.data', 1)
        );
    }

    public function test_can_filter_by_date_to(): void
    {
        $menu = PmtMenu::factory()->create();

        // Schedule and log from 3 days ago
        $schedule1 = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);
        PmtLog::factory()->create([
            'schedule_id' => $schedule1->id,
            'logged_at' => now()->subDays(3),
        ]);

        // Schedule and log from today
        $schedule2 = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);
        PmtLog::factory()->create([
            'schedule_id' => $schedule2->id,
            'logged_at' => now(),
        ]);

        // Filter to yesterday - should only get 1 result (the old one)
        $response = $this->actingAs($this->nakes)
            ->get(route('pmt.reports.index', ['date_to' => now()->subDay()->format('Y-m-d')]));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('logs.data', 1)
        );
    }

    public function test_can_filter_by_program_id(): void
    {
        $menu = PmtMenu::factory()->create();

        // Create schedule for first program
        $schedule1 = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);
        PmtLog::factory()->create(['schedule_id' => $schedule1->id]);

        // Create another program and schedule
        $anotherChild = Child::factory()->create(['user_id' => $this->parent->id]);
        $anotherProgram = PmtProgram::factory()->create([
            'child_id' => $anotherChild->id,
            'created_by' => $this->nakes->id,
        ]);
        $schedule2 = PmtSchedule::factory()->create([
            'program_id' => $anotherProgram->id,
            'child_id' => $anotherChild->id,
            'menu_id' => $menu->id,
        ]);
        PmtLog::factory()->create(['schedule_id' => $schedule2->id]);

        // Filter by first program
        $response = $this->actingAs($this->nakes)
            ->get(route('pmt.reports.index', ['program_id' => $this->program->id]));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('logs.data', 1)
        );
    }

    public function test_can_filter_by_portion(): void
    {
        $menu = PmtMenu::factory()->create();

        // Create separate schedules for each log (unique constraint on schedule_id)
        $schedule1 = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);
        $schedule2 = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);
        $schedule3 = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);

        // Create logs with different portions
        PmtLog::factory()->full()->create(['schedule_id' => $schedule1->id]);
        PmtLog::factory()->half()->create(['schedule_id' => $schedule2->id]);
        PmtLog::factory()->none()->create(['schedule_id' => $schedule3->id]);

        // Filter by 'habis' portion
        $response = $this->actingAs($this->nakes)
            ->get(route('pmt.reports.index', ['portion' => 'habis']));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('logs.data', 1)
        );
    }

    public function test_can_search_by_child_name(): void
    {
        $menu = PmtMenu::factory()->create();

        // Create a child with unique name
        $uniqueChild = Child::factory()->create([
            'user_id' => $this->parent->id,
            'name' => 'UniqueChildSearchName',
        ]);
        $uniqueProgram = PmtProgram::factory()->create([
            'child_id' => $uniqueChild->id,
            'created_by' => $this->nakes->id,
        ]);
        $schedule = PmtSchedule::factory()->create([
            'program_id' => $uniqueProgram->id,
            'child_id' => $uniqueChild->id,
            'menu_id' => $menu->id,
        ]);
        PmtLog::factory()->create(['schedule_id' => $schedule->id]);

        // Create another log for different child
        $otherSchedule = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);
        PmtLog::factory()->create(['schedule_id' => $otherSchedule->id]);

        // Search by unique name
        $response = $this->actingAs($this->nakes)
            ->get(route('pmt.reports.index', ['search' => 'UniqueChildSearchName']));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('logs.data', 1)
        );
    }

    public function test_stats_calculate_correctly(): void
    {
        $menu = PmtMenu::factory()->create();

        // Create schedules
        $schedule1 = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);
        $schedule2 = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);
        $schedule3 = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);

        // Create logs for 2 out of 3 schedules
        PmtLog::factory()->full()->create(['schedule_id' => $schedule1->id]);
        PmtLog::factory()->half()->create(['schedule_id' => $schedule2->id]);

        $response = $this->actingAs($this->nakes)
            ->get(route('pmt.reports.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('stats')
                ->where('stats.total_schedules', 3)
                ->where('stats.total_logged', 2)
                ->where('stats.pending', 1)
        );
    }

    public function test_export_returns_excel_file(): void
    {
        $menu = PmtMenu::factory()->create();
        $schedule = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);
        PmtLog::factory()->create(['schedule_id' => $schedule->id]);

        $response = $this->actingAs($this->nakes)
            ->get(route('pmt.reports.export'));

        $response->assertStatus(200);
        $response->assertDownload();
    }

    public function test_export_with_filters_returns_excel_file(): void
    {
        $menu = PmtMenu::factory()->create();
        $schedule = PmtSchedule::factory()->create([
            'program_id' => $this->program->id,
            'child_id' => $this->child->id,
            'menu_id' => $menu->id,
        ]);
        PmtLog::factory()->full()->create(['schedule_id' => $schedule->id]);

        $response = $this->actingAs($this->nakes)
            ->get(route('pmt.reports.export', [
                'date_from' => now()->subMonth()->format('Y-m-d'),
                'date_to' => now()->format('Y-m-d'),
                'portion' => 'habis',
            ]));

        $response->assertStatus(200);
        $response->assertDownload();
    }

    public function test_export_route_requires_authentication(): void
    {
        $response = $this->get(route('pmt.reports.export'));

        $response->assertRedirect(route('login'));
    }

    public function test_reports_page_returns_correct_filters_in_response(): void
    {
        $response = $this->actingAs($this->nakes)
            ->get(route('pmt.reports.index', [
                'search' => 'test',
                'date_from' => '2025-01-01',
                'date_to' => '2025-01-31',
                'program_id' => $this->program->id,
                'portion' => 'habis',
            ]));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->where('filters.search', 'test')
                ->where('filters.date_from', '2025-01-01')
                ->where('filters.date_to', '2025-01-31')
                ->where('filters.program_id', (string) $this->program->id)
                ->where('filters.portion', 'habis')
        );
    }

    public function test_reports_page_returns_programs_for_filter_dropdown(): void
    {
        $response = $this->actingAs($this->nakes)
            ->get(route('pmt.reports.index'));

        $response->assertStatus(200);
        $response->assertInertia(
            fn ($page) => $page
                ->has('programs')
        );
    }
}
