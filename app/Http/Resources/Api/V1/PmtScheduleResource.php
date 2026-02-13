<?php

namespace App\Http\Resources\Api\V1;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PmtScheduleResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'child_id' => $this->child_id,
            'scheduled_date' => $this->scheduled_date->format('Y-m-d'),
            'is_logged' => $this->is_logged,
            'menu' => $this->whenLoaded('menu', function () {
                return [
                    'id' => $this->menu->id,
                    'name' => $this->menu->name,
                    'image_url' => $this->menu->image_url,
                    'calories' => $this->menu->calories ? (float) $this->menu->calories : null,
                    'protein' => $this->menu->protein ? (float) $this->menu->protein : null,
                ];
            }),
            'log' => $this->whenLoaded('log', function () {
                if (! $this->log) {
                    return null;
                }

                return [
                    'id' => $this->log->id,
                    'portion' => $this->log->portion,
                    'portion_percentage' => $this->log->portion_percentage,
                    'portion_label' => $this->log->portion_label,
                    'photo_url' => $this->log->photo_url,
                    'food' => $this->log->relationLoaded('food') && $this->log->food ? [
                        'id' => $this->log->food->id,
                        'name' => $this->log->food->name,
                        'category' => $this->log->food->category,
                        'icon' => $this->log->food->icon,
                        'serving_size' => $this->log->food->serving_size ? (float) $this->log->food->serving_size : null,
                        'calories' => $this->log->food->calories ? (float) $this->log->food->calories : null,
                        'protein' => $this->log->food->protein ? (float) $this->log->food->protein : null,
                    ] : null,
                    'notes' => $this->log->notes,
                    'logged_at' => $this->log->created_at?->toIso8601String(),
                ];
            }),
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
