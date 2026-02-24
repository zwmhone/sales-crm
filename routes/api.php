<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CsvImportController;
use App\Http\Controllers\DashboardController;


use App\Http\Controllers\ContactsController;
use App\Http\Controllers\CompaniesController;


Route::post('/csv-import', [CsvImportController::class, 'store']);

// Dashboard routes
Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
Route::get('/dashboard/exceptions', [DashboardController::class, 'exceptions']);
// Route::post('/follow-up-tasks/{taskId}/action', [DashboardController::class, 'performAction']);

//Contacts Routes
Route::get('/contacts', [ContactsController::class, 'index']);
Route::get('/contacts/{id}', [ContactsController::class, 'show']);
Route::post('/contacts/{id}/action', [ContactsController::class, 'applyAction']);
Route::patch('/contacts/{id}', [ContactsController::class, 'updateContact']);

// Companies Routes
Route::get('/companies', [CompaniesController::class, 'index']);
Route::get('/companies/{id}', [CompaniesController::class, 'show']);
Route::patch('/companies/{id}', [CompaniesController::class, 'updateCompany']);
Route::post('/companies/{id}/action', [CompaniesController::class, 'applyAction']);
Route::get('/companies/{id}/related-contacts', [CompaniesController::class, 'relatedContacts']);
Route::get('/companies/{id}/related-deals', [CompaniesController::class, 'relatedDeals']);
