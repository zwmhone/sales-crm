<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Throwable;

class OpportunityStagesController extends Controller
{
    public function data(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        // ✅ Use schema-qualified (no need to include DB name inside raw)
        $source = '[test_cilos_salesdb].[CrmDB_Opportunity_Pipeline_Progress]';

        try {
            /**
             * ✅ Dynamically load stage GUIDs from lookup table
             * This avoids hardcoded GUIDs that will break after reseeding.
             */
            $stageRows = DB::connection('sqlsrv')
                ->table('test_cilos_salesdb.CrmDB_Lookup_Type')
                ->selectRaw("LOWER(CAST(Lookup_Type AS varchar(36))) AS stage_id, Lookup_Code")
                ->where('Lookup_Type_Value', 'DEAL_STAGE')
                ->whereIn('Lookup_Code', ['BRONZE', 'SILVER', 'GOLD'])
                ->get();

            $stageMapLower = [];
            foreach ($stageRows as $r) {
                $label = ucfirst(strtolower($r->Lookup_Code)); // BRONZE -> Bronze
                $stageMapLower[(string)$r->stage_id] = $label;
            }

            // Query opportunity table
            $query = DB::connection('sqlsrv')
                ->table(DB::raw($source))
                ->selectRaw("
                    CAST(Pipeline_Id AS varchar(36)) AS Pipeline_Id,
                    CAST(Contact_Id  AS varchar(36)) AS Contact_Id,
                    Deal_Name,
                    Deal_Amount,
                    CAST(Deal_Stage AS varchar(36)) AS Deal_Stage_Id,
                    Probality,
                    Create_Date,
                    Close_Date,
                    Deal_Exec,
                    Deal_Score_Summary,
                    Deal_Mgr,
                    Last_Deal_Message_Date,
                    Last_Deal_Message_Contents,
                    Deal_Score
                ");

            if ($search !== '') {
                $like = "%{$search}%";
                $query->where(function ($q) use ($like) {
                    $q->where('Deal_Name', 'like', $like)
                      ->orWhereRaw("CAST(Deal_Exec AS varchar(50)) LIKE ?", [$like])
                      ->orWhereRaw("CAST(Deal_Mgr  AS varchar(50)) LIKE ?", [$like])
                      ->orWhereRaw("CAST(Pipeline_Id AS varchar(36)) LIKE ?", [$like])
                      ->orWhereRaw("CAST(Contact_Id  AS varchar(36)) LIKE ?", [$like])
                      ->orWhereRaw("CAST(Deal_Stage  AS varchar(36)) LIKE ?", [$like]);
                });
            }

            $rows = $query
                ->orderByDesc('Deal_Amount')
                ->limit(2000)
                ->get();

            // Group buckets
            $groups = [
                'Bronze' => [],
                'Silver' => [],
                'Gold'   => [],
                'Other'  => [],
            ];

            foreach ($rows as $r) {
                $stageIdLower = strtolower((string)($r->Deal_Stage_Id ?? ''));
                $stage = $stageMapLower[$stageIdLower] ?? 'Other';

                // ✅ Probality in DB is 0.25 / 0.60 / 0.90
                // Convert to percentage for UI
                $prob = $r->Probality;
                $probPct = null;
                if ($prob !== null && $prob !== '') {
                    $num = (float) $prob;
                    // if stored as 0.25 => 25
                    $probPct = $num <= 1 ? round($num * 100, 0) : round($num, 0);
                }

                $groups[$stage][] = [
                    'pipelineId' => $r->Pipeline_Id,
                    'contactId'  => $r->Contact_Id,
                    'dealName'   => $r->Deal_Name,
                    'amount'     => $r->Deal_Amount,

                    'stage'      => $stage,
                    'stageId'    => $r->Deal_Stage_Id,

                    // ✅ now always percent number like 25,60,90
                    'probability' => $probPct,

                    'createDate' => $r->Create_Date,
                    'closeDate'  => $r->Close_Date,
                    'dealExec'   => $r->Deal_Exec,
                    'dealMgr'    => $r->Deal_Mgr,
                    'scoreSummary' => $r->Deal_Score_Summary,
                    'lastMsgDate'  => $r->Last_Deal_Message_Date,
                    'lastMsgText'  => $r->Last_Deal_Message_Contents,
                    'score'      => $r->Deal_Score,
                ];
            }

            // Return in UI order
            $stages = [];
            foreach (['Bronze', 'Silver', 'Gold', 'Other'] as $k) {
                if ($k === 'Other' && count($groups[$k]) === 0) continue;

                $stages[] = [
                    'key' => strtolower($k),
                    'label' => $k,
                    'count' => count($groups[$k]),
                    'deals' => $groups[$k],
                ];
            }

            return response()->json([
                'search' => $search,
                'stages' => $stages,
            ]);
        } catch (Throwable $e) {
            return response()->json([
                'error' => true,
                'message' => 'SQL query failed.',
                'details' => $e->getMessage(),
            ], 500);
        }
    }
}