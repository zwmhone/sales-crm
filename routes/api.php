<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CsvImportController;
use App\Http\Controllers\DashboardController;

Route::post('/csv-import', [CsvImportController::class, 'store']);



// Dashboard routes
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
Route::get('/dashboard/exceptions', [DashboardController::class, 'exceptions']);
// Route::post('/follow-up-tasks/{taskId}/action', [DashboardController::class, 'performAction']);