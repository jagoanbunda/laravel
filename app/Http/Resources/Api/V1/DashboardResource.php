<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DashboardResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'child' => new ChildResource($this->resource['child']),
            'progressRings' => $this->resource['progressRings'],
            'weeklyTrend' => $this->resource['weeklyTrend'],
            'tasks' => $this->resource['tasks'],
            'tips' => $this->resource['tips'],
        ];
    }
}
