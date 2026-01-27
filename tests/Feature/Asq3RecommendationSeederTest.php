<?php

namespace Tests\Feature;

use App\Models\Asq3AgeInterval;
use App\Models\Asq3Domain;
use App\Models\Asq3Recommendation;
use Database\Seeders\Asq3AgeIntervalSeeder;
use Database\Seeders\Asq3DomainSeeder;
use Database\Seeders\Asq3RecommendationSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Asq3RecommendationSeederTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed([
            Asq3DomainSeeder::class,
            Asq3AgeIntervalSeeder::class,
        ]);
    }

    public function test_seeder_creates_minimum_150_recommendations(): void
    {
        $this->seed(Asq3RecommendationSeeder::class);

        $count = Asq3Recommendation::count();

        $this->assertGreaterThanOrEqual(150, $count, "Expected at least 150 recommendations, got {$count}");
    }

    public function test_seeder_covers_all_five_domains(): void
    {
        $this->seed(Asq3RecommendationSeeder::class);

        $domainsCovered = Asq3Recommendation::distinct('domain_id')->count();

        $this->assertEquals(5, $domainsCovered, "Expected 5 domains to be covered, got {$domainsCovered}");
    }

    public function test_seeder_covers_all_21_age_intervals(): void
    {
        $this->seed(Asq3RecommendationSeeder::class);

        $intervalsCovered = Asq3Recommendation::distinct('age_interval_id')->count();

        $this->assertEquals(21, $intervalsCovered, "Expected 21 age intervals to be covered, got {$intervalsCovered}");
    }

    public function test_each_domain_has_recommendations(): void
    {
        $this->seed(Asq3RecommendationSeeder::class);

        $domains = Asq3Domain::all();

        foreach ($domains as $domain) {
            $count = Asq3Recommendation::where('domain_id', $domain->id)->count();

            $this->assertGreaterThan(0, $count, "Domain {$domain->code} has no recommendations");
        }
    }

    public function test_each_age_interval_has_recommendations(): void
    {
        $this->seed(Asq3RecommendationSeeder::class);

        $intervals = Asq3AgeInterval::all();

        foreach ($intervals as $interval) {
            $count = Asq3Recommendation::where('age_interval_id', $interval->id)->count();

            $this->assertGreaterThan(0, $count, "Age interval {$interval->age_label} has no recommendations");
        }
    }

    public function test_recommendations_have_valid_text(): void
    {
        $this->seed(Asq3RecommendationSeeder::class);

        $recommendations = Asq3Recommendation::all();

        foreach ($recommendations as $recommendation) {
            $this->assertNotEmpty($recommendation->recommendation_text);
            $this->assertGreaterThanOrEqual(10, mb_strlen($recommendation->recommendation_text), 'Recommendation text is too short');
        }
    }

    public function test_seeder_is_idempotent(): void
    {
        $this->seed(Asq3RecommendationSeeder::class);
        $countAfterFirst = Asq3Recommendation::count();

        $this->seed(Asq3RecommendationSeeder::class);
        $countAfterSecond = Asq3Recommendation::count();

        $this->assertEquals($countAfterFirst, $countAfterSecond, 'Seeder should be idempotent - running twice should not duplicate records');
    }

    public function test_recommendations_are_in_indonesian(): void
    {
        $this->seed(Asq3RecommendationSeeder::class);

        $sample = Asq3Recommendation::first();

        $indonesianPatterns = ['/anak/i', '/bermain/i', '/ajak/i', '/latih/i', '/dengan/i', '/bayi/i', '/Bicara/i', '/untuk/i'];
        $hasIndonesian = false;

        foreach ($indonesianPatterns as $pattern) {
            if (preg_match($pattern, $sample->recommendation_text)) {
                $hasIndonesian = true;

                break;
            }
        }

        $this->assertTrue($hasIndonesian, 'Recommendation text should be in Indonesian');
    }
}
