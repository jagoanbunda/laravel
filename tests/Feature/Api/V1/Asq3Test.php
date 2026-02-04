<?php

namespace Tests\Feature\Api\V1;

use App\Models\Asq3AgeInterval;
use App\Models\Asq3Domain;
use App\Models\Asq3Screening;
use App\Models\Child;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class Asq3Test extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed required ASQ3 master data for tests
        $this->seedAsq3MasterData();
    }

    private function seedAsq3MasterData(): void
    {
        // Create domains
        $domains = [
            ['code' => 'communication', 'name' => 'Komunikasi', 'description' => 'Kemampuan berkomunikasi', 'display_order' => 1],
            ['code' => 'gross_motor', 'name' => 'Motorik Kasar', 'description' => 'Kemampuan motorik kasar', 'display_order' => 2],
            ['code' => 'fine_motor', 'name' => 'Motorik Halus', 'description' => 'Kemampuan motorik halus', 'display_order' => 3],
            ['code' => 'problem_solving', 'name' => 'Pemecahan Masalah', 'description' => 'Kemampuan pemecahan masalah', 'display_order' => 4],
            ['code' => 'personal_social', 'name' => 'Personal Sosial', 'description' => 'Kemampuan personal sosial', 'display_order' => 5],
        ];

        foreach ($domains as $domain) {
            Asq3Domain::create($domain);
        }

        // Create age intervals - match migration schema exactly
        $intervals = [
            ['age_months' => 2, 'min_age_months' => 1, 'max_age_months' => 2, 'age_label' => '2 Bulan', 'min_age_days' => 30, 'max_age_days' => 89],
            ['age_months' => 4, 'min_age_months' => 3, 'max_age_months' => 4, 'age_label' => '4 Bulan', 'min_age_days' => 90, 'max_age_days' => 149],
            ['age_months' => 6, 'min_age_months' => 5, 'max_age_months' => 6, 'age_label' => '6 Bulan', 'min_age_days' => 150, 'max_age_days' => 209],
            ['age_months' => 12, 'min_age_months' => 11, 'max_age_months' => 13, 'age_label' => '12 Bulan', 'min_age_days' => 330, 'max_age_days' => 389],
            ['age_months' => 24, 'min_age_months' => 23, 'max_age_months' => 25, 'age_label' => '24 Bulan', 'min_age_days' => 690, 'max_age_days' => 749],
        ];

        foreach ($intervals as $interval) {
            Asq3AgeInterval::create($interval);
        }
    }

    /**
     * T067: Test get domains
     */
    public function test_get_domains_returns_domain_list(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/asq3/domains');

        $response->assertOk()
            ->assertJsonStructure([
                'domains',
            ]);
    }

    /**
     * T068: Test get age intervals
     */
    public function test_get_age_intervals_returns_intervals(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/asq3/age-intervals');

        $response->assertOk()
            ->assertJsonStructure([
                'age_intervals',
            ]);
    }

    /**
     * T069: Test get questions for interval
     */
    public function test_get_questions_for_interval(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $interval = Asq3AgeInterval::first();

        $response = $this->getJson("/api/v1/asq3/age-intervals/{$interval->id}/questions");

        $response->assertOk()
            ->assertJsonStructure([
                'age_interval',
                'questions_by_domain',
            ]);
    }

    /**
     * T070: Test get recommendations
     */
    public function test_get_recommendations_returns_list(): void
    {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/asq3/recommendations');

        $response->assertOk();
    }

    /**
     * T071: Test list screenings
     */
    public function test_list_screenings_returns_200(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();

        $interval = Asq3AgeInterval::first();
        Asq3Screening::factory()->count(2)->for($child)->create(['age_interval_id' => $interval->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings");

        $response->assertOk()
            ->assertJsonStructure([
                'screenings',
                'pagination',
            ]);
    }

    /**
     * T072: Test list screenings requires child ownership
     */
    public function test_list_screenings_requires_child_ownership(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($otherUser)->create();

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings");

        $response->assertForbidden();
    }

    /**
     * T073: Test start screening - child needs to be in valid age range
     */
    public function test_start_screening_returns_201(): void
    {
        $user = User::factory()->create();
        // Create a 12-month-old child (within a valid age interval)
        $child = Child::factory()->for($user)->create([
            'birthday' => now()->subMonths(12),
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/children/{$child->id}/screenings");

        $response->assertCreated();

        $this->assertDatabaseHas('asq3_screenings', [
            'child_id' => $child->id,
        ]);
    }

    /**
     * T073b: Test start screening fails for child outside age range
     */
    public function test_start_screening_fails_for_invalid_age(): void
    {
        $user = User::factory()->create();
        // Create a child that's 8 years old - outside ASQ-3 age range
        $child = Child::factory()->for($user)->create([
            'birthday' => now()->subYears(8),
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/children/{$child->id}/screenings");

        $response->assertUnprocessable();
    }

    /**
     * T074: Test get screening
     */
    public function test_get_screening_returns_200(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $interval = Asq3AgeInterval::first();
        $screening = Asq3Screening::factory()->for($child)->create(['age_interval_id' => $interval->id]);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings/{$screening->id}");

        $response->assertOk()
            ->assertJsonStructure([
                'screening',
            ]);
    }

    /**
     * T075: Test update screening - note: status 'completed' is not allowed via update
     */
    public function test_update_screening_returns_200(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $interval = Asq3AgeInterval::first();
        $screening = Asq3Screening::factory()->for($child)->create([
            'age_interval_id' => $interval->id,
            'status' => 'in_progress',
        ]);
        Sanctum::actingAs($user);

        $response = $this->putJson("/api/v1/children/{$child->id}/screenings/{$screening->id}", [
            'notes' => 'Test notes',
        ]);

        $response->assertOk();
    }

    /**
     * T076: Test submit answers - need valid question IDs
     */
    public function test_submit_answers_creates_records(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $interval = Asq3AgeInterval::first();
        $screening = Asq3Screening::factory()->for($child)->create([
            'age_interval_id' => $interval->id,
            'status' => 'in_progress',
        ]);
        Sanctum::actingAs($user);

        // Create some test questions for this interval
        $domain = Asq3Domain::first();
        $questions = [];
        for ($i = 1; $i <= 2; $i++) {
            $questions[] = \App\Models\Asq3Question::create([
                'age_interval_id' => $interval->id,
                'domain_id' => $domain->id,
                'question_number' => $i,
                'question_text' => "Test question {$i}",
                'display_order' => $i,
            ]);
        }

        $response = $this->postJson("/api/v1/children/{$child->id}/screenings/{$screening->id}/answers", [
            'answers' => [
                ['question_id' => $questions[0]->id, 'answer' => 'yes'],
                ['question_id' => $questions[1]->id, 'answer' => 'sometimes'],
            ],
        ]);

        $response->assertOk();
    }

    /**
     * T077: Test submit answers validation
     */
    public function test_submit_answers_validates_response_enum(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $interval = Asq3AgeInterval::first();
        $screening = Asq3Screening::factory()->for($child)->create([
            'age_interval_id' => $interval->id,
            'status' => 'in_progress',
        ]);
        Sanctum::actingAs($user);

        $response = $this->postJson("/api/v1/children/{$child->id}/screenings/{$screening->id}/answers", [
            'answers' => [
                ['question_id' => 1, 'answer' => 'invalid_response'],
            ],
        ]);

        $response->assertUnprocessable();
    }

    /**
     * T078: Test get screening results
     */
    public function test_get_screening_results_returns_200(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $interval = Asq3AgeInterval::first();
        $screening = Asq3Screening::factory()->for($child)->create([
            'age_interval_id' => $interval->id,
            'status' => 'completed',
            'completed_at' => now(),
            'overall_status' => 'sesuai',
        ]);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings/{$screening->id}/results");

        $response->assertOk();
    }

    /**
     * T079: Test results include domain scores
     */
    public function test_results_include_domain_scores_and_status(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $interval = Asq3AgeInterval::first();
        $screening = Asq3Screening::factory()->for($child)->create([
            'age_interval_id' => $interval->id,
            'status' => 'completed',
            'completed_at' => now(),
            'overall_status' => 'sesuai',
        ]);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings/{$screening->id}/results");

        $response->assertOk()
            ->assertJsonStructure([
                'screening',
            ]);
    }

    /**
     * T080: Test screening authorization
     */
    public function test_screening_authorization_returns_403_for_wrong_user(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($otherUser)->create();
        $interval = Asq3AgeInterval::first();
        $screening = Asq3Screening::factory()->for($child)->create(['age_interval_id' => $interval->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings/{$screening->id}");

        $response->assertForbidden();
    }

    /**
     * T081: Test screening not found
     */
    public function test_screening_not_found_returns_404(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings/99999");

        $response->assertNotFound();
    }

    /**
     * T082: Test master data requires auth
     */
    public function test_domains_require_authentication(): void
    {
        $response = $this->getJson('/api/v1/asq3/domains');

        $response->assertUnauthorized();
    }

    public function test_age_intervals_require_authentication(): void
    {
        $response = $this->getJson('/api/v1/asq3/age-intervals');

        $response->assertUnauthorized();
    }

    public function test_screenings_require_authentication(): void
    {
        $child = Child::factory()->create();

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings");

        $response->assertUnauthorized();
    }

    /**
     * Test get progress returns correct data for in-progress screening
     */
    public function test_get_progress_returns_correct_data(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $interval = Asq3AgeInterval::first();
        $domain = Asq3Domain::first();
        $screening = Asq3Screening::factory()->for($child)->create([
            'age_interval_id' => $interval->id,
            'status' => 'in_progress',
        ]);
        Sanctum::actingAs($user);

        $question1 = \App\Models\Asq3Question::create([
            'age_interval_id' => $interval->id,
            'domain_id' => $domain->id,
            'question_number' => 1,
            'question_text' => 'Test question 1',
            'display_order' => 1,
        ]);
        $question2 = \App\Models\Asq3Question::create([
            'age_interval_id' => $interval->id,
            'domain_id' => $domain->id,
            'question_number' => 2,
            'question_text' => 'Test question 2',
            'display_order' => 2,
        ]);

        \App\Models\Asq3ScreeningAnswer::create([
            'screening_id' => $screening->id,
            'question_id' => $question1->id,
            'answer' => 'yes',
            'score' => 10,
        ]);
        \App\Models\Asq3ScreeningAnswer::create([
            'screening_id' => $screening->id,
            'question_id' => $question2->id,
            'answer' => 'sometimes',
            'score' => 5,
        ]);

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings/{$screening->id}/progress");

        $response->assertOk()
            ->assertJsonStructure([
                'data' => [
                    'screening_id',
                    'status',
                    'total_questions',
                    'answered_questions',
                    'progress_percent',
                    'last_saved_at',
                    'domains',
                    'answered_question_ids',
                    'answers',
                ],
            ])
            ->assertJsonPath('data.screening_id', $screening->id)
            ->assertJsonPath('data.status', 'in_progress')
            ->assertJsonPath('data.answered_questions', 2);
    }

    /**
     * Test get progress for empty screening (0 answers)
     */
    public function test_get_progress_for_empty_screening(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $interval = Asq3AgeInterval::first();
        $screening = Asq3Screening::factory()->for($child)->create([
            'age_interval_id' => $interval->id,
            'status' => 'in_progress',
        ]);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings/{$screening->id}/progress");

        $response->assertOk()
            ->assertJsonPath('data.answered_questions', 0)
            ->assertJsonPath('data.progress_percent', 0);
    }

    /**
     * Test get progress for completed screening
     */
    public function test_get_progress_for_completed_screening(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $interval = Asq3AgeInterval::first();
        $screening = Asq3Screening::factory()->for($child)->create([
            'age_interval_id' => $interval->id,
            'status' => 'completed',
            'completed_at' => now(),
            'overall_status' => 'sesuai',
        ]);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings/{$screening->id}/progress");

        $response->assertOk()
            ->assertJsonPath('data.status', 'completed');
    }

    /**
     * Test get progress for cancelled screening
     */
    public function test_get_progress_for_cancelled_screening(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $interval = Asq3AgeInterval::first();
        $screening = Asq3Screening::factory()->for($child)->create([
            'age_interval_id' => $interval->id,
            'status' => 'cancelled',
        ]);
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings/{$screening->id}/progress");

        $response->assertOk()
            ->assertJsonPath('data.status', 'cancelled');
    }

    /**
     * Test get progress requires child ownership
     */
    public function test_get_progress_requires_child_ownership(): void
    {
        $user = User::factory()->create();
        $otherUser = User::factory()->create();
        $child = Child::factory()->for($otherUser)->create();
        $interval = Asq3AgeInterval::first();
        $screening = Asq3Screening::factory()->for($child)->create(['age_interval_id' => $interval->id]);

        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings/{$screening->id}/progress");

        $response->assertForbidden();
    }

    /**
     * Test get progress requires authentication
     */
    public function test_get_progress_requires_authentication(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $interval = Asq3AgeInterval::first();
        $screening = Asq3Screening::factory()->for($child)->create(['age_interval_id' => $interval->id]);

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings/{$screening->id}/progress");

        $response->assertUnauthorized();
    }

    /**
     * Test get progress returns 404 for invalid screening
     */
    public function test_get_progress_returns_404_for_invalid_screening(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        Sanctum::actingAs($user);

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings/99999/progress");

        $response->assertNotFound();
    }

    /**
     * Test get progress calculates domain progress correctly
     */
    public function test_get_progress_calculates_domain_progress_correctly(): void
    {
        $user = User::factory()->create();
        $child = Child::factory()->for($user)->create();
        $interval = Asq3AgeInterval::first();
        $communicationDomain = Asq3Domain::where('code', 'communication')->first();
        $screening = Asq3Screening::factory()->for($child)->create([
            'age_interval_id' => $interval->id,
            'status' => 'in_progress',
        ]);
        Sanctum::actingAs($user);

        $questions = [];
        for ($i = 1; $i <= 3; $i++) {
            $questions[] = \App\Models\Asq3Question::create([
                'age_interval_id' => $interval->id,
                'domain_id' => $communicationDomain->id,
                'question_number' => $i,
                'question_text' => "Communication question {$i}",
                'display_order' => $i,
            ]);
        }

        foreach ($questions as $question) {
            \App\Models\Asq3ScreeningAnswer::create([
                'screening_id' => $screening->id,
                'question_id' => $question->id,
                'answer' => 'yes',
                'score' => 10,
            ]);
        }

        $response = $this->getJson("/api/v1/children/{$child->id}/screenings/{$screening->id}/progress");

        $response->assertOk();

        $domains = $response->json('data.domains');
        $communicationProgress = collect($domains)->firstWhere('domain_code', 'communication');

        $this->assertEquals(3, $communicationProgress['answered_questions']);
        $this->assertEquals(50, $communicationProgress['progress_percent']);
    }
}
