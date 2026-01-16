<?php

namespace Database\Seeders;

use App\Models\Food;
use Illuminate\Database\Seeder;

class FoodSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $csvPath = base_path('DATA MAKANAN.csv');

        if (! file_exists($csvPath)) {
            $this->command->error("CSV file not found: {$csvPath}");

            return;
        }

        $handle = fopen($csvPath, 'r');
        if ($handle === false) {
            $this->command->error("Could not open CSV file: {$csvPath}");

            return;
        }

        // Skip header rows (line 1: column names, line 2: units)
        fgetcsv($handle);
        fgetcsv($handle);

        $count = 0;
        while (($row = fgetcsv($handle)) !== false) {
            // Skip empty rows or rows without a name
            if (empty($row[0]) || trim($row[0]) === '') {
                continue;
            }

            $name = trim($row[0]);

            // Stop when reaching summary/footer rows
            if (str_starts_with($name, 'Perbedaan') || str_starts_with($name, 'jml:')) {
                break;
            }

            $servingSize = $this->parseNumber($row[1] ?? '100');
            $calories = $this->parseNumber($row[2] ?? '0');
            $protein = $this->parseNumber($row[3] ?? '0');
            $fat = $this->parseNumber($row[4] ?? '0');
            $carbohydrate = $this->parseNumber($row[5] ?? '0');

            // Determine category based on food name
            $category = $this->determineCategory($name);
            $icon = $this->determineIcon($category);

            Food::updateOrCreate(
                ['name' => $name],
                [
                    'category' => $category,
                    'icon' => $icon,
                    'serving_size' => $servingSize,
                    'calories' => $calories,
                    'protein' => $protein,
                    'fat' => $fat,
                    'carbohydrate' => $carbohydrate,
                    'fiber' => 0,
                    'sugar' => 0,
                    'is_active' => true,
                    'is_system' => true,
                    'created_by' => null,
                ]
            );
            $count++;
        }

        fclose($handle);

        $this->command->info("Seeded {$count} foods from CSV.");
    }

    /**
     * Parse a number from CSV cell, handling various formats.
     */
    private function parseNumber(string $value): float
    {
        $value = trim($value);
        if ($value === '' || $value === '-') {
            return 0;
        }

        // Remove any non-numeric characters except dot and comma
        $value = preg_replace('/[^\d.,\-]/', '', $value);
        $value = str_replace(',', '.', $value);

        return (float) $value;
    }

    /**
     * Determine food category based on name.
     */
    private function determineCategory(string $name): string
    {
        $nameLower = strtolower($name);

        // Susu & Produk Susu
        if (str_contains($nameLower, 'susu') || str_contains($nameLower, 'milo') || str_contains($nameLower, 'dancow') || str_contains($nameLower, 'bebelac') || str_contains($nameLower, 'ultra milk')) {
            return 'Susu';
        }

        // Buah
        $fruits = ['apel', 'pisang', 'jeruk', 'pepaya', 'mangga', 'semangka', 'melon', 'duku', 'durian', 'jambu', 'nangka', 'rambutan', 'salak', 'belimbing'];
        foreach ($fruits as $fruit) {
            if (str_contains($nameLower, $fruit)) {
                return 'Buah';
            }
        }

        // Sayuran
        $vegetables = ['bayam', 'wortel', 'kangkung', 'sawi', 'sayur', 'labu', 'bening', 'tumis', 'selada'];
        foreach ($vegetables as $veg) {
            if (str_contains($nameLower, $veg)) {
                return 'Sayuran';
            }
        }

        // Protein - Daging & Telur
        $proteins = ['ayam', 'daging', 'telur', 'ikan', 'udang', 'cumi', 'tempe', 'tahu', 'bakso', 'sate', 'abon', 'ati', 'hati', 'usus', 'jerohan'];
        foreach ($proteins as $protein) {
            if (str_contains($nameLower, $protein)) {
                return 'Protein';
            }
        }

        // Kacang-kacangan
        if (str_contains($nameLower, 'kacang') || str_contains($nameLower, 'kedele') || str_contains($nameLower, 'toge')) {
            return 'Kacang';
        }

        // Karbohidrat
        $carbs = ['nasi', 'beras', 'roti', 'mie', 'kentang', 'singkong', 'ubi', 'tepung', 'bubur', 'bihun', 'makaroni', 'jagung', 'talas', 'lontong', 'ketupat', 'intip', 'soun', 'misoa'];
        foreach ($carbs as $carb) {
            if (str_contains($nameLower, $carb)) {
                return 'Karbohidrat';
            }
        }

        // Camilan/Snack
        $snacks = ['biskuit', 'oreo', 'tango', 'krupuk', 'kerupuk', 'cilok', 'cireng', 'bakwan', 'donat', 'kue', 'nastar', 'risoles', 'pastel', 'lumpia', 'lemper', 'martabak', 'nagasari'];
        foreach ($snacks as $snack) {
            if (str_contains($nameLower, $snack)) {
                return 'Camilan';
            }
        }

        // Minuman
        if (str_contains($nameLower, 'teh') || str_contains($nameLower, 'es ') || str_contains($nameLower, 'jus') || str_contains($nameLower, 'minuman')) {
            return 'Minuman';
        }

        // Default
        return 'Lainnya';
    }

    /**
     * Determine icon based on category.
     */
    private function determineIcon(string $category): string
    {
        return match ($category) {
            'Karbohidrat' => 'rice_bowl',
            'Protein' => 'restaurant',
            'Sayuran' => 'eco',
            'Buah' => 'nutrition',
            'Susu' => 'local_drink',
            'Kacang' => 'spa',
            'Camilan' => 'cookie',
            'Minuman' => 'local_cafe',
            default => 'restaurant_menu',
        };
    }
}
