<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
   public function index(): JsonResponse
{
    $homeSnapshot = DB::table('AnalyticsDB.AnalyticsDB_Sales_Fulfilment')
        ->where('Dashboard_View', 'Home')
        ->where('Is_Current', 1)
        ->orderByDesc('Snapshot_Date')
        ->first();

    $contactsSnapshot = DB::table('AnalyticsDB.AnalyticsDB_Sales_Fulfilment')
        ->where('Dashboard_View', 'Contacts')
        ->where('Is_Current', 1)
        ->orderByDesc('Snapshot_Date')
        ->first();

    $companiesSnapshot = DB::table('AnalyticsDB.AnalyticsDB_Sales_Fulfilment')
        ->where('Dashboard_View', 'Companies')
        ->where('Is_Current', 1)
        ->orderByDesc('Snapshot_Date')
        ->first();

    $oppsSnapshot = DB::table('AnalyticsDB.AnalyticsDB_Sales_Fulfilment')
        ->where('Dashboard_View', 'Opportunities')
        ->where('Is_Current', 1)
        ->orderByDesc('Snapshot_Date')
        ->first();

    $liveTotalLeadPax = DB::table('AcmDB.Contact_Engagement')
        ->where('CILOS_Life_Cycle', 'like', 'Lead%')
        ->count();

    $opportunityAnalyticsAgg = DB::table('AnalyticsDB.AnalyticsDB_Deal as d')
        ->where('d.Is_Current', 1)
        ->selectRaw('
            AVG(CAST(ISNULL(d.Days_In_Bronze, 0) AS decimal(10,2))) as days_in_bronze,
            AVG(CAST(ISNULL(d.Days_In_Silver, 0) AS decimal(10,2))) as days_in_silver,
            AVG(CAST(ISNULL(d.Days_In_Gold, 0) AS decimal(10,2))) as days_in_gold,
            SUM(ISNULL(d.Total_Deal_Value, 0)) as total_amount
        ')
        ->first();

    $dashboard = [
        'topStats' => [
            'interest_pax' => (int) ($homeSnapshot->Interest_Pax ?? 0),
            'leads_pax' => (int) $liveTotalLeadPax,
            'oppnty_pax' => (int) ($homeSnapshot->Oppnty_Pax ?? 0),
            'sales_pax' => (int) ($homeSnapshot->Sales_Pax ?? 0),
            'forecast_pax' => (int) ($homeSnapshot->Forecast_Pax ?? 0),
        ],
        'leadAnalytics' => [
            'days_in_contact' => (float) ($contactsSnapshot->Days_In_Contact_Stage ?? 0),
            'days_in_interest' => (float) ($contactsSnapshot->Days_In_Interest_Stage ?? 0),
            'days_in_leads' => (float) ($contactsSnapshot->Days_In_Leads_Stage ?? 0),
            'total_leads' => (int) $liveTotalLeadPax,
        ],
        'opportunityAnalytics' => [
            'days_in_bronze' => round((float) ($opportunityAnalyticsAgg->days_in_bronze ?? 0), 1),
            'days_in_silver' => round((float) ($opportunityAnalyticsAgg->days_in_silver ?? 0), 1),
            'days_in_gold' => round((float) ($opportunityAnalyticsAgg->days_in_gold ?? 0), 1),
            'total_amount' => (float) ($opportunityAnalyticsAgg->total_amount ?? 0),
        ],
        'companyAnalytics' => [
            'total_deals' => (int) DB::table('AnalyticsDB.AnalyticsDB_Deal')->where('Is_Current', 1)->count(),
            'total_revenue' => (float) ($companiesSnapshot->Total_Revenue ?? 0),
            'active_learners' => (int) ($companiesSnapshot->Active_Learners ?? 0),
            'last_sync' => !empty($companiesSnapshot?->Last_Sync_Date)
                ? Carbon::parse($companiesSnapshot->Last_Sync_Date)->format('H:i')
                : '-',
        ],
        'todaySopQueue' => $this->getTodaySopQueue(),
        'pipelineStageMonitor' => $this->getPipelineStageMonitor($oppsSnapshot),
        'upcomingMeetingsAndFollowups' => $this->getUpcomingMeetingsAndFollowups(),
        'operationalExceptions' => $this->getOperationalExceptions(),
        'railCards' => $this->getRailCards($oppsSnapshot),
    ];

    return response()->json($dashboard);
}

    private function getTodaySopQueue(): array
    {
        $cards = [];

        $meetingQueue = DB::table('SalesDB.SalesDB_Meeting_Schedule as ms')
            ->selectRaw("
                'meeting_queue' as queue_key,
                MIN(COALESCE(ms.Meeting_Title, 'Meeting Reminder Queue')) as title,
                COUNT(*) as total_count,
                MIN(COALESCE(ms.Assigned_To_Name, ms.Scheduled_By_Name, 'Unassigned')) as owner_name,
                MIN(COALESCE(ms.Meeting_Type, 'Meeting')) as primary_type,
                MIN(COALESCE(ms.Business_Unit_Name, 'Unknown BU')) as source_name,
                MAX(CASE WHEN ms.Confirmation_Call_Status IN ('Pending', 'Confirmation Due') THEN 1 ELSE 0 END) as has_confirmation_due,
                MAX(CASE WHEN ms.Reminder_48hrs_Status IN ('Pending', 'Sent') THEN 1 ELSE 0 END) as has_48h_due,
                MAX(CASE WHEN ms.Reminder_2hrs_Status IN ('Pending', 'Sent', 'Done', 'Missed') THEN 1 ELSE 0 END) as has_2h_due
            ")
            ->where(function ($q) {
                $q->whereIn('ms.Confirmation_Call_Status', ['Pending', 'Confirmation Due'])
                  ->orWhereIn('ms.Reminder_48hrs_Status', ['Pending', 'Sent'])
                  ->orWhereIn('ms.Reminder_2hrs_Status', ['Pending', 'Sent', 'Done', 'Missed']);
            })
            ->first();

        if ($meetingQueue && (int) $meetingQueue->total_count > 0) {
            $cards[] = [
                'title' => 'Meeting Reminder Queue',
                'pill' => [
                    'text' => ((int) $meetingQueue->total_count) . ' items',
                    'className' => 'pending',
                ],
                'meta' => [
                    ['Primary Type', $meetingQueue->primary_type ?? '-'],
                    ['Assigned To', $meetingQueue->owner_name ?? '-'],
                    ['Source', $meetingQueue->source_name ?? '-'],
                    ['Reminder Mix', $this->buildReminderMixLabel($meetingQueue)],
                ],
            ];
        }

        $proposalQueue = DB::table('SalesDB.SalesDB_Follow_Up_Tasks as t')
            ->selectRaw("
                MIN(COALESCE(t.Task_Title, 'Proposal Follow-up')) as title,
                COUNT(*) as total_count,
                MIN(COALESCE(t.Assigned_To_Name, t.Owner_Name, 'Unassigned')) as owner_name,
                MIN(COALESCE(t.Source_Module, 'Unknown Source')) as source_name,
                COUNT(CASE WHEN t.Escalation_Level IS NOT NULL THEN 1 END) as escalation_count
            ")
            ->where('t.Task_Type', 'Proposal Follow-up')
            ->whereIn('t.Task_Status', ['Pending', 'Active'])
            ->first();

        if ($proposalQueue && (int) $proposalQueue->total_count > 0) {
            $cards[] = [
                'title' => 'Proposal Follow-ups',
                'pill' => [
                    'text' => ((int) $proposalQueue->total_count) . ' active',
                    'className' => 'info',
                ],
                'meta' => [
                    ['Task Type', 'Proposal Follow-up'],
                    ['Assigned To', $proposalQueue->owner_name ?? '-'],
                    ['Source', $proposalQueue->source_name ?? '-'],
                    ['Escalation Count', (string) ((int) $proposalQueue->escalation_count)],
                ],
            ];
        }

        $documentQueue = DB::table('SalesDB.SalesDB_Document_Tracking as d')
            ->selectRaw("
                MIN(COALESCE(d.Document_Title, 'Document Verification')) as title,
                COUNT(*) as total_count,
                MIN(COALESCE(d.Created_By_Name, d.Uploaded_By_Name, 'Unassigned')) as owner_name,
                MIN(COALESCE(d.Document_Type, 'Document')) as doc_type,
                MIN(COALESCE(d.Business_Unit_Name, 'Unknown BU')) as source_name
            ")
            ->whereIn('d.Document_Status', ['Pending', 'Under Review', 'Submitted', 'Missing'])
            ->first();

        if ($documentQueue && (int) $documentQueue->total_count > 0) {
            $cards[] = [
                'title' => 'Document Verification',
                'pill' => [
                    'text' => ((int) $documentQueue->total_count) . ' pending',
                    'className' => 'pending',
                ],
                'meta' => [
                    ['Document Type', $documentQueue->doc_type ?? '-'],
                    ['Owner', $documentQueue->owner_name ?? '-'],
                    ['Source', $documentQueue->source_name ?? '-'],
                    ['Status Scope', 'Pending / Review / Submitted / Missing'],
                ],
            ];
        }

        $paymentQueue = DB::table('SalesDB.SalesDB_Payment_Tracking as p')
            ->selectRaw("
                MIN(COALESCE(p.Invoice_Number, 'Invoice Verification')) as title,
                COUNT(*) as total_count,
                MIN(COALESCE(p.Payment_Verified_By_Name, p.Created_By_Name, 'Unassigned')) as owner_name,
                MIN(COALESCE(p.Payment_Status, 'Unknown')) as payment_status,
                MIN(COALESCE(p.Business_Unit_Name, 'Unknown BU')) as source_name
            ")
            ->where('p.Is_Blocking', 1)
            ->first();

        if ($paymentQueue && (int) $paymentQueue->total_count > 0) {
            $cards[] = [
                'title' => 'Invoice Verification Queue',
                'pill' => [
                    'text' => ((int) $paymentQueue->total_count) . ' blocked',
                    'className' => 'alert',
                ],
                'meta' => [
                    ['Payment Status', $paymentQueue->payment_status ?? '-'],
                    ['Owner', $paymentQueue->owner_name ?? '-'],
                    ['Source', $paymentQueue->source_name ?? '-'],
                    ['Queue Type', 'Blocking Payment Items'],
                ],
            ];
        }

        return $cards;
    }

    private function buildReminderMixLabel(object $meetingQueue): string
    {
        $parts = [];

        if ((int) ($meetingQueue->has_confirmation_due ?? 0) === 1) {
            $parts[] = 'Confirmation';
        }
        if ((int) ($meetingQueue->has_48h_due ?? 0) === 1) {
            $parts[] = '48h';
        }
        if ((int) ($meetingQueue->has_2h_due ?? 0) === 1) {
            $parts[] = '2h';
        }

        return empty($parts) ? '-' : implode(' / ', $parts);
    }

    private function getPipelineStageMonitor($oppsSnapshot): array
    {
        $stages = DB::table('AnalyticsDB.AnalyticsDB_Deal as d')
            ->where('d.Is_Current', 1)
            ->whereIn('d.Current_Stage', ['Bronze', 'Silver', 'Gold'])
            ->select(
                'd.Current_Stage',
                DB::raw('COUNT(*) as deal_count'),
                DB::raw('AVG(CAST(ISNULL(d.Deal_Health_Score, 0) AS decimal(10,2))) as avg_health'),
                DB::raw('AVG(CAST(ISNULL(d.Days_In_Bronze, 0) AS decimal(10,2))) as avg_days_in_bronze'),
                DB::raw('AVG(CAST(ISNULL(d.Days_In_Silver, 0) AS decimal(10,2))) as avg_days_in_silver'),
                DB::raw('AVG(CAST(ISNULL(d.Days_In_Gold, 0) AS decimal(10,2))) as avg_days_in_gold'),
                DB::raw('SUM(CAST(ISNULL(d.Total_Deal_Value, 0) AS decimal(18,2))) as total_value')
            )
            ->groupBy('d.Current_Stage')
            ->get()
            ->keyBy('Current_Stage');

        $stageMeta = [
            'Bronze' => ['pillClass' => 'info'],
            'Silver' => ['pillClass' => 'pending'],
            'Gold' => ['pillClass' => 'ok'],
        ];

        $result = [];

        foreach (['Bronze', 'Silver', 'Gold'] as $stage) {
            $row = $stages->get($stage);

            $avgDays = 0;
            if ($stage === 'Bronze') {
                $avgDays = (float) ($row->avg_days_in_bronze ?? 0);
            } elseif ($stage === 'Silver') {
                $avgDays = (float) ($row->avg_days_in_silver ?? 0);
            } elseif ($stage === 'Gold') {
                $avgDays = (float) ($row->avg_days_in_gold ?? 0);
            }

            $result[] = [
                'stage' => $stage,
                'deal_count' => (int) (
                    $stage === 'Bronze' ? ($oppsSnapshot->Bronze_Count ?? ($row->deal_count ?? 0))
                    : ($stage === 'Silver' ? ($oppsSnapshot->Silver_Count ?? ($row->deal_count ?? 0))
                    : ($oppsSnapshot->Gold_Count ?? ($row->deal_count ?? 0)))
                ),
                'avg_health' => round((float) ($row->avg_health ?? 0), 0),
                'description' => 'Avg days in stage: ' . round($avgDays, 1) . ' · Total value: ' . number_format((float) ($row->total_value ?? 0), 0),
                'pillClass' => $stageMeta[$stage]['pillClass'],
            ];
        }

        return $result;
    }

    private function getUpcomingMeetingsAndFollowups(): array
    {
        $meetings = DB::table('SalesDB.SalesDB_Meeting_Schedule as ms')
            ->leftJoin('AcmDB.Contact as c', 'c.Contact_ID', '=', 'ms.Contact_ID')
            ->leftJoin('AcmDB.Opportunity_Pipeline_Progress as opp', 'opp.Pipeline_ID', '=', 'ms.Deal_ID')
            ->selectRaw("
                ms.Meeting_Schedule_ID as id,
                'meeting' as item_type,
                ms.Current_Meeting_Date as event_date,
                COALESCE(ms.Meeting_Title, 'Meeting') as title,
                CONCAT(ISNULL(c.First_Name, ''), CASE WHEN c.Last_Name IS NOT NULL THEN ' ' + c.Last_Name ELSE '' END) as subject_name,
                COALESCE(ms.Meeting_Outcome_Summary, ms.Meeting_Objective, ms.Meeting_Status, '-') as subtitle,
                COALESCE(ms.Meeting_Type, 'Meeting') as detail_type,
                COALESCE(ms.Meeting_Status, '-') as status,
                COALESCE(opp.Deal_Name, CAST(ms.Deal_ID as varchar(100)), '-') as deal_name,
                COALESCE(ms.Assigned_To_Name, ms.Scheduled_By_Name, '-') as owner_name
            ")
            ->whereNotNull('ms.Current_Meeting_Date')
            ->orderBy('ms.Current_Meeting_Date')
            ->limit(2)
            ->get();

        $tasks = DB::table('SalesDB.SalesDB_Follow_Up_Tasks as t')
            ->leftJoin('AcmDB.Opportunity_Pipeline_Progress as opp', 'opp.Pipeline_ID', '=', 't.Deal_ID')
            ->selectRaw("
                t.Task_ID as id,
                'task' as item_type,
                t.Due_Date as event_date,
                COALESCE(t.Task_Title, t.Task_Type, 'Task') as title,
                COALESCE(opp.Deal_Name, t.Task_Title, 'Task') as subject_name,
                COALESCE(t.Task_Description, t.Next_Action, '-') as subtitle,
                COALESCE(t.Task_Type, 'Task') as detail_type,
                COALESCE(t.Task_Status, '-') as status,
                COALESCE(opp.Deal_Name, CAST(t.Deal_ID as varchar(100)), '-') as deal_name,
                COALESCE(t.Assigned_To_Name, t.Owner_Name, '-') as owner_name
            ")
            ->whereNotNull('t.Due_Date')
            ->orderBy('t.Due_Date')
            ->limit(1)
            ->get();

        $payments = DB::table('SalesDB.SalesDB_Payment_Tracking as p')
            ->leftJoin('AcmDB.Opportunity_Pipeline_Progress as opp', 'opp.Pipeline_ID', '=', 'p.Deal_ID')
            ->selectRaw("
                p.Payment_Tracking_ID as id,
                'payment' as item_type,
                CAST(p.Invoice_Due_Date as datetime) as event_date,
                COALESCE(p.Invoice_Number, 'Invoice') as title,
                COALESCE(opp.Deal_Name, p.Invoice_Number, 'Invoice') as subject_name,
                COALESCE(p.Blocking_Reason, p.Payment_Status, '-') as subtitle,
                COALESCE(p.Payment_Type, 'Payment') as detail_type,
                COALESCE(p.Finance_Confirmation_Status, p.Payment_Status, '-') as status,
                COALESCE(opp.Deal_Name, CAST(p.Deal_ID as varchar(100)), '-') as deal_name,
                COALESCE(p.Payment_Verified_By_Name, p.Created_By_Name, '-') as owner_name
            ")
            ->whereNotNull('p.Invoice_Due_Date')
            ->orderBy('p.Invoice_Due_Date')
            ->limit(1)
            ->get();

        $onboarding = DB::table('SalesDB.SalesDB_Onboarding_Tracking as o')
            ->leftJoin('AcmDB.Opportunity_Pipeline_Progress as opp', 'opp.Pipeline_ID', '=', 'o.Deal_ID')
            ->selectRaw("
                o.Onboarding_Tracking_ID as id,
                'onboarding' as item_type,
                o.Next_Action_Date as event_date,
                COALESCE(o.Onboarding_Title, 'Onboarding') as title,
                COALESCE(opp.Deal_Name, o.Onboarding_Title, 'Onboarding') as subject_name,
                COALESCE(o.Next_Action, o.Onboarding_Status, '-') as subtitle,
                COALESCE(o.Onboarding_Status, 'Onboarding') as detail_type,
                COALESCE(o.SOC_Status, o.Onboarding_Status, '-') as status,
                COALESCE(opp.Deal_Name, CAST(o.Deal_ID as varchar(100)), '-') as deal_name,
                COALESCE(o.Assigned_Sales_Admin_Name, o.Owner_Name, '-') as owner_name
            ")
            ->whereNotNull('o.Next_Action_Date')
            ->orderBy('o.Next_Action_Date')
            ->limit(1)
            ->get();

        return collect()
            ->merge($meetings)
            ->merge($tasks)
            ->merge($payments)
            ->merge($onboarding)
            ->sortBy('event_date')
            ->take(4)
            ->values()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'item_type' => $item->item_type,
                    'title' => $item->title,
                    'subject_name' => $item->subject_name,
                    'subtitle' => $item->subtitle,
                    'event_date' => $item->event_date
                        ? Carbon::parse($item->event_date)->format('Y-m-d H:i')
                        : '-',
                    'detail_type' => $item->detail_type,
                    'status' => $item->status,
                    'deal_name' => $item->deal_name,
                    'owner_name' => $item->owner_name,
                ];
            })
            ->all();
    }

    private function getOperationalExceptions(): array
    {
        $docExceptions = DB::table('SalesDB.SalesDB_Document_Tracking as d')
            ->leftJoin('AcmDB.Contact as c', 'c.Contact_ID', '=', 'd.Contact_ID')
            ->selectRaw("
                d.Document_Tracking_ID as id,
                COALESCE(d.Exception_Title, d.Document_Title, 'Document Exception') as title,
                COALESCE(d.Exception_Status, d.Document_Status, '-') as status,
                COALESCE(d.Exception_Severity, 'Medium') as severity,
                COALESCE(d.Blocking_Reason, d.Review_Comments, '-') as description,
                COALESCE(d.Created_By_Name, d.Uploaded_By_Name, '-') as owner_name,
                COALESCE(CONVERT(varchar(10), d.Required_By_Date, 23), '-') as sla
            ")
            ->whereNotNull('d.Exception_Title')
            ->whereIn('d.Exception_Status', ['Open', 'Blocked', 'Monitoring'])
            ->limit(1)
            ->get();

        $paymentExceptions = DB::table('SalesDB.SalesDB_Payment_Tracking as p')
            ->selectRaw("
                p.Payment_Tracking_ID as id,
                COALESCE(p.Exception_Title, p.Invoice_Number, 'Payment Exception') as title,
                COALESCE(p.Exception_Status, p.Payment_Status, '-') as status,
                COALESCE(p.Exception_Severity, 'Medium') as severity,
                COALESCE(p.Blocking_Reason, '-') as description,
                COALESCE(p.Payment_Verified_By_Name, p.Created_By_Name, '-') as owner_name,
                COALESCE(CONVERT(varchar(10), p.Invoice_Due_Date, 23), '-') as sla
            ")
            ->whereNotNull('p.Exception_Title')
            ->whereIn('p.Exception_Status', ['Open', 'Blocked', 'Monitoring'])
            ->limit(2)
            ->get();

        return collect()
            ->merge($docExceptions)
            ->merge($paymentExceptions)
            ->take(2)
            ->values()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'title' => $item->title,
                    'status' => $item->status,
                    'severity' => $item->severity,
                    'description' => $item->description,
                    'owner_name' => $item->owner_name,
                    'sla' => $item->sla,
                ];
            })
            ->all();
    }

    private function getRailCards($oppsSnapshot): array
    {
        $meetingSummary = DB::table('SalesDB.SalesDB_Meeting_Schedule as ms')
            ->selectRaw("
                SUM(CASE WHEN ms.Confirmation_Call_Status IN ('Pending', 'Confirmation Due') THEN 1 ELSE 0 END) as confirmation_calls,
                SUM(CASE WHEN ms.Reminder_48hrs_Status IN ('Pending', 'Sent') THEN 1 ELSE 0 END) as reminder_48h,
                SUM(CASE WHEN ms.Reminder_2hrs_Status IN ('Pending', 'Sent', 'Done', 'Missed') THEN 1 ELSE 0 END) as reminder_2h,
                SUM(CASE WHEN ISNULL(ms.No_Show_Flag, 0) = 1 THEN 1 ELSE 0 END) as no_show
            ")
            ->first();

        $leadToOpp = [
            'ready_for_proposal' => DB::table('SalesDB.SalesDB_Meeting_Schedule')
                ->where('Meeting_Outcome', 'Interested')
                ->count(),
            'bronze_created' => (int) ($oppsSnapshot->Bronze_Count ?? 0),
            'follow_up_needed' => DB::table('SalesDB.SalesDB_Follow_Up_Tasks')
                ->where('Task_Type', 'Proposal Follow-up')
                ->whereIn('Task_Status', ['Pending', 'Active'])
                ->count(),
            'close_lost_risk' => DB::table('SalesDB.SalesDB_Follow_Up_Tasks')
                ->where('Is_Blocking', 1)
                ->count(),
        ];

        $paymentSummary = DB::table('SalesDB.SalesDB_Payment_Tracking as p')
            ->selectRaw("
                SUM(CASE WHEN p.Invoice_Status IN ('Sent', 'Issued', 'Pending', 'Paid') THEN 1 ELSE 0 END) as invoices_sent,
                SUM(CASE WHEN p.Payment_Proof_URL IS NOT NULL THEN 1 ELSE 0 END) as proof_submitted,
                SUM(CASE WHEN p.Finance_Confirmation = 1 THEN 1 ELSE 0 END) as verified,
                SUM(CASE WHEN ISNULL(p.Outstanding_Amount, 0) > 0 THEN 1 ELSE 0 END) as outstanding
            ")
            ->first();

        $onboardingSummary = DB::table('SalesDB.SalesDB_Onboarding_Tracking as o')
            ->selectRaw("
                SUM(ISNULL(o.Total_Learners_Expected, 0)) as learners_expected,
                SUM(ISNULL(o.Total_Learners_Data_Collected, 0)) as collected,
                SUM(ISNULL(o.CV_Missing_Count, 0)) as cv_missing,
                SUM(CASE WHEN o.SOC_Status = 'Scheduled' THEN 1 ELSE 0 END) as soc_scheduled
            ")
            ->first();

        return [
            [
                'id' => 1,
                'stage' => 'lead',
                'title' => 'Meeting Reminder Queue',
                'subtitle' => 'Reminder totals from meeting schedule records',
                'pill' => [
                    'text' => ((int) ($meetingSummary->confirmation_calls ?? 0) + (int) ($meetingSummary->reminder_48h ?? 0)) . ' pending',
                    'className' => 'pending',
                ],
                'meta' => [
                    ['Confirmation Calls', (string) ((int) ($meetingSummary->confirmation_calls ?? 0))],
                    ['48h Reminders', (string) ((int) ($meetingSummary->reminder_48h ?? 0))],
                    ['2h Reminders', (string) ((int) ($meetingSummary->reminder_2h ?? 0))],
                    ['No-Show Flags', (string) ((int) ($meetingSummary->no_show ?? 0))],
                ],
            ],
            [
                'id' => 2,
                'stage' => 'lead',
                'title' => 'Lead to Opportunity Conversion',
                'subtitle' => 'Meeting outcomes and proposal follow-up progression',
                'pill' => [
                    'text' => (int) ($leadToOpp['bronze_created'] ?? 0) . ' today',
                    'className' => 'info',
                ],
                'meta' => [
                    ['Ready for Proposal', (string) ((int) ($leadToOpp['ready_for_proposal'] ?? 0))],
                    ['Bronze Created', (string) ((int) ($leadToOpp['bronze_created'] ?? 0))],
                    ['Follow-Up Needed', (string) ((int) ($leadToOpp['follow_up_needed'] ?? 0))],
                    ['Close Lost Risk', (string) ((int) ($leadToOpp['close_lost_risk'] ?? 0))],
                ],
            ],
            [
                'id' => 3,
                'stage' => 'opp',
                'title' => 'Stage Progression Monitor',
                'subtitle' => 'Snapshot counts from opportunities dashboard view',
                'pill' => ['text' => 'Live', 'className' => 'purple'],
                'meta' => [
                    ['Bronze', (string) ((int) ($oppsSnapshot->Bronze_Count ?? 0))],
                    ['Silver', (string) ((int) ($oppsSnapshot->Silver_Count ?? 0))],
                    ['Gold', (string) ((int) ($oppsSnapshot->Gold_Count ?? 0))],
                    ['Forecast Value', number_format((float) ($oppsSnapshot->Forecast_Value ?? 0), 0)],
                ],
            ],
            [
                'id' => 4,
                'stage' => 'finance',
                'title' => 'Invoice & Payment Status',
                'subtitle' => 'Summary from payment tracking records',
                'pill' => [
                    'text' => DB::table('SalesDB.SalesDB_Payment_Tracking')->where('Is_Blocking', 1)->count() . ' blocked',
                    'className' => 'alert',
                ],
                'meta' => [
                    ['Invoices Sent', (string) ((int) ($paymentSummary->invoices_sent ?? 0))],
                    ['Proof Submitted', (string) ((int) ($paymentSummary->proof_submitted ?? 0))],
                    ['Verified', (string) ((int) ($paymentSummary->verified ?? 0))],
                    ['Outstanding', (string) ((int) ($paymentSummary->outstanding ?? 0))],
                ],
            ],
            [
                'id' => 5,
                'stage' => 'onboarding',
                'title' => 'Learner Data Collection',
                'subtitle' => 'Summary from onboarding tracking records',
                'pill' => [
                    'text' => DB::table('SalesDB.SalesDB_Onboarding_Tracking')
                        ->whereIn('Onboarding_Status', ['Scheduled', 'Pending Data Collection', 'In Progress'])
                        ->count() . ' active',
                    'className' => 'pending',
                ],
                'meta' => [
                    ['Learners Expected', (string) ((int) ($onboardingSummary->learners_expected ?? 0))],
                    ['Collected', (string) ((int) ($onboardingSummary->collected ?? 0))],
                    ['CV Missing', (string) ((int) ($onboardingSummary->cv_missing ?? 0))],
                    ['SOC Scheduled', (string) ((int) ($onboardingSummary->soc_scheduled ?? 0))],
                ],
            ],
        ];
    }
}