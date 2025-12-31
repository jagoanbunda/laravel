<?php

namespace App\Services;

use App\Models\AnthropometryMeasurement;
use App\Models\Child;
use Carbon\Carbon;

/**
 * Service untuk menghitung Z-Score berdasarkan standar WHO.
 *
 * Menggunakan metode LMS (Lambda-Mu-Sigma) dari WHO Child Growth Standards.
 * Referensi: https://www.who.int/tools/child-growth-standards
 */
class WhoZScoreService
{
   /**
    * Data LMS WHO untuk Weight-for-Age (0-60 bulan).
    * Format: age_months => ['L' => lambda, 'M' => median, 'S' => coefficient of variation]
    * Sumber: WHO Child Growth Standards
    */
   private array $weightForAgeBoys = [
      0 => ['L' => 0.3487, 'M' => 3.3464, 'S' => 0.14602],
      1 => ['L' => 0.2297, 'M' => 4.4709, 'S' => 0.13395],
      2 => ['L' => 0.1970, 'M' => 5.5675, 'S' => 0.12385],
      3 => ['L' => 0.1738, 'M' => 6.3762, 'S' => 0.11727],
      4 => ['L' => 0.1553, 'M' => 7.0023, 'S' => 0.11316],
      5 => ['L' => 0.1395, 'M' => 7.5105, 'S' => 0.11080],
      6 => ['L' => 0.1257, 'M' => 7.9340, 'S' => 0.10958],
      7 => ['L' => 0.1134, 'M' => 8.2970, 'S' => 0.10902],
      8 => ['L' => 0.1021, 'M' => 8.6151, 'S' => 0.10882],
      9 => ['L' => 0.0917, 'M' => 8.9014, 'S' => 0.10882],
      10 => ['L' => 0.0820, 'M' => 9.1649, 'S' => 0.10891],
      11 => ['L' => 0.0730, 'M' => 9.4122, 'S' => 0.10906],
      12 => ['L' => 0.0644, 'M' => 9.6479, 'S' => 0.10925],
      18 => ['L' => 0.0308, 'M' => 10.8500, 'S' => 0.11037],
      24 => ['L' => 0.0128, 'M' => 12.1515, 'S' => 0.11273],
      36 => ['L' => -0.0056, 'M' => 14.3439, 'S' => 0.11668],
      48 => ['L' => -0.0160, 'M' => 16.3396, 'S' => 0.12014],
      60 => ['L' => -0.0220, 'M' => 18.3690, 'S' => 0.12403],
   ];

   private array $weightForAgeGirls = [
      0 => ['L' => 0.3809, 'M' => 3.2322, 'S' => 0.14171],
      1 => ['L' => 0.1714, 'M' => 4.1873, 'S' => 0.13724],
      2 => ['L' => 0.0962, 'M' => 5.1282, 'S' => 0.12886],
      3 => ['L' => 0.0402, 'M' => 5.8458, 'S' => 0.12267],
      4 => ['L' => -0.0044, 'M' => 6.4237, 'S' => 0.11850],
      5 => ['L' => -0.0413, 'M' => 6.8985, 'S' => 0.11615],
      6 => ['L' => -0.0727, 'M' => 7.2970, 'S' => 0.11486],
      7 => ['L' => -0.1001, 'M' => 7.6422, 'S' => 0.11426],
      8 => ['L' => -0.1243, 'M' => 7.9487, 'S' => 0.11403],
      9 => ['L' => -0.1458, 'M' => 8.2254, 'S' => 0.11404],
      10 => ['L' => -0.1651, 'M' => 8.4800, 'S' => 0.11419],
      11 => ['L' => -0.1826, 'M' => 8.7186, 'S' => 0.11444],
      12 => ['L' => -0.1984, 'M' => 8.9481, 'S' => 0.11474],
      18 => ['L' => -0.2666, 'M' => 10.1742, 'S' => 0.11693],
      24 => ['L' => -0.3044, 'M' => 11.5017, 'S' => 0.11962],
      36 => ['L' => -0.3370, 'M' => 13.9174, 'S' => 0.12432],
      48 => ['L' => -0.3455, 'M' => 16.0692, 'S' => 0.12800],
      60 => ['L' => -0.3330, 'M' => 18.2602, 'S' => 0.13195],
   ];

   /**
    * Data LMS WHO untuk Height/Length-for-Age (0-60 bulan).
    */
   private array $heightForAgeBoys = [
      0 => ['L' => 1.0, 'M' => 49.8842, 'S' => 0.03795],
      1 => ['L' => 1.0, 'M' => 54.7244, 'S' => 0.03557],
      2 => ['L' => 1.0, 'M' => 58.4249, 'S' => 0.03424],
      3 => ['L' => 1.0, 'M' => 61.4292, 'S' => 0.03328],
      4 => ['L' => 1.0, 'M' => 63.8860, 'S' => 0.03257],
      5 => ['L' => 1.0, 'M' => 65.9026, 'S' => 0.03204],
      6 => ['L' => 1.0, 'M' => 67.6236, 'S' => 0.03162],
      7 => ['L' => 1.0, 'M' => 69.1645, 'S' => 0.03128],
      8 => ['L' => 1.0, 'M' => 70.5994, 'S' => 0.03100],
      9 => ['L' => 1.0, 'M' => 71.9687, 'S' => 0.03076],
      10 => ['L' => 1.0, 'M' => 73.2812, 'S' => 0.03056],
      11 => ['L' => 1.0, 'M' => 74.5378, 'S' => 0.03039],
      12 => ['L' => 1.0, 'M' => 75.7488, 'S' => 0.03024],
      18 => ['L' => 1.0, 'M' => 81.7058, 'S' => 0.02955],
      24 => ['L' => 1.0, 'M' => 87.1161, 'S' => 0.02899],
      36 => ['L' => 1.0, 'M' => 96.0833, 'S' => 0.02858],
      48 => ['L' => 1.0, 'M' => 103.3162, 'S' => 0.02823],
      60 => ['L' => 1.0, 'M' => 109.9090, 'S' => 0.02802],
   ];

   private array $heightForAgeGirls = [
      0 => ['L' => 1.0, 'M' => 49.1477, 'S' => 0.03790],
      1 => ['L' => 1.0, 'M' => 53.6872, 'S' => 0.03614],
      2 => ['L' => 1.0, 'M' => 57.0673, 'S' => 0.03502],
      3 => ['L' => 1.0, 'M' => 59.8029, 'S' => 0.03420],
      4 => ['L' => 1.0, 'M' => 62.0899, 'S' => 0.03361],
      5 => ['L' => 1.0, 'M' => 64.0301, 'S' => 0.03316],
      6 => ['L' => 1.0, 'M' => 65.7311, 'S' => 0.03283],
      7 => ['L' => 1.0, 'M' => 67.2873, 'S' => 0.03258],
      8 => ['L' => 1.0, 'M' => 68.7498, 'S' => 0.03237],
      9 => ['L' => 1.0, 'M' => 70.1435, 'S' => 0.03220],
      10 => ['L' => 1.0, 'M' => 71.4818, 'S' => 0.03207],
      11 => ['L' => 1.0, 'M' => 72.7714, 'S' => 0.03196],
      12 => ['L' => 1.0, 'M' => 74.0153, 'S' => 0.03187],
      18 => ['L' => 1.0, 'M' => 80.2164, 'S' => 0.03143],
      24 => ['L' => 1.0, 'M' => 85.7153, 'S' => 0.03101],
      36 => ['L' => 1.0, 'M' => 95.0569, 'S' => 0.03041],
      48 => ['L' => 1.0, 'M' => 102.6812, 'S' => 0.02997],
      60 => ['L' => 1.0, 'M' => 109.4343, 'S' => 0.02975],
   ];

   /**
    * Data LMS WHO untuk Weight-for-Height (45-120 cm untuk anak laki-laki).
    */
   private array $weightForHeightBoys = [
      45 => ['L' => 0.2581, 'M' => 2.4410, 'S' => 0.09182],
      50 => ['L' => 0.1803, 'M' => 3.4372, 'S' => 0.08854],
      55 => ['L' => 0.1373, 'M' => 4.5896, 'S' => 0.08621],
      60 => ['L' => 0.1069, 'M' => 5.8775, 'S' => 0.08488],
      65 => ['L' => 0.0824, 'M' => 7.2842, 'S' => 0.08475],
      70 => ['L' => 0.0608, 'M' => 8.7061, 'S' => 0.08594],
      75 => ['L' => 0.0405, 'M' => 10.0588, 'S' => 0.08832],
      80 => ['L' => 0.0206, 'M' => 11.3018, 'S' => 0.09151],
      85 => ['L' => 0.0003, 'M' => 12.5125, 'S' => 0.09507],
      90 => ['L' => -0.0207, 'M' => 13.7422, 'S' => 0.09877],
      95 => ['L' => -0.0424, 'M' => 15.0299, 'S' => 0.10260],
      100 => ['L' => -0.0643, 'M' => 16.3847, 'S' => 0.10647],
      105 => ['L' => -0.0858, 'M' => 17.8181, 'S' => 0.11035],
      110 => ['L' => -0.1063, 'M' => 19.3451, 'S' => 0.11421],
      115 => ['L' => -0.1254, 'M' => 21.0008, 'S' => 0.11793],
      120 => ['L' => -0.1420, 'M' => 22.8256, 'S' => 0.12130],
   ];

   private array $weightForHeightGirls = [
      45 => ['L' => 0.1391, 'M' => 2.4607, 'S' => 0.09115],
      50 => ['L' => 0.0453, 'M' => 3.4054, 'S' => 0.08957],
      55 => ['L' => -0.0219, 'M' => 4.4985, 'S' => 0.08843],
      60 => ['L' => -0.0716, 'M' => 5.7337, 'S' => 0.08771],
      65 => ['L' => -0.1106, 'M' => 7.0823, 'S' => 0.08743],
      70 => ['L' => -0.1428, 'M' => 8.4642, 'S' => 0.08785],
      75 => ['L' => -0.1706, 'M' => 9.8063, 'S' => 0.08919],
      80 => ['L' => -0.1957, 'M' => 11.0872, 'S' => 0.09133],
      85 => ['L' => -0.2193, 'M' => 12.3331, 'S' => 0.09417],
      90 => ['L' => -0.2420, 'M' => 13.5878, 'S' => 0.09758],
      95 => ['L' => -0.2645, 'M' => 14.9058, 'S' => 0.10138],
      100 => ['L' => -0.2874, 'M' => 16.3271, 'S' => 0.10539],
      105 => ['L' => -0.3110, 'M' => 17.8817, 'S' => 0.10953],
      110 => ['L' => -0.3353, 'M' => 19.5893, 'S' => 0.11375],
      115 => ['L' => -0.3597, 'M' => 21.4762, 'S' => 0.11791],
      120 => ['L' => -0.3830, 'M' => 23.5590, 'S' => 0.12177],
   ];

   /**
    * Data LMS WHO untuk BMI-for-Age (0-60 bulan).
    */
   private array $bmiForAgeBoys = [
      0 => ['L' => -0.3053, 'M' => 13.4069, 'S' => 0.09593],
      1 => ['L' => 0.2441, 'M' => 14.9445, 'S' => 0.08921],
      2 => ['L' => 0.4670, 'M' => 16.3055, 'S' => 0.08553],
      3 => ['L' => 0.5434, 'M' => 16.9031, 'S' => 0.08353],
      4 => ['L' => 0.5635, 'M' => 17.1773, 'S' => 0.08227],
      5 => ['L' => 0.5595, 'M' => 17.2749, 'S' => 0.08136],
      6 => ['L' => 0.5442, 'M' => 17.2875, 'S' => 0.08065],
      7 => ['L' => 0.5228, 'M' => 17.2495, 'S' => 0.08009],
      8 => ['L' => 0.4977, 'M' => 17.1839, 'S' => 0.07964],
      9 => ['L' => 0.4705, 'M' => 17.1034, 'S' => 0.07929],
      10 => ['L' => 0.4420, 'M' => 17.0144, 'S' => 0.07902],
      11 => ['L' => 0.4129, 'M' => 16.9218, 'S' => 0.07882],
      12 => ['L' => 0.3835, 'M' => 16.8290, 'S' => 0.07868],
      18 => ['L' => 0.2267, 'M' => 16.2597, 'S' => 0.07879],
      24 => ['L' => 0.0964, 'M' => 16.0177, 'S' => 0.07993],
      36 => ['L' => -0.1042, 'M' => 15.5341, 'S' => 0.08379],
      48 => ['L' => -0.2565, 'M' => 15.3199, 'S' => 0.08853],
      60 => ['L' => -0.3729, 'M' => 15.2447, 'S' => 0.09384],
   ];

   private array $bmiForAgeGirls = [
      0 => ['L' => -0.0631, 'M' => 13.3363, 'S' => 0.09262],
      1 => ['L' => 0.3464, 'M' => 14.5679, 'S' => 0.09050],
      2 => ['L' => 0.4935, 'M' => 15.7746, 'S' => 0.08757],
      3 => ['L' => 0.5400, 'M' => 16.3588, 'S' => 0.08607],
      4 => ['L' => 0.5511, 'M' => 16.6444, 'S' => 0.08503],
      5 => ['L' => 0.5484, 'M' => 16.7685, 'S' => 0.08412],
      6 => ['L' => 0.5390, 'M' => 16.7924, 'S' => 0.08326],
      7 => ['L' => 0.5255, 'M' => 16.7566, 'S' => 0.08248],
      8 => ['L' => 0.5093, 'M' => 16.6828, 'S' => 0.08181],
      9 => ['L' => 0.4914, 'M' => 16.5859, 'S' => 0.08124],
      10 => ['L' => 0.4721, 'M' => 16.4763, 'S' => 0.08079],
      11 => ['L' => 0.4520, 'M' => 16.3606, 'S' => 0.08043],
      12 => ['L' => 0.4313, 'M' => 16.2429, 'S' => 0.08014],
      18 => ['L' => 0.3041, 'M' => 15.7993, 'S' => 0.07915],
      24 => ['L' => 0.1857, 'M' => 15.7019, 'S' => 0.07962],
      36 => ['L' => -0.0095, 'M' => 15.4283, 'S' => 0.08262],
      48 => ['L' => -0.1635, 'M' => 15.3215, 'S' => 0.08698],
      60 => ['L' => -0.2793, 'M' => 15.3032, 'S' => 0.09197],
   ];

   /**
    * Data LMS WHO untuk Head Circumference-for-Age (0-60 bulan).
    */
   private array $headCircumferenceForAgeBoys = [
      0 => ['L' => 1.0, 'M' => 34.4618, 'S' => 0.03686],
      1 => ['L' => 1.0, 'M' => 37.2759, 'S' => 0.03133],
      2 => ['L' => 1.0, 'M' => 39.1285, 'S' => 0.02997],
      3 => ['L' => 1.0, 'M' => 40.5135, 'S' => 0.02918],
      4 => ['L' => 1.0, 'M' => 41.6317, 'S' => 0.02868],
      5 => ['L' => 1.0, 'M' => 42.5576, 'S' => 0.02837],
      6 => ['L' => 1.0, 'M' => 43.3306, 'S' => 0.02817],
      7 => ['L' => 1.0, 'M' => 43.9803, 'S' => 0.02804],
      8 => ['L' => 1.0, 'M' => 44.5300, 'S' => 0.02796],
      9 => ['L' => 1.0, 'M' => 44.9998, 'S' => 0.02792],
      10 => ['L' => 1.0, 'M' => 45.4051, 'S' => 0.02789],
      11 => ['L' => 1.0, 'M' => 45.7573, 'S' => 0.02788],
      12 => ['L' => 1.0, 'M' => 46.0661, 'S' => 0.02789],
      18 => ['L' => 1.0, 'M' => 47.1044, 'S' => 0.02801],
      24 => ['L' => 1.0, 'M' => 47.8802, 'S' => 0.02816],
      36 => ['L' => 1.0, 'M' => 49.0053, 'S' => 0.02860],
      48 => ['L' => 1.0, 'M' => 49.7843, 'S' => 0.02893],
      60 => ['L' => 1.0, 'M' => 50.3826, 'S' => 0.02917],
   ];

   private array $headCircumferenceForAgeGirls = [
      0 => ['L' => 1.0, 'M' => 33.8787, 'S' => 0.03496],
      1 => ['L' => 1.0, 'M' => 36.5463, 'S' => 0.03094],
      2 => ['L' => 1.0, 'M' => 38.2521, 'S' => 0.02970],
      3 => ['L' => 1.0, 'M' => 39.5328, 'S' => 0.02898],
      4 => ['L' => 1.0, 'M' => 40.5817, 'S' => 0.02852],
      5 => ['L' => 1.0, 'M' => 41.4590, 'S' => 0.02821],
      6 => ['L' => 1.0, 'M' => 42.1995, 'S' => 0.02799],
      7 => ['L' => 1.0, 'M' => 42.8290, 'S' => 0.02784],
      8 => ['L' => 1.0, 'M' => 43.3671, 'S' => 0.02773],
      9 => ['L' => 1.0, 'M' => 43.8299, 'S' => 0.02766],
      10 => ['L' => 1.0, 'M' => 44.2319, 'S' => 0.02761],
      11 => ['L' => 1.0, 'M' => 44.5844, 'S' => 0.02758],
      12 => ['L' => 1.0, 'M' => 44.8965, 'S' => 0.02757],
      18 => ['L' => 1.0, 'M' => 45.9831, 'S' => 0.02762],
      24 => ['L' => 1.0, 'M' => 46.8042, 'S' => 0.02778],
      36 => ['L' => 1.0, 'M' => 47.9869, 'S' => 0.02828],
      48 => ['L' => 1.0, 'M' => 48.7919, 'S' => 0.02867],
      60 => ['L' => 1.0, 'M' => 49.4110, 'S' => 0.02897],
   ];

   /**
    * Menghitung semua Z-Score untuk pengukuran antropometri.
    */
   public function calculateZScores(Child $child, array $data): array
   {
      $measurementDate = Carbon::parse($data['measurement_date']);
      $ageInMonths = $child->birthday->diffInMonths($measurementDate);
      $ageInDays = $child->birthday->diffInDays($measurementDate);
      $gender = $child->gender; // 'male' or 'female'

      $weight = $data['weight'] ?? null;
      $height = $data['height'] ?? null;
      $headCircumference = $data['head_circumference'] ?? null;

      $result = [];

      // Weight-for-Age Z-Score
      if ($weight !== null && $ageInMonths <= 60) {
         $result['weight_for_age_zscore'] = $this->calculateWeightForAgeZScore(
            $weight,
            $ageInMonths,
            $gender
         );
      }

      // Height-for-Age Z-Score
      if ($height !== null && $ageInMonths <= 60) {
         $result['height_for_age_zscore'] = $this->calculateHeightForAgeZScore(
            $height,
            $ageInMonths,
            $gender
         );
      }

      // Weight-for-Height Z-Score
      if ($weight !== null && $height !== null && $height >= 45 && $height <= 120) {
         $result['weight_for_height_zscore'] = $this->calculateWeightForHeightZScore(
            $weight,
            $height,
            $gender
         );
      }

      // BMI-for-Age Z-Score
      if ($weight !== null && $height !== null && $ageInMonths <= 60) {
         $heightInMeters = $height / 100;
         $bmi = $weight / ($heightInMeters * $heightInMeters);
         $result['bmi_for_age_zscore'] = $this->calculateBmiForAgeZScore(
            $bmi,
            $ageInMonths,
            $gender
         );
      }

      // Head Circumference-for-Age Z-Score
      if ($headCircumference !== null && $ageInMonths <= 60) {
         $result['head_circumference_zscore'] = $this->calculateHeadCircumferenceForAgeZScore(
            $headCircumference,
            $ageInMonths,
            $gender
         );
      }

      // Determine nutritional statuses
      $result['nutritional_status'] = $this->determineNutritionalStatus($result['weight_for_age_zscore'] ?? null);
      $result['stunting_status'] = $this->determineStuntingStatus($result['height_for_age_zscore'] ?? null);
      $result['wasting_status'] = $this->determineWastingStatus($result['weight_for_height_zscore'] ?? null);

      return $result;
   }

   /**
    * Menghitung Z-Score Weight-for-Age.
    */
   private function calculateWeightForAgeZScore(float $weight, int $ageMonths, string $gender): ?float
   {
      $lmsData = $gender === 'male' ? $this->weightForAgeBoys : $this->weightForAgeGirls;
      $lms = $this->interpolateLMS($lmsData, $ageMonths);

      if ($lms === null) {
         return null;
      }

      return $this->calculateZScore($weight, $lms['L'], $lms['M'], $lms['S']);
   }

   /**
    * Menghitung Z-Score Height-for-Age.
    */
   private function calculateHeightForAgeZScore(float $height, int $ageMonths, string $gender): ?float
   {
      $lmsData = $gender === 'male' ? $this->heightForAgeBoys : $this->heightForAgeGirls;
      $lms = $this->interpolateLMS($lmsData, $ageMonths);

      if ($lms === null) {
         return null;
      }

      return $this->calculateZScore($height, $lms['L'], $lms['M'], $lms['S']);
   }

   /**
    * Menghitung Z-Score Weight-for-Height.
    */
   private function calculateWeightForHeightZScore(float $weight, float $height, string $gender): ?float
   {
      $lmsData = $gender === 'male' ? $this->weightForHeightBoys : $this->weightForHeightGirls;
      $lms = $this->interpolateLMS($lmsData, $height);

      if ($lms === null) {
         return null;
      }

      return $this->calculateZScore($weight, $lms['L'], $lms['M'], $lms['S']);
   }

   /**
    * Menghitung Z-Score BMI-for-Age.
    */
   private function calculateBmiForAgeZScore(float $bmi, int $ageMonths, string $gender): ?float
   {
      $lmsData = $gender === 'male' ? $this->bmiForAgeBoys : $this->bmiForAgeGirls;
      $lms = $this->interpolateLMS($lmsData, $ageMonths);

      if ($lms === null) {
         return null;
      }

      return $this->calculateZScore($bmi, $lms['L'], $lms['M'], $lms['S']);
   }

   /**
    * Menghitung Z-Score Head Circumference-for-Age.
    */
   private function calculateHeadCircumferenceForAgeZScore(float $headCircumference, int $ageMonths, string $gender): ?float
   {
      $lmsData = $gender === 'male' ? $this->headCircumferenceForAgeBoys : $this->headCircumferenceForAgeGirls;
      $lms = $this->interpolateLMS($lmsData, $ageMonths);

      if ($lms === null) {
         return null;
      }

      return $this->calculateZScore($headCircumference, $lms['L'], $lms['M'], $lms['S']);
   }

   /**
    * Menghitung Z-Score menggunakan metode LMS.
    *
    * Formula:
    * - Jika L ≠ 0: Z = [((Y/M)^L) - 1] / (L * S)
    * - Jika L = 0: Z = ln(Y/M) / S
    */
   private function calculateZScore(float $measurement, float $L, float $M, float $S): float
   {
      if (abs($L) < 0.0001) {
         // L mendekati 0, gunakan logaritma natural
         $zscore = log($measurement / $M) / $S;
      } else {
         $zscore = (pow($measurement / $M, $L) - 1) / ($L * $S);
      }

      // Batasi Z-Score pada range yang wajar (-6 sampai +6)
      return round(max(-6, min(6, $zscore)), 2);
   }

   /**
    * Interpolasi nilai LMS untuk umur/tinggi yang tidak tepat pada tabel.
    */
   private function interpolateLMS(array $lmsData, float $key): ?array
   {
      $keys = array_keys($lmsData);

      // Jika key persis ada di tabel
      if (isset($lmsData[(int)$key])) {
         return $lmsData[(int)$key];
      }

      // Cari dua titik terdekat untuk interpolasi
      $lowerKey = null;
      $upperKey = null;

      foreach ($keys as $k) {
         if ($k <= $key) {
            $lowerKey = $k;
         }
         if ($k >= $key && $upperKey === null) {
            $upperKey = $k;
            break;
         }
      }

      // Jika di luar range
      if ($lowerKey === null || $upperKey === null) {
         // Gunakan nilai terdekat
         if ($lowerKey !== null) {
            return $lmsData[$lowerKey];
         }
         if ($upperKey !== null) {
            return $lmsData[$upperKey];
         }
         return null;
      }

      // Jika sama
      if ($lowerKey === $upperKey) {
         return $lmsData[$lowerKey];
      }

      // Interpolasi linear
      $ratio = ($key - $lowerKey) / ($upperKey - $lowerKey);
      $lowerLMS = $lmsData[$lowerKey];
      $upperLMS = $lmsData[$upperKey];

      return [
         'L' => $lowerLMS['L'] + ($upperLMS['L'] - $lowerLMS['L']) * $ratio,
         'M' => $lowerLMS['M'] + ($upperLMS['M'] - $lowerLMS['M']) * $ratio,
         'S' => $lowerLMS['S'] + ($upperLMS['S'] - $lowerLMS['S']) * $ratio,
      ];
   }

   /**
    * Menentukan status gizi berdasarkan Weight-for-Age Z-Score.
    */
   private function determineNutritionalStatus(?float $zscore): ?string
   {
      if ($zscore === null) {
         return null;
      }

      if ($zscore < -3) {
         return 'severely_underweight';
      } elseif ($zscore < -2) {
         return 'underweight';
      } elseif ($zscore <= 2) {
         return 'normal';
      } else {
         return 'overweight';
      }
   }

   /**
    * Menentukan status stunting berdasarkan Height-for-Age Z-Score.
    */
   private function determineStuntingStatus(?float $zscore): ?string
   {
      if ($zscore === null) {
         return null;
      }

      if ($zscore < -3) {
         return 'severely_stunted';
      } elseif ($zscore < -2) {
         return 'stunted';
      } else {
         return 'normal';
      }
   }

   /**
    * Menentukan status wasting berdasarkan Weight-for-Height Z-Score.
    */
   private function determineWastingStatus(?float $zscore): ?string
   {
      if ($zscore === null) {
         return null;
      }

      if ($zscore < -3) {
         return 'severely_wasted';
      } elseif ($zscore < -2) {
         return 'wasted';
      } elseif ($zscore <= 2) {
         return 'normal';
      } else {
         return 'overweight';
      }
   }
}
