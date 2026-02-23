<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CsvImportController;

Route::post('/csv-import', [CsvImportController::class, 'store']);