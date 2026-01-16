<?php

use App\Http\Controllers\ChildController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FoodController;
use App\Http\Controllers\ParentController;
use App\Http\Controllers\PmtController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportController;
use App\Http\Controllers\ScreeningController;
use App\Http\Controllers\ScreeningInterventionController;
use App\Http\Controllers\SettingsController;
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

// Auth Routes (placeholder - will be implemented by backend team)
Route::get('/login', fn () => Inertia::render('auth/login'))->name('login');

// Dashboard Routes
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

// Parents & Children Management
Route::resource('parents', ParentController::class);
Route::resource('children', ChildController::class);

// Food Data Master CRUD
Route::resource('foods', FoodController::class);

// PMT Programs
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

// Logout placeholder
Route::post('/logout', function () {
    return redirect('/');
})->name('logout');
