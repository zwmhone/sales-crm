<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CsvImportController extends Controller
{
    private string $contactTable = 'test_cilos_salesdb.contact_profile';
    private string $companyTable = 'test_cilos_salesdb.company_profile';

    // FK reference table for business units
    private string $buTable = 'test_cilos_kerneldb.bu_ref';

    /**
     * SQL Server parameter limit (hard limit)
     */
    private int $sqlServerMaxParams = 2100;

    /**
     * ===== CHECK constraints (from your DB) =====
     */

    // company_profile.company_source
    private array $allowedCompanySource = ['etc', 'Purchased', 'Marketing', 'Sales', 'Linkedin'];
    private string $defaultCompanySource = 'etc';

    // company_profile.company_classification
    private array $allowedCompanyClassification = [
        'Training-Institute',
        'HigherED',
        'Technology',
        'Multinationals',
        'Corporate (> 1000)',
        'Enterprise (200-1000)',
        'SME (50-200)',
        'mSME (< 50)',
    ];
    private string $defaultCompanyClassification = 'Technology';

    // contact_profile.contact_persona
    private array $allowedContactPersona = [
        'Advanced Tech',
        'Advanced Non-Tech Career',
        'Mid Tech Career',
        'Mid Non-Tech Career',
        'Early Tech Career',
        'Early Non-Tech Career',
        'Fresh Graduates',
        'Average Students',
        'Good Students',
    ];
    private string $defaultContactPersona = 'Average Students';

    // contact_profile.company_classification
    private array $allowedContactCompanyClassification = ['Technology', 'MNC', 'Corporate', 'SME'];
    private string $defaultContactCompanyClassification = 'Technology';

    /**
     * contact_profile.contact_source
     * TODO: Replace with actual allowed values from your DB CHECK constraint
     */
    private array $allowedContactSource = [
        'Etc',
        'Purchased',
        'Marketing',
        'Sales',
        'Linkedin',
        'Apollo',
    ];
    private string $defaultContactSource = 'etc';

    /**
     * ===== Columns lists =====
     */
    private array $contactColumns = [
        'hubspot_id',
        'contact_first_name',
        'contact_last_name',
        'contact_email',
        'contact_mobile',
        'linkedin_id',
        'facebook_id',
        'passport_full_name',
        'nric_id',
        'passport_id',
        'date_of_birth',
        'race',
        'nationality',
        'parent_name',
        'parent_email_id',
        'parent_passport_id',
        'highest_qualification',
        'business_unit_id',
        'academic_aptitude',
        'career_segment',
        'work_experience',
        'company_id',
        'company_classification', // contact_profile.company_classification
        'current_job_role',
        'job_classification',
        'career_level',
        'contact_cv',
        'general_ksa_profile',
        'digital_skills_profile',
        'management_skills_profile',
        'stem_skills',
        'coding_skills',
        'ai_skills',
        'digital_marketing_skills',
        'application_skills',
        'project_magt_skills',
        'business_leader_skills',
        'customer_magt_skills',
        'contact_persona',
        'contact_source',
        'sales_affiliate',
        'created_by',
        'created_at',
        'updated_by',
        'updated_at',
    ];

    private array $companyColumns = [
        'company_source',
        'company_email',
        'hubspot_id',
        'company_name',
        'company_website',
        'company_phone',
        'company_address',
        'linkedin_webpage',
        'facebook_webpage',
        'business_unit_id',
        'company_persona',
        'company_classification',
        'company_profile',
        'industry_sector',
        'created_by',
        'created_at',
        'updated_by',
        'updated_at',
    ];

    /**
     * API endpoint: POST /api/csv-import
     */
    public function store(Request $request)
    {
        // Because React sends `Accept: application/json`,
        // Laravel will automatically return JSON for validation errors.
        $request->validate([
            'file' => ['required', 'file', 'mimes:csv,txt', 'max:20480'], // 20MB
        ]);

        $path = $request->file('file')->getRealPath();

        $handle = fopen($path, 'r');
        if (!$handle) {
            return response()->json([
                'ok' => false,
                'message' => 'Unable to read the uploaded CSV file.',
            ], 400);
        }

        $rawHeader = fgetcsv($handle);
        if (!$rawHeader) {
            fclose($handle);
            return response()->json([
                'ok' => false,
                'message' => 'CSV is empty or header row missing.',
            ], 400);
        }

        $header = array_map(fn ($h) => $this->normalizeHeader((string)$h), $rawHeader);

        $rows = [];
        while (($data = fgetcsv($handle)) !== false) {
            if (count($data) === 1 && trim((string)$data[0]) === '') {
                continue;
            }

            $row = [];
            foreach ($header as $i => $col) {
                $row[$col] = $data[$i] ?? null;
            }
            $rows[] = $row;
        }
        fclose($handle);

        if (count($rows) === 0) {
            return response()->json([
                'ok' => false,
                'message' => 'No data rows found in CSV.',
            ], 400);
        }

        $hasEmail = in_array('contact_email', $header, true);
        $hasHubspot = in_array('hubspot_id', $header, true);

        if (!$hasEmail && !$hasHubspot) {
            return response()->json([
                'ok' => false,
                'message' => 'CSV must contain at least contact_email or hubspot_id to match existing contacts.',
            ], 422);
        }

        $hasCompanyName = in_array('company_name', $header, true) || in_array('current_company', $header, true);

        $stats = [
            'companies_created' => 0,
            'companies_updated' => 0,
            'contacts_created' => 0,
            'contacts_updated' => 0,
            'rows_total' => count($rows),
            'rows_skipped_no_key' => 0,
            'insert_chunks_used' => 0,
        ];

        $meta = [
            'company_name_column_used' =>
                in_array('company_name', $header, true) ? 'company_name' :
                (in_array('current_company', $header, true) ? 'current_company' : null),

            'contact_match_key' => $hasEmail ? 'contact_email' : 'hubspot_id',

            'company_source_allowed' => $this->allowedCompanySource,
            'company_classification_allowed' => $this->allowedCompanyClassification,

            'contact_persona_allowed' => $this->allowedContactPersona,
            'contact_company_classification_allowed' => $this->allowedContactCompanyClassification,

            'contact_source_allowed' => $this->allowedContactSource,
        ];

        DB::transaction(function () use ($rows, $hasCompanyName, &$stats) {
            $now = now();

            // valid BU set for FK safety
            $validBuIds = DB::table($this->buTable)
                ->pluck('bu_id')
                ->map(fn ($x) => (int)$x)
                ->all();
            $validBuSet = array_flip($validBuIds);

            // 1) company names from csv
            $companyNames = collect($rows)
                ->map(fn ($r) => $this->cleanCompanyName($r['company_name'] ?? ($r['current_company'] ?? null)))
                ->filter()
                ->unique()
                ->values();

            // 2) company map: name -> company_id
            $companyMap = [];

            if ($companyNames->count() > 0) {
                $existing = DB::table($this->companyTable)
                    ->select('company_id', 'company_name')
                    ->whereIn('company_name', $companyNames->all())
                    ->get();

                foreach ($existing as $c) {
                    $companyMap[$this->cleanCompanyName($c->company_name)] = $c->company_id;
                }

                // insert missing companies
                $missing = $companyNames->filter(fn ($n) => !isset($companyMap[$n]))->values();

                if ($missing->count() > 0) {
                    $insertCompanies = $missing->map(function ($name) use ($now, $validBuSet) {
                        $payload = [
                            'company_name' => $name,
                            'company_source' => $this->defaultCompanySource,
                            'company_classification' => $this->defaultCompanyClassification,
                            'business_unit_id' => null,
                            'created_at' => $now,
                            'updated_at' => $now,
                        ];

                        // enforce defaults are valid
                        $payload = $this->enforceCompanyConstraints($payload, $validBuSet);

                        return $payload;
                    })->all();

                    $colCount = count(array_keys($insertCompanies[0]));
                    $this->chunkedInsert($this->companyTable, $insertCompanies, $colCount, $stats);

                    $stats['companies_created'] += $missing->count();

                    $newOnes = DB::table($this->companyTable)
                        ->select('company_id', 'company_name')
                        ->whereIn('company_name', $missing->all())
                        ->get();

                    foreach ($newOnes as $c) {
                        $companyMap[$this->cleanCompanyName($c->company_name)] = $c->company_id;
                    }
                }
            }

            // 3) optional company updates (if csv contains company fields)
            $csvHasCompanyData = collect($this->companyColumns)
                ->reject(fn ($c) => in_array($c, ['created_at', 'updated_at'], true))
                ->some(fn ($c) => $this->csvHasColumn($rows, $c));

            if ($csvHasCompanyData && $companyNames->count() > 0) {
                $companies = DB::table($this->companyTable)
                    ->select('company_id', 'company_name')
                    ->whereIn('company_name', $companyNames->all())
                    ->get();

                $nameToId = [];
                foreach ($companies as $c) {
                    $nameToId[$this->cleanCompanyName($c->company_name)] = $c->company_id;
                }

                $companyUpdatesByName = [];
                foreach ($rows as $r) {
                    $name = $this->cleanCompanyName($r['company_name'] ?? ($r['current_company'] ?? null));
                    if (!$name) continue;
                    if (!isset($nameToId[$name])) continue;

                    $payload = $this->extractCompanyPayloadFromRow($r, $now);
                    $payload = $this->enforceCompanyConstraints($payload, $validBuSet);
                    $payload['company_name'] = $name;

                    $companyUpdatesByName[$name] = array_merge($companyUpdatesByName[$name] ?? [], $payload);
                }

                foreach ($companyUpdatesByName as $name => $payload) {
                    DB::table($this->companyTable)
                        ->where('company_id', $nameToId[$name])
                        ->update($payload);
                    $stats['companies_updated']++;
                }
            }

            // 4) preload contacts by email
            $emails = collect($rows)
                ->map(fn ($r) => $this->cleanEmail($r['contact_email'] ?? null))
                ->filter()
                ->unique()
                ->values();

            $emailToId = [];
            if ($emails->count() > 0) {
                $existingByEmail = DB::table($this->contactTable)
                    ->select('contact_id', 'contact_email')
                    ->whereIn('contact_email', $emails->all())
                    ->get();

                foreach ($existingByEmail as $c) {
                    $emailToId[$this->cleanEmail($c->contact_email)] = $c->contact_id;
                }
            }

            // 4b) preload contacts by hubspot_id
            $hubspotIds = collect($rows)
                ->map(fn ($r) => $this->nullIfEmpty($r['hubspot_id'] ?? null))
                ->filter()
                ->unique()
                ->values();

            $hubspotToId = [];
            if ($hubspotIds->count() > 0) {
                $existingByHubspot = DB::table($this->contactTable)
                    ->select('contact_id', 'hubspot_id')
                    ->whereIn('hubspot_id', $hubspotIds->all())
                    ->get();

                foreach ($existingByHubspot as $c) {
                    $key = (string)$c->hubspot_id;
                    if ($key !== '') $hubspotToId[$key] = $c->contact_id;
                }
            }

            // 5) build insert/update payloads
            $toInsert = [];
            $toUpdate = [];

            foreach ($rows as $r) {
                $email = $this->cleanEmail($r['contact_email'] ?? null);
                $hubspot = $this->nullIfEmpty($r['hubspot_id'] ?? null);

                $existingId = null;
                if ($email && isset($emailToId[$email])) {
                    $existingId = $emailToId[$email];
                } elseif ($hubspot && isset($hubspotToId[(string)$hubspot])) {
                    $existingId = $hubspotToId[(string)$hubspot];
                }

                if (!$email && !$hubspot) {
                    $stats['rows_skipped_no_key']++;
                    continue;
                }

                $companyId = null;
                if ($hasCompanyName) {
                    $cname = $this->cleanCompanyName($r['company_name'] ?? ($r['current_company'] ?? null));
                    if ($cname && isset($companyMap[$cname])) {
                        $companyId = $companyMap[$cname];
                    }
                }

                $payload = $this->extractContactPayloadFromRow($r, $companyId, $now, $validBuSet);

                if ($existingId) {
                    $toUpdate[] = ['contact_id' => $existingId, 'data' => $payload];
                } else {
                    $toInsert[] = array_merge($payload, ['created_at' => $now]);
                }
            }

            // chunk insert contacts (SQL Server 2100 params)
            if (count($toInsert) > 0) {
                $colCount = count(array_keys($toInsert[0]));
                $this->chunkedInsert($this->contactTable, $toInsert, $colCount, $stats);
                $stats['contacts_created'] += count($toInsert);
            }

            // update contacts one by one (safe)
            foreach ($toUpdate as $u) {
                DB::table($this->contactTable)
                    ->where('contact_id', $u['contact_id'])
                    ->update($u['data']);
                $stats['contacts_updated']++;
            }
        });

        $message =
            "Import done. Companies created: {$stats['companies_created']}. " .
            "Companies updated: {$stats['companies_updated']}. " .
            "Contacts created: {$stats['contacts_created']}. " .
            "Contacts updated: {$stats['contacts_updated']}. " .
            "Rows total: {$stats['rows_total']}. Skipped (no key): {$stats['rows_skipped_no_key']}. " .
            "Insert chunks used: {$stats['insert_chunks_used']}.";

        return response()->json([
            'ok' => true,
            'message' => $message,
            'stats' => $stats,
            'meta' => $meta,
        ]);
    }

    /**
     * Chunked insert for SQL Server 2100 parameter limit.
     */
    private function chunkedInsert(string $table, array $rows, int $columnsPerRow, array &$stats): void
    {
        if (count($rows) === 0) return;

        $maxRows = max(1, (int) floor($this->sqlServerMaxParams / max(1, $columnsPerRow)));
        $maxRows = max(1, $maxRows - 5); // safety margin

        foreach (array_chunk($rows, $maxRows) as $chunk) {
            DB::table($table)->insert($chunk);
            $stats['insert_chunks_used']++;
        }
    }

    /**
     * ====== Company constraints (CHECK + FK safe) ======
     */
    private function enforceCompanyConstraints(array $payload, array $validBuSet): array
    {
        if (array_key_exists('company_source', $payload)) {
            $val = $payload['company_source'];
            if ($val === null || !in_array($val, $this->allowedCompanySource, true)) {
                $payload['company_source'] = $this->defaultCompanySource;
            }
        }

        if (array_key_exists('company_classification', $payload)) {
            $val = $payload['company_classification'];
            if ($val === null || !in_array($val, $this->allowedCompanyClassification, true)) {
                $payload['company_classification'] = $this->defaultCompanyClassification;
            }
        }

        if (array_key_exists('business_unit_id', $payload)) {
            $payload['business_unit_id'] = $this->sanitizeBusinessUnitId($payload['business_unit_id'], $validBuSet);
        }

        return $payload;
    }

    /**
     * ====== Contact constraints (CHECK + FK safe) ======
     */
    private function enforceContactConstraints(array $payload, array $validBuSet): array
    {
        // contact_persona
        if (array_key_exists('contact_persona', $payload)) {
            $val = $payload['contact_persona'];
            if ($val === null || !in_array($val, $this->allowedContactPersona, true)) {
                $payload['contact_persona'] = $this->defaultContactPersona;
            }
        }

        // contact_profile.company_classification
        if (array_key_exists('company_classification', $payload)) {
            $val = $payload['company_classification'];
            if ($val === null || !in_array($val, $this->allowedContactCompanyClassification, true)) {
                $payload['company_classification'] = $this->defaultContactCompanyClassification;
            }
        }

        // contact_source
        if (array_key_exists('contact_source', $payload)) {
            $val = $payload['contact_source'];
            if ($val === null || !in_array($val, $this->allowedContactSource, true)) {
                $payload['contact_source'] = $this->defaultContactSource;
            }
        }

        // business_unit_id FK
        if (array_key_exists('business_unit_id', $payload)) {
            $payload['business_unit_id'] = $this->sanitizeBusinessUnitId($payload['business_unit_id'], $validBuSet);
        }

        return $payload;
    }

    private function sanitizeBusinessUnitId($value, array $validBuSet): ?int
    {
        if ($value === null) return null;

        $v = trim((string)$value);
        if ($v === '' || !is_numeric($v)) return null;

        $id = (int)$v;
        return isset($validBuSet[$id]) ? $id : null;
    }

    private function normalizeHeader(string $h): string
    {
        $h = trim($h);
        $h = Str::lower($h);
        $h = str_replace([' ', '-'], '_', $h);
        return $h;
    }

    private function cleanCompanyName($value): ?string
    {
        if ($value === null) return null;
        $v = trim((string)$value);
        if ($v === '') return null;
        $v = preg_replace('/\s+/', ' ', $v);
        return $v;
    }

    private function cleanEmail($value): ?string
    {
        if ($value === null) return null;
        $v = trim(Str::lower((string)$value));
        return $v === '' ? null : $v;
    }

    private function nullIfEmpty($value)
    {
        if ($value === null) return null;
        $v = trim((string)$value);
        return $v === '' ? null : $v;
    }

    private function csvHasColumn(array $rows, string $col): bool
    {
        foreach ($rows as $r) {
            if (array_key_exists($col, $r)) return true;
        }
        return false;
    }

    private function extractCompanyPayloadFromRow(array $r, $now): array
    {
        $payload = [];

        foreach ($this->companyColumns as $col) {
            if (in_array($col, ['created_at', 'updated_at'], true)) continue;
            if (!array_key_exists($col, $r)) continue;

            $payload[$col] = $this->nullIfEmpty($r[$col]);
        }

        $payload['updated_at'] = $now;
        return $payload;
    }

    private function extractContactPayloadFromRow(array $r, $companyId, $now, array $validBuSet): array
    {
        $payload = [];

        foreach ($this->contactColumns as $col) {
            if (in_array($col, ['created_at', 'updated_at'], true)) continue;
            if ($col === 'company_id') continue;

            if (!array_key_exists($col, $r)) continue;

            if ($col === 'contact_email') {
                $payload[$col] = $this->cleanEmail($r[$col]);
                continue;
            }

            if ($col === 'date_of_birth') {
                $payload[$col] = $this->normalizeDate($r[$col]);
                continue;
            }

            $payload[$col] = $this->nullIfEmpty($r[$col]);
        }

        if ($companyId !== null) {
            $payload['company_id'] = $companyId;
        } elseif (array_key_exists('company_id', $r)) {
            $payload['company_id'] = $this->nullIfEmpty($r['company_id']);
        }

        $payload['updated_at'] = $now;

        // enforce constraints (persona + classification + source + bu)
        $payload = $this->enforceContactConstraints($payload, $validBuSet);

        return $payload;
    }

    private function normalizeDate($value): ?string
    {
        $v = $this->nullIfEmpty($value);
        if ($v === null) return null;

        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $v)) return $v;

        try {
            return Carbon::parse($v)->format('Y-m-d');
        } catch (\Throwable $e) {
            return null;
        }
    }
}