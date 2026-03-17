<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OpportunitiesController extends Controller
{
    // LIST PAGE
    public function index()
    {
        $deals = DB::table('test_cilos_salesdb.deal_profile')
            ->select(
                'deal_id as id',
                'deal_name as name',
                'deal_stage as stage',
                'deal_amount as value',
                'stage_entry_date as updated'
            )
            ->get();

        return response()->json([
            "data" => $deals,
            "source" => "database"
        ]);
    }

    // DETAIL PAGE
    public function show($id)
    {
        $opportunity = DB::table('test_cilos_salesdb.deal_profile as d')
            ->leftJoin(
                'test_cilos_salesdb.contact_profile as c',
                'd.contact_id',
                '=',
                'c.contact_id'
            )
            ->select(
                'd.deal_id',
                'd.deal_name',
                'd.deal_amount',
                'd.deal_stage',
                'd.stage_entry_date',
                'c.contact_id',
                'c.contact_first_name',
                'c.contact_last_name'
            )
            ->where('d.deal_id', $id)
            ->first();

        if (!$opportunity) {
            return response()->json([
                "message" => "Opportunity not found"
            ], 404);
        }

        $contacts = DB::table('test_cilos_salesdb.contact_profile')
            ->where('contact_id', $opportunity->contact_id)
            ->get();

        $documents = DB::table('test_cilos_salesdb.contracts')
            ->where('deal_id', $id)
            ->get();

        $activities = DB::table('test_cilos_salesdb.contact_activities_status')
            ->where('contact_id', $opportunity->contact_id)
            ->get();

        return response()->json([
            "data" => [
                "opportunity" => $opportunity,
                "contacts" => $contacts,
                "documents" => $documents,
                "activities" => $activities
            ],
            "source" => "database"
        ]);
    }
}