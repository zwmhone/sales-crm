<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\ContactDetailController;

Route::get('/dashboard', [DashboardController::class, 'index']);
Route::post('/dashboard/log-meeting', [DashboardController::class, 'logMeeting']);
Route::post('/dashboard/create-follow-up', [DashboardController::class, 'createFollowUpTask']);
Route::post('/dashboard/send-reminder', [DashboardController::class, 'sendReminder']);
Route::post('/dashboard/send-proposal', [DashboardController::class, 'sendProposal']);
Route::post('/dashboard/issue-invoice', [DashboardController::class, 'issueInvoice']);
Route::post('/dashboard/create-opportunity', [DashboardController::class, 'createOpportunity']);
Route::post('/dashboard/mark-closed-won', [DashboardController::class, 'markClosedWon']);
Route::post('/dashboard/raise-exception', [DashboardController::class, 'raiseException']);


Route::get('/contacts', [ContactController::class, 'index']);
Route::get('/contacts/{id}', [ContactDetailController::class, 'show']);