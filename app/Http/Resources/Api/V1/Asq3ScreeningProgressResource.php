<?php

namespace App\Http\Resources\Api\V1;

use App\Models\Asq3Domain;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class Asq3ScreeningProgressResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $answers = $this->resource->answers()->with('question')->get();
        $domains = Asq3Domain::orderBy('display_order')->get();
        $totalQuestions = 30;
        $questionsPerDomain = 6;

        $answeredByDomain = $answers->groupBy(fn($answer) => $answer->question->domain_id);

        $domainProgress = $domains->map(function ($domain) use ($answeredByDomain, $questionsPerDomain) {
            $domainAnswers = $answeredByDomain->get($domain->id, collect());
            $answeredCount = $domainAnswers->count();

            return [
                'domain_code' => $domain->code,
                'domain_name' => $domain->name,
                'answered_questions' => $answeredCount,
                'total_questions' => $questionsPerDomain,
                'progress_percent' => (int) round(($answeredCount / $questionsPerDomain) * 100),
            ];
        });

        $answeredQuestions = $answers->count();
        $progressPercent = (int) round(($answeredQuestions / $totalQuestions) * 100);

        return [
            'screening_id' => $this->resource->id,
            'status' => $this->resource->status,
            'total_questions' => $totalQuestions,
            'answered_questions' => $answeredQuestions,
            'progress_percent' => $progressPercent,
            'last_saved_at' => $this->resource->updated_at?->toIso8601String(),
            'domains' => $domainProgress,
            'answered_question_ids' => $answers->pluck('question_id')->values()->all(),
            'answers' => $answers->map(fn($answer) => [
                'question_id' => $answer->question_id,
                'answer' => $answer->answer,
                'score' => $answer->score,
                'created_at' => $answer->created_at?->toIso8601String(),
            ]),
        ];
    }
}
