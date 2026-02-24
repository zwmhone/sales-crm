<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats()
    {
        $now = Carbon::now();
        $tomorrow = $now->copy()->addDay();

        // Active Leads: contact_engagement_status where cilos_stage = 'Lead' and contact_status = 'Active'
        $activeLeads = DB::table('test_cilos_salesdb.contact_engagement_status')
            ->where('cilos_stage', 'Lead')
            ->where('contact_status', 'Active')
            ->count();

        // Scheduled Meetings: meetings where meeting_status = 'Scheduled' and meeting_date > now
        $scheduledMeetings = DB::table('test_cilos_salesdb.meetings')
            ->where('meeting_status', 'Scheduled')
            ->where('meeting_date', '>', $now)
            ->count();

        // No-Shows: meetings where meeting_status = 'No Show'
        $noShows = DB::table('test_cilos_salesdb.meetings')
            ->where('meeting_status', 'No Show')
            ->count();

        // Deals in Pipeline: deal_profile where deal_stage not in ('Closed Won', 'Closed Lost')
        $dealsInPipeline = DB::table('test_cilos_salesdb.deal_profile')
            ->whereNotIn('deal_stage', ['Closed Won', 'Closed Lost'])
            ->count();

        // Closed Won: deal_profile where deal_stage = 'Closed Won'
        $closedWon = DB::table('test_cilos_salesdb.deal_profile')
            ->where('deal_stage', 'Closed Won')
            ->count();

        return response()->json([
            'active_leads' => $activeLeads,
            'meetings_scheduled' => $scheduledMeetings,
            'no_shows' => $noShows,
            'deals_in_pipeline' => $dealsInPipeline,
            'closed_won' => $closedWon,
        ]);
    }

    public function exceptions()
    {
        $now = Carbon::now();
        $tomorrow = $now->copy()->addDay();

        // Get follow_up_tasks that are either:
        // 1. Past due date and still Open/In Progress (Breached)
        // 2. Due within next 24 hours (Due Soon)
        $exceptions = DB::table('test_cilos_salesdb.follow_up_tasks as t')
            ->join('test_cilos_salesdb.deal_profile as dp', 't.deal_id', '=', 'dp.deal_id')
            ->join('test_cilos_salesdb.contact_profile as cp', 'dp.contact_id', '=', 'cp.contact_id')
            ->leftJoin('test_cilos_salesdb.company_profile as comp', 'dp.company_id', '=', 'comp.company_id')
            ->join('test_cilos_kerneldb.bu_ref as bu', 't.bu_id', '=', 'bu.bu_id')
            ->join('test_cilos_kerneldb.employee_ref as assigned', 't.assigned_to', '=', 'assigned.employee_id')
            ->leftJoin('test_cilos_kerneldb.employee_ref as creator', 't.created_by', '=', 'creator.employee_id')
            ->select(
                't.task_id as id',
                't.task_type',
                't.task_title',
                't.task_description',
                't.task_status as status',
                't.priority',
                't.due_date',
                't.source_type',
                't.source_id',
                't.created_date',
                't.completed_date',
                
                // Contact information
                'cp.contact_id',
                'cp.contact_first_name',
                'cp.contact_last_name',
                'cp.contact_email',
                
                // Deal information
                'dp.deal_id',
                'dp.deal_name',
                'dp.deal_stage',
                'dp.deal_amount',
                
                // Company information
                'comp.company_id',
                'comp.company_name',
                
                // BU information
                'bu.bu_id',
                'bu.bu_code',
                'bu.bu_desc',
                
                // Assigned employee information
                'assigned.employee_id as assigned_employee_id',
                'assigned.employee_name as assigned_employee_name',
                'assigned.employee_role as assigned_employee_role',
                'assigned.owner_id as assigned_owner_id',
                
                // Created by employee information
                'creator.employee_name as created_by_name'
            )
            ->where(function($query) use ($now, $tomorrow) {
                // Breached: due_date is past and task is Open or In Progress
                $query->where(function($q) use ($now) {
                    $q->where('t.due_date', '<', $now)
                      ->whereIn('t.task_status', ['Open', 'In Progress']);
                })
                // Due Soon: due_date between now and next 24 hours
                ->orWhere(function($q) use ($now, $tomorrow) {
                    $q->whereBetween('t.due_date', [$now, $tomorrow])
                      ->whereIn('t.task_status', ['Open', 'In Progress']);
                });
            })
            ->orderBy('t.due_date', 'asc')
            ->get();

        // Transform the data to match the frontend expected structure
        $transformed = $exceptions->map(function($item) {
            return [
                'id' => $item->id,
                'task_type' => $item->task_type,
                'task_title' => $item->task_title,
                'task_description' => $item->task_description,
                'status' => $item->status,
                'priority' => $item->priority,
                'due_date' => $item->due_date,
                'source_type' => $item->source_type,
                'source_id' => $item->source_id,
                'created_date' => $item->created_date,
                'completed_date' => $item->completed_date,
                
                // Nested contact profile (matches frontend expected structure)
                'contact_profile' => [
                    'id' => $item->contact_id,
                    'first_name' => $item->contact_first_name,
                    'last_name' => $item->contact_last_name,
                    'email' => $item->contact_email,
                ],
                
                // Nested deal profile
                'deal_profile' => [
                    'id' => $item->deal_id,
                    'name' => $item->deal_name,
                    'stage' => $item->deal_stage,
                    'amount' => $item->deal_amount,
                ],
                
                // Nested company profile
                'company_profile' => $item->company_id ? [
                    'id' => $item->company_id,
                    'name' => $item->company_name,
                ] : null,
                
                // Nested BU reference
                'bu_ref' => [
                    'id' => $item->bu_id,
                    'code' => $item->bu_code,
                    'description' => $item->bu_desc,
                ],
                
                // Nested employee reference (assigned)
                'employee_ref' => [
                    'id' => $item->assigned_employee_id,
                    'name' => $item->assigned_employee_name,
                    'role' => $item->assigned_employee_role,
                    'owner_id' => $item->assigned_owner_id,
                ],
                
                // Created by info
                'created_by_name' => $item->created_by_name,
            ];
        });

        return response()->json($transformed);
    }

    public function performAction($taskId, Request $request)
    {
        $validated = $request->validate([
            'action' => 'required|string',
            'task_type' => 'required|string',
        ]);

        $now = Carbon::now();
        
        // Update the task status based on the action
        $updated = DB::table('test_cilos_salesdb.follow_up_tasks')
            ->where('task_id', $taskId)
            ->update([
                'task_status' => 'Completed',
                'completed_date' => $now,
                'updated_at' => $now,
            ]);

        if ($updated) {
            // You might want to create a follow-up task or log the action
            // based on the action type
            
            return response()->json([
                'success' => true,
                'message' => 'Action completed successfully',
                'task_id' => $taskId,
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Task not found',
        ], 404);
    }
}