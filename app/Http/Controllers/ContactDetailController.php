<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class ContactDetailController extends Controller
{
    public function show($id): JsonResponse
    {
        $contact = DB::table('Contacts')
            ->where('Contact_ID', $id)
            ->first();

        if (!$contact) {
            return response()->json([
                'ok' => false,
                'message' => 'Contact not found',
            ], 404);
        }

        return response()->json([
            'ok' => true,
            'data' => $contact,
        ]);
    }
}