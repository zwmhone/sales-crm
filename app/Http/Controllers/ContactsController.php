<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ContactsController extends Controller
{
    public function index(): JsonResponse
    {
        try {
            $rows = DB::select("SELECT TOP 5 * FROM AcmDB.Contact");

            return response()->json([
                'success' => true,
                'rows' => $rows,
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 500);
        }
    }
}