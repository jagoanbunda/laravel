<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NutritionTrendResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'daily' => $this->resource['daily'],
            'weekly' => $this->resource['weekly'],
            'monthly' => $this->resource['monthly'],
        ];
    }
}
