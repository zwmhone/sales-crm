<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ContactsController extends Controller
{
    private function overrideKey(string $id): string
    {
        return "contact_overrides:$id";
    }

    private function getOverride(string $id): array
    {
        return Cache::store('file')->get($this->overrideKey($id), []);
    }

    private function putOverride(string $id, array $patch): array
    {
        $current = $this->getOverride($id);
        $merged = array_replace_recursive($current, $patch);
        Cache::store('file')->put($this->overrideKey($id), $merged, now()->addDays(7));
        return $merged;
    }

    private function mergeOverrideRow(array $row): array
    {
        $id = (string)($row['contact_id'] ?? '');
        if ($id === '') return $row;

        $ov = $this->getOverride($id);
        if (!$ov) return $row;

        return array_replace_recursive($row, $ov);
    }

    public function index(Request $request)
    {
        $bu = strtoupper($request->query('bu', 'RETAIL'));

        $view = match ($bu) {
            'ALLIANCE' => 'test_cilos_lead.vw_Leads_Qualification_Alliance',
            'ENT', 'ENTERPRISE' => 'test_cilos_lead.vw_Leads_Qualification_Enterprise',
            default => 'test_cilos_lead.vw_Leads_Qualification_Retail',
        };

        $rows = DB::table($view)
            ->select([
                DB::raw('ContactID as contact_id'),
                DB::raw('BU as bu'),
                DB::raw('Name as name'),
                DB::raw('Email as email'),
                DB::raw('Documents as documents'),
                DB::raw('CilosStage as lead_status'),
                DB::raw('CilosStatus as exception_type'),
            ])
            ->orderByDesc('ContactID')
            ->get();

        $data = $rows->map(function ($r) {
            $row = (array)$r;

            // Defaults used by UI (until your DB provides these)
            $row['owner'] = $row['owner'] ?? '—';
            $row['sla_status'] = $row['sla_status'] ?? $this->inferSla($row['exception_type'] ?? '');

            return $this->mergeOverrideRow($row);
        })->values();

        if ($data->count() === 0) {
            $mock = collect($this->mockRows($bu))->map(fn($r) => $this->mergeOverrideRow($r))->values();
            return response()->json(['source' => 'mock', 'bu' => $bu, 'data' => $mock]);
        }

        return response()->json(['source' => 'db', 'bu' => $bu, 'data' => $data]);
    }

    public function show(string $id)
    {
        $view = 'test_cilos_lead.vw_Leads_Qualification_Retail';

        $row = DB::table($view)
            ->select([
                DB::raw('ContactID as contact_id'),
                DB::raw('BU as bu'),
                DB::raw('Name as name'),
                DB::raw('Email as email'),
                DB::raw('Documents as documents'),
                DB::raw('CilosStage as lead_status'),
                DB::raw('CilosStatus as exception_type'),
            ])
            ->where('ContactID', $id)
            ->first();

        if (!$row) {
            $detail = $this->mergeOverrideRow($this->mockDetail($id));
            return response()->json(['source' => 'mock', 'data' => $detail]);
        }

        $base = (array)$row;
        $detail = [
            'contact_id' => $base['contact_id'],
            'name' => $base['name'] ?? '—',
            'email' => $base['email'] ?? '—',
            'bu' => $base['bu'] ?? '—',
            'owner' => $base['owner'] ?? '—',
            'documents' => $base['documents'] ?? '—',
            'lead_status' => $base['lead_status'] ?? ($base['CilosStage'] ?? '—'),
            'exception_type' => $base['exception_type'] ?? ($base['CilosStatus'] ?? '—'),
            'sla_status' => $base['sla_status'] ?? $this->inferSla($base['exception_type'] ?? ''),
        ];

        $detail = array_replace_recursive($detail, $this->getOverride($id));
        return response()->json(['source' => 'db', 'data' => $detail]);
    }

    public function updateContact(Request $request, string $id)
    {
        $payload = $request->validate([
            'contact.first_name' => ['nullable', 'string', 'max:100'],
            'contact.last_name' => ['nullable', 'string', 'max:100'],
            'contact.mobile' => ['nullable', 'string', 'max:50'],
            'contact.whatsapp' => ['nullable', 'string', 'max:50'],
            'contact.preferred_channel' => ['nullable', 'string', 'max:50'],
            'contact.student_nrc' => ['nullable', 'string', 'max:100'],
            'lead_qualification.inquiry_type' => ['nullable', 'string', 'max:100'],
            'lead_qualification.solution_course_interest' => ['nullable', 'string', 'max:150'],
            'lead_qualification.current_company' => ['nullable', 'string', 'max:150'],
            'lead_qualification.current_job_role' => ['nullable', 'string', 'max:150'],
            'lead_qualification.target_career_goals' => ['nullable', 'string', 'max:250'],
            'lead_qualification.qualification_score' => ['nullable', 'string', 'max:50'],
            'lead_qualification.notes' => ['nullable', 'string', 'max:2000'],
            'documents.cv_status' => ['nullable', 'string', 'max:50'],
            'documents.last_cv_upload_date' => ['nullable', 'string', 'max:50'],
            'documents.document_notes' => ['nullable', 'string', 'max:2000'],
            'documents.cala_form' => ['nullable', 'string', 'max:50'],
            'documents.cala_form_notes' => ['nullable', 'string', 'max:2000'],
            'documents.cv_url' => ['nullable', 'string', 'max:2000'],
'documents.cala_url' => ['nullable', 'string', 'max:2000'],
        ]);

        $ov = $this->putOverride($id, $payload);

        return response()->json([
            'ok' => true,
            'override' => $ov,
        ]);
    }

    public function applyAction(Request $request, string $id)
    {
        $payload = $request->validate([
            'action' => ['required', 'string', 'in:VERIFY,LOG_CONFIRMATION,START_RETARGET,SEND_FOLLOWUP'],
            'form' => ['nullable', 'array'],
        ]);

        $action = $payload['action'];

        // Update list-facing fields
        $patch = [
            'last_action' => match ($action) {
                'VERIFY' => 'Verify Now',
                'LOG_CONFIRMATION' => 'Log Confirmation',
                'START_RETARGET' => 'Start Retarget',
                'SEND_FOLLOWUP' => 'Send Follow-up',
                default => '—',
            },
            'last_action_at' => now()->format('Y-m-d H:i'),
        ];

        // Update exception/sla based on action + form
        if ($action === 'VERIFY') {
            $result = $payload['form']['verification_result'] ?? 'Verified';
            $doc = $payload['form']['document_status'] ?? 'CV Received';

            $patch['exception_type'] = $result === 'Verified' ? 'Verified (12h)' : 'Not Verified (12h)';
            $patch['documents'] = $doc;
            $patch['sla_status'] = $result === 'Verified' ? 'On Track' : 'Breached';
        }

        if ($action === 'LOG_CONFIRMATION') {
            $outcome = $payload['form']['outcome'] ?? 'Confirmed';
            $patch['exception_type'] = $outcome === 'Confirmed' ? 'Confirmed (24h)' : 'Not Confirmed (24h)';
            $patch['sla_status'] = $outcome === 'Confirmed' ? 'On Track' : 'Due Soon';
        }

        if ($action === 'START_RETARGET') {
            $result = $payload['form']['result'] ?? 'Attempted - No Reply';
            $patch['exception_type'] = 'Retarget Started (48h)';
            $patch['sla_status'] = $result === 'Attempted - No Reply' ? 'Breached' : 'Due Soon';
        }

        if ($action === 'SEND_FOLLOWUP') {
            $patch['exception_type'] = 'Follow-up Sent (2h)';
            $patch['sla_status'] = 'On Track';
        }

        $ov = $this->putOverride($id, $patch);

        return response()->json([
            'ok' => true,
            'override' => $ov,
        ]);
    }

    private function inferSla(string $exceptionType): string
    {
        $t = strtolower($exceptionType);
        if (str_contains($t, 'not verified') || str_contains($t, 'no-show')) return 'Breached';
        if (str_contains($t, 'not confirmed')) return 'Due Soon';
        if (str_contains($t, 'overdue')) return 'Breached';
        return 'On Track';
    }

    private function mockRows(string $bu): array
    {
        return [
            [
                'contact_id' => 1245,
                'bu' => $bu,
                'name' => 'John Smith',
                'email' => 'john@example.com',
                'documents' => 'Missing CaLA',
                'lead_status' => 'New',
                'exception_type' => 'Not Verified (12h)',
                'owner' => 'DBD - Team A',
                'sla_status' => 'Breached',
            ],
            [
                'contact_id' => 1248,
                'bu' => $bu,
                'name' => 'Jennifer Lee',
                'email' => 'jennifer@example.com',
                'documents' => 'All Collected',
                'lead_status' => 'Meeting Scheduled',
                'exception_type' => 'Not Confirmed (24h)',
                'owner' => 'Sales Rep - Mike',
                'sla_status' => 'Due Soon',
            ],
            [
                'contact_id' => 895,
                'bu' => $bu,
                'name' => 'Emma Brown',
                'email' => 'emma@example.com',
                'documents' => 'Missing CV',
                'lead_status' => 'Meeting Scheduled',
                'exception_type' => 'No-show Not Retargeted (48h)',
                'owner' => 'Sales Rep - Sara',
                'sla_status' => 'Breached',
            ],
            [
                'contact_id' => 1272,
                'bu' => $bu,
                'name' => 'Olivia Jones',
                'email' => 'olivia@example.com',
                'documents' => 'All Collected',
                'lead_status' => 'Meeting Scheduled',
                'exception_type' => 'Follow-up Overdue (2h)',
                'owner' => 'Sales Rep - Daniel',
                'sla_status' => 'Breached',
            ],
        ];
    }

    private function mockDetail(string $id): array
    {
        return [
            'contact_id' => (int)$id,
            'name' => 'John Smith',
            'email' => 'john@example.com',
            'bu' => 'Retail',
            'owner' => 'DBD - Team A',
            'last_action' => 'Verify Now',
            'last_action_at' => '2026-02-24 10:05',
            'contact' => [
                'first_name' => 'John',
                'last_name' => 'Smith',
                'mobile' => '+13 78421232',
                'whatsapp' => '+13 78421232',
                'preferred_channel' => 'WhatsApp',
                'student_nrc' => 'Singapore / SEA',
            ],
            'lead_qualification' => [
                'inquiry_type' => 'Course Information',
                'solution_course_interest' => 'Data Analytics (Foundations)',
                'current_company' => 'St. Louis Uni',
                'current_job_role' => 'Operations Executive',
                'target_career_goals' => 'Analyst role within 6–12 months',
                'qualification_score' => 'Medium',
                'notes' => 'Add Notes here…',
            ],
            'documents' => [
                'cv_status' => 'Uploaded',
                'last_cv_upload_date' => '12.2.2024',
                'document_notes' => 'Add Notes here…',
                'cala_form' => 'Received',
            ],
        ];
    }
}