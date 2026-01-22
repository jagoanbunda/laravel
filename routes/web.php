<?php

use App\Http\Controllers\ChildController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FoodController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\PmtController;
use App\Http\Controllers\PmtProgramController;
use App\Http\Controllers\PmtReportsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ScreeningController;
use App\Http\Controllers\ScreeningInterventionController;
use App\Http\Controllers\SettingsController;
use App\Http\Controllers\Web\AuthController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

// Public Landing Pages
Route::get('/', fn () => Inertia::render('landing/index'))->name('home');
Route::get('/about', fn () => Inertia::render('landing/about'))->name('about');
Route::get('/contact', fn () => Inertia::render('landing/contact'))->name('contact');
Route::get('/download', fn () => Inertia::render('landing/download'))->name('download');

// Landing Page Color Variants for A/B Testing
Route::get('/variant-a', fn () => Inertia::render('landing/variant-a'))->name('variant-a');
Route::get('/variant-b', fn () => Inertia::render('landing/variant-b'))->name('variant-b');

// Guest Routes (not logged in)
Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login']);
    // Note: Nakes registration is admin-only (via seeder/phpMyAdmin)
    // Parents register via mobile app (API only)
});

// Protected Routes (Nakes only)
Route::middleware(['auth', 'ensure.nakes'])->group(function () {
    // Logout
    Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

    // Dashboard Routes
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Parents & Children Management
    Route::resource('parents', ParentController::class);
    Route::resource('children', ChildController::class);

    // Food Data Master CRUD
    Route::resource('foods', FoodController::class);

    // PMT Programs (enrollment)
    Route::resource('pmt/programs', PmtProgramController::class)->names([
        'index' => 'pmt.programs.index',
        'create' => 'pmt.programs.create',
        'store' => 'pmt.programs.store',
        'show' => 'pmt.programs.show',
        'edit' => 'pmt.programs.edit',
        'update' => 'pmt.programs.update',
        'destroy' => 'pmt.programs.destroy',
    ]);
    Route::post('/pmt/programs/{program}/discontinue', [PmtProgramController::class, 'discontinue'])
        ->name('pmt.programs.discontinue');

    // PMT Reports (monitoring parent submissions)
    Route::get('/pmt/reports', [PmtReportsController::class, 'index'])->name('pmt.reports.index');
    Route::get('/pmt/reports/export', [PmtReportsController::class, 'export'])->name('pmt.reports.export');

    // PMT Schedules
    Route::resource('pmt', PmtController::class);
    Route::post('/pmt/{id}/log', [PmtController::class, 'logDistribution'])->name('pmt.log');

    // ASQ-3 Screenings
    Route::resource('screenings', ScreeningController::class)->except(['show', 'destroy']);
    Route::get('/screenings/{id}/results', [ScreeningController::class, 'show'])->name('screenings.results');
    Route::delete('/screenings/{id}', [ScreeningController::class, 'destroy'])->name('screenings.destroy');

    // Screening Interventions
    Route::get('/screenings/{screening}/interventions', [ScreeningInterventionController::class, 'index'])->name('screenings.interventions.index');
    Route::get('/screenings/{screening}/interventions/create', [ScreeningInterventionController::class, 'create'])->name('screenings.interventions.create');
    Route::post('/screenings/{screening}/interventions', [ScreeningInterventionController::class, 'store'])->name('screenings.interventions.store');
    Route::get('/screenings/{screening}/interventions/{intervention}/edit', [ScreeningInterventionController::class, 'edit'])->name('screenings.interventions.edit');
    Route::put('/screenings/{screening}/interventions/{intervention}', [ScreeningInterventionController::class, 'update'])->name('screenings.interventions.update');
    Route::delete('/screenings/{screening}/interventions/{intervention}', [ScreeningInterventionController::class, 'destroy'])->name('screenings.interventions.destroy');
    Route::post('/screenings/{screening}/interventions/{intervention}/complete', [ScreeningInterventionController::class, 'complete'])->name('screenings.interventions.complete');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');

    // Settings
    Route::get('/settings', [SettingsController::class, 'index'])->name('settings.index');
    Route::post('/settings', [SettingsController::class, 'update'])->name('settings.update');

    // Profile
    Route::get('/profile', [ProfileController::class, 'index'])->name('profile.index');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
});
