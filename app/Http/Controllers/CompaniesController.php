<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class CompaniesController extends Controller
{
    // ====== LIST ======
    public function index(Request $request)
    {
        $bu = $request->query('bu', 'Retail');

        $view = match (strtolower($bu)) {
            'alliance' => 'vw_alliance_companies',
            'enterprise' => 'vw_enterprise_companies',
            default => 'vw_retail_companies',
        };

        try {
            $rows = DB::connection('sqlsrv')->select("
                SELECT
                    company_id AS id,
                    company_name,
                    company_email,
                    business_unit AS bu,
                    owner,
                    owner_team,
                    industry,
                    location,
                    related_contacts_count,
                    related_opportunities_count
                FROM {$view}
                ORDER BY company_name
            ");

            $rows = $this->mergeListOverrides($rows);

            if (count($rows) === 0) {
                return response()->json([
                    'source' => 'mock',
                    'data' => $this->mockCompanies($bu),
                ]);
            }

            return response()->json(['source' => 'db', 'data' => $rows]);
        } catch (\Throwable $e) {
            return response()->json([
                'source' => 'mock',
                'data' => $this->mockCompanies($bu),
                'note' => 'DB query failed; returning mock fallback.',
            ]);
        }
    }

    // ====== DETAIL ======
    public function show(string $id, Request $request)
    {
        $bu = $request->query('bu', 'Retail');

        // If you eventually have a "company detail view", map it here.
        $detailView = match (strtolower($bu)) {
            'alliance' => 'vw_alliance_company_detail',
            'enterprise' => 'vw_enterprise_company_detail',
            default => 'vw_retail_company_detail',
        };

        try {
            $rows = DB::connection('sqlsrv')->select("
                SELECT TOP 1
                    company_id AS id,
                    company_name,
                    company_email,
                    business_unit AS bu,
                    owner,
                    owner_team,
                    industry,
                    location,
                    mobile,
                    domain,
                    notes,
                    exception_type,
                    sla_status,
                    last_action,
                    last_action_at
                FROM {$detailView}
                WHERE company_id = ?
            ", [$id]);

            if (count($rows) === 0) {
                $data = $this->mockCompanyDetail($id, $bu);
                $data = $this->mergeDetailOverride($id, $data);
                return response()->json(['source' => 'mock', 'data' => $data]);
            }

            $data = (array)$rows[0];
            $data = $this->mergeDetailOverride($id, $data);

            return response()->json(['source' => 'db', 'data' => $data]);
        } catch (\Throwable $e) {
            $data = $this->mockCompanyDetail($id, $bu);
            $data = $this->mergeDetailOverride($id, $data);
            return response()->json([
                'source' => 'mock',
                'data' => $data,
                'note' => 'DB query failed; returning mock fallback.',
            ]);
        }
    }

    // ====== EDIT (OVERRIDES) ======
    public function updateCompany(string $id, Request $request)
    {
        $payload = $request->all();

        // store overrides so UI edits still work without DB write permission
        $key = $this->overrideKey($id);
        $existing = Cache::get($key, []);
        $merged = array_replace_recursive($existing, $payload);

        Cache::put($key, $merged, now()->addDays(7));

        return response()->json([
            'ok' => true,
            'message' => 'Saved override.',
            'override' => $merged,
        ]);
    }

    // ====== SOP ACTION (OVERRIDES) ======
    public function applyAction(string $id, Request $request)
    {
        $action = $request->input('action', 'VERIFY');
        $form = $request->input('form', []);

        $now = now()->toDateTimeString();

        // Minimal "status effect" — same idea as contacts
        $update = [
            'last_action' => $action,
            'last_action_at' => $now,
        ];

        // You can tune these fields to match your real schema later:
        if ($action === 'VERIFY') {
            $update['exception_type'] = 'Verified';
            $update['sla_status'] = 'On Track';
        } elseif ($action === 'LOG_CONFIRMATION') {
            $update['exception_type'] = 'Confirmed';
        } elseif ($action === 'START_RETARGET') {
            $update['exception_type'] = 'Retarget Started';
            $update['sla_status'] = 'Due';
        } elseif ($action === 'SEND_FOLLOWUP') {
            $update['exception_type'] = 'Follow-up Sent';
        }

        // Append to activity history (stored in overrides)
        $historyItem = [
            'type' => 'SOP Log',
            'title' => $action,
            'notes' => $form['notes'] ?? ($form['message_summary'] ?? ''),
            'timestamp' => $now,
            'handled_by' => $request->input('handled_by', 'You'),
        ];

        $key = $this->overrideKey($id);
        $existing = Cache::get($key, []);
        $existingHistory = $existing['activity'] ?? [];

        $merged = array_replace_recursive($existing, $update);
        $merged['activity'] = array_merge([$historyItem], $existingHistory);

        Cache::put($key, $merged, now()->addDays(7));

        return response()->json([
            'ok' => true,
            'message' => 'Action saved.',
            'data' => $merged,
        ]);
    }

    // ====== RELATED CONTACTS ======
    public function relatedContacts(string $id, Request $request)
    {
        $bu = $request->query('bu', 'Retail');

        $view = match (strtolower($bu)) {
            'alliance' => 'vw_alliance_company_related_contacts',
            'enterprise' => 'vw_enterprise_company_related_contacts',
            default => 'vw_retail_company_related_contacts',
        };

        try {
            $rows = DB::connection('sqlsrv')->select("
                SELECT
                    contact_id,
                    name,
                    bu,
                    lead_status,
                    owner,
                    exception_type,
                    sla_status
                FROM {$view}
                WHERE company_id = ?
                ORDER BY name
            ", [$id]);

            if (count($rows) === 0) {
                return response()->json(['source' => 'mock', 'data' => $this->mockRelatedContacts($id, $bu)]);
            }

            return response()->json(['source' => 'db', 'data' => $rows]);
        } catch (\Throwable $e) {
            return response()->json(['source' => 'mock', 'data' => $this->mockRelatedContacts($id, $bu)]);
        }
    }

    // ====== RELATED DEALS ======
    public function relatedDeals(string $id, Request $request)
    {
        $bu = $request->query('bu', 'Retail');

        $view = match (strtolower($bu)) {
            'alliance' => 'vw_alliance_company_related_deals',
            'enterprise' => 'vw_enterprise_company_related_deals',
            default => 'vw_retail_company_related_deals',
        };

        try {
            $rows = DB::connection('sqlsrv')->select("
                SELECT
                    opportunity_id,
                    stage,
                    value,
                    owner,
                    updated_at
                FROM {$view}
                WHERE company_id = ?
                ORDER BY updated_at DESC
            ", [$id]);

            if (count($rows) === 0) {
                return response()->json(['source' => 'mock', 'data' => $this->mockRelatedDeals($id, $bu)]);
            }

            return response()->json(['source' => 'db', 'data' => $rows]);
        } catch (\Throwable $e) {
            return response()->json(['source' => 'mock', 'data' => $this->mockRelatedDeals($id, $bu)]);
        }
    }

    // ====== OVERRIDES ======
    private function overrideKey(string $id): string
    {
        return "company_override:{$id}";
    }

    private function mergeDetailOverride(string $id, array $data): array
    {
        $override = Cache::get($this->overrideKey($id), []);
        if (!$override) return $data;
        return array_replace_recursive($data, $override);
    }

    private function mergeListOverrides(array $rows): array
    {
        // optional: merge list overrides (simple fields)
        return array_map(function ($r) {
            $arr = (array)$r;
            $id = $arr['id'] ?? null;
            if (!$id) return $r;

            $override = Cache::get($this->overrideKey((string)$id), []);
            if (!$override) return $r;

            $merged = array_replace_recursive($arr, $override);
            return $merged;
        }, $rows);
    }

    // ====== MOCKS ======
    private function mockCompanies(string $bu): array
    {
        $bu = ucfirst(strtolower($bu));

        return [
            [
                'id' => 'C0342',
                'company_name' => 'Maxwell. co',
                'company_email' => 'mxc@example.com',
                'bu' => $bu,
                'owner' => 'Hysie Osit',
                'owner_team' => 'DBD - Team A',
                'industry' => 'Education',
                'location' => 'New York',
                'related_contacts_count' => 2,
                'related_opportunities_count' => 2,
            ],
        ];
    }

    private function mockCompanyDetail(string $id, string $bu): array
    {
        $bu = ucfirst(strtolower($bu));

        return [
            'id' => $id,
            'company_name' => 'Maxwell. co',
            'company_email' => 'mxc@example.com',
            'bu' => $bu,
            'owner' => 'Hysie Osit',
            'owner_team' => 'DBD - Team A',
            'industry' => 'Education',
            'location' => 'New York',
            'mobile' => '+65 654332143',
            'domain' => 'maxwells.edu.com',
            'notes' => 'Add notes here…',
            'exception_type' => 'Not Verified',
            'sla_status' => 'Due in 12h',
            'last_action' => null,
            'last_action_at' => null,
            'activity' => [
                [
                    'type' => 'Company linked',
                    'title' => 'Associated contact with Maxwell.co',
                    'timestamp' => now()->subHours(2)->toDateTimeString(),
                    'handled_by' => 'DBD - Team A',
                ],
                [
                    'type' => 'Lead created',
                    'title' => 'Record created. Verification timer started (12h).',
                    'timestamp' => now()->subHours(4)->toDateTimeString(),
                    'handled_by' => 'DBD - Team A',
                ],
            ],
        ];
    }

    private function mockRelatedContacts(string $companyId, string $bu): array
    {
        $bu = ucfirst(strtolower($bu));

        return [
            [
                'contact_id' => 1245,
                'name' => 'John Smith',
                'bu' => $bu,
                'lead_status' => 'Meeting Scheduled',
                'owner' => 'DBD - Team A',
                'exception_type' => 'Not Verified',
                'sla_status' => 'Due in 12h',
            ],
            [
                'contact_id' => 1248,
                'name' => 'Jennifer Lee',
                'bu' => $bu,
                'lead_status' => 'Meeting Scheduled',
                'owner' => 'Sales Rep - Mike',
                'exception_type' => 'Not Confirmed',
                'sla_status' => 'Due in 24h',
            ],
        ];
    }

    private function mockRelatedDeals(string $companyId, string $bu): array
    {
        return [
            [
                'opportunity_id' => 'BR-2001',
                'stage' => 'Bronze',
                'value' => 'SGD 18,000',
                'owner' => 'DBD - Team A',
                'updated_at' => '2026-02-01',
            ],
            [
                'opportunity_id' => 'BR-2112',
                'stage' => 'Silver',
                'value' => 'SGD 18,000',
                'owner' => 'Sales Rep - Mike',
                'updated_at' => '2026-02-03',
            ],
        ];
    }
}