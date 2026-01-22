<?php

namespace App\Models;

use App\Enums\UserType;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'address',
        'avatar_url',
        'push_notifications',
        'weekly_report',
        'user_type',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'push_notifications' => 'boolean',
            'weekly_report' => 'boolean',
            'user_type' => UserType::class,
        ];
    }

    /**
     * Get children for this user.
     */
    public function children(): HasMany
    {
        return $this->hasMany(Child::class);
    }

    /**
     * Get notifications for this user.
     */
    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    /**
     * Get foods created by this user.
     */
    public function createdFoods(): HasMany
    {
        return $this->hasMany(Food::class, 'created_by');
    }

    /**
     * Get the nakes profile for this user.
     */
    public function nakesProfile(): HasOne
    {
        return $this->hasOne(NakesProfile::class);
    }

    /**
     * Check if the user is a nakes (healthcare worker).
     */
    public function isNakes(): bool
    {
        return $this->user_type === UserType::Nakes;
    }

    /**
     * Check if the user is a parent.
     */
    public function isParent(): bool
    {
        return $this->user_type === UserType::Parent;
    }

    /**
     * Check if the user can use web authentication.
     */
    public function canUseWeb(): bool
    {
        return $this->user_type->canUseWeb();
    }

    /**
     * Check if the user can use API authentication.
     */
    public function canUseApi(): bool
    {
        return $this->user_type->canUseApi();
    }

    /**
     * Get the full name attribute (alias for name).
     * Added for backward compatibility with code using $user->full_name.
     */
    public function getFullNameAttribute(): string
    {
        return $this->name;
    }
}
