<?php

namespace App\Console\Commands;

use App\Models\Asq3AgeInterval;
use App\Models\Asq3Domain;
use App\Models\Asq3Question;
use Illuminate\Console\Command;

class SyncAsq3ImagesCommand extends Command
{
    protected $signature = 'asq3:sync-images 
        {--dry-run : Show what would be updated without making changes}';

    protected $description = 'Sync generated ASQ-3 question images to database';

    private array $domainMapping = [
        'komunikasi' => 'communication',
        'motorik-kasar' => 'gross_motor',
        'motorik-halus' => 'fine_motor',
        'pemecahan-masalah' => 'problem_solving',
        'personal-sosial' => 'personal_social',
    ];

    private array $ageMapping = [
        '2-bulan' => 2,
        '4-bulan' => 4,
        '6-bulan' => 6,
        '8-bulan' => 8,
        '9-bulan' => 9,
        '10-bulan' => 10,
        '12-bulan' => 12,
        '14-bulan' => 14,
        '16-bulan' => 16,
        '18-bulan' => 18,
        '20-bulan' => 20,
        '22-bulan' => 22,
        '24-bulan' => 24,
        '27-bulan' => 27,
        '30-bulan' => 30,
        '33-bulan' => 33,
        '36-bulan' => 36,
        '42-bulan' => 42,
        '48-bulan' => 48,
        '54-bulan' => 54,
        '60-bulan' => 60,
    ];

    public function handle(): int
    {
        $this->info('Syncing ASQ-3 question images to database...');

        $imagesPath = storage_path('app/public/asq3-images');

        if (! is_dir($imagesPath)) {
            $this->error("Images directory not found: {$imagesPath}");

            return Command::FAILURE;
        }

        $files = glob("{$imagesPath}/*.png");
        $this->info('Found '.count($files).' image files');

        $synced = 0;
        $notFound = 0;
        $alreadyHadImage = 0;
        $errors = 0;

        foreach ($files as $file) {
            $filename = basename($file, '.png');

            $parts = explode('_', $filename);
            if (count($parts) !== 3) {
                $this->warn("Invalid filename format: {$filename}");
                $errors++;

                continue;
            }

            [$agePart, $domainPart, $numberPart] = $parts;

            $ageMonths = $this->ageMapping[$agePart] ?? null;
            if (! $ageMonths) {
                $this->warn("Unknown age: {$agePart}");
                $errors++;

                continue;
            }

            $ageInterval = Asq3AgeInterval::where('min_age_months', '<=', $ageMonths)
                ->where('max_age_months', '>=', $ageMonths)
                ->first();

            if (! $ageInterval) {
                $this->warn("Age interval not found for {$ageMonths} months");
                $errors++;

                continue;
            }

            $domainCode = $this->domainMapping[$domainPart] ?? null;
            if (! $domainCode) {
                $this->warn("Unknown domain: {$domainPart}");
                $errors++;

                continue;
            }

            $domain = Asq3Domain::where('code', $domainCode)->first();
            if (! $domain) {
                $this->warn("Domain not found: {$domainCode}");
                $errors++;

                continue;
            }

            $question = Asq3Question::where('age_interval_id', $ageInterval->id)
                ->where('domain_id', $domain->id)
                ->where('question_number', (int) $numberPart)
                ->first();

            if (! $question) {
                $this->warn("Question not found: {$filename}");
                $notFound++;

                continue;
            }

            if ($question->image_url && ! $this->option('dry-run')) {
                $alreadyHadImage++;

                continue;
            }

            $imageUrl = "/storage/asq3-images/{$filename}.png";

            if ($this->option('dry-run')) {
                $this->line("Would update question #{$question->id}: {$imageUrl}");
            } else {
                $question->update(['image_url' => $imageUrl]);
            }

            $synced++;
        }

        $this->newLine();
        $this->info('=== Sync Summary ===');
        $this->info("Synced: {$synced}");
        $this->info("Already had image: {$alreadyHadImage}");
        $this->info("Not found in DB: {$notFound}");
        $this->info("Errors: {$errors}");

        if ($this->option('dry-run')) {
            $this->warn('Dry-run mode - no changes were made');
        }

        return Command::SUCCESS;
    }
}
