<?php
 
namespace App\Http\Controllers;
 
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
 
class CsvImportController extends Controller
{
    /**
     * ✅ Return the exact DB column names required in the CSV header
     * (excluding Import_Batch_Id because backend fills it)
     */
    public function columns()
    {
        $conn = DB::connection();
 
        $rows = $conn->select("
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'test_cilos_salesdb'
              AND TABLE_NAME = 'Raw_Master_Import'
              AND COLUMN_NAME <> 'Import_Batch_Id'
            ORDER BY ORDINAL_POSITION
        ");
 
        $columns = array_map(fn($r) => $r->COLUMN_NAME, $rows);
 
        return response()->json([
            'success' => true,
            'table' => 'test_cilos_salesdb.Raw_Master_Import',
            'required_header_columns' => $columns,
        ]);
    }
 
    /**
     * ✅ Download a header-only sample CSV that matches the DB column names
     */
    public function sample()
    {
        $conn = DB::connection();
 
        $rows = $conn->select("
            SELECT COLUMN_NAME
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_SCHEMA = 'test_cilos_salesdb'
              AND TABLE_NAME = 'Raw_Master_Import'
              AND COLUMN_NAME <> 'Import_Batch_Id'
            ORDER BY ORDINAL_POSITION
        ");
 
        $columns = array_map(fn($r) => $r->COLUMN_NAME, $rows);
 
        // Header-only CSV, CRLF (Windows safe)
        $csv = implode(',', array_map(function ($c) {
            // Quote header if it contains special chars
            if (preg_match('/[,"\r\n]/', $c)) {
                return '"' . str_replace('"', '""', $c) . '"';
            }
            return $c;
        }, $columns)) . "\r\n";
 
        $fileName = 'raw_master_import_header_sample.csv';
 
        return response($csv, 200, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Content-Disposition' => "attachment; filename=\"{$fileName}\"",
            'Cache-Control' => 'no-store, no-cache',
        ]);
    }
 
    /**
     * ✅ Upload CSV → BULK INSERT to global temp table → insert to Raw_Master_Import
     * ✅ Run test_cilos_salesdb.usp_RawMaster_To_Stage
     * ✅ Cleanup Raw_Master_Import after stage sync:
     *      - If no other batches exist, TRUNCATE
     *      - Else delete only this batch
     * ✅ Return only what UI needs (rows inserted + status)
     */
    public function upload(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:512000'
        ]);
 
        $batchId = (string) Str::uuid();
 
        $bulkFolder = 'C:\\BulkUploads\\';
        if (!file_exists($bulkFolder)) {
            mkdir($bulkFolder, 0777, true);
        }
 
        $originalName = $request->file('file')->getClientOriginalName();
        $safeName = Str::uuid() . '_' . preg_replace('/[^A-Za-z0-9_\.-]/', '_', $originalName);
        $request->file('file')->move($bulkFolder, $safeName);
 
        $fullPath = $bulkFolder . $safeName;
        $sqlPath  = str_replace('\\', '\\\\', $fullPath);
 
        $conn = DB::connection();
 
        // Global temp table name (unique per upload)
        $tempTable = '##TempImport_' . str_replace('-', '', $batchId);
 
        try {
            /* ============================================================
               1) Read CSV header
               ============================================================ */
            $handle = fopen($fullPath, 'r');
            $csvHeader = fgetcsv($handle);
            fclose($handle);
 
            if (!$csvHeader || count($csvHeader) === 0) {
                throw new \Exception("Unable to read CSV header.");
            }
 
            $csvHeader = array_map(fn($h) => trim((string)$h), $csvHeader);
 
            /* ============================================================
               2) Get DB columns (for mapping)
               ============================================================ */
            $dbColsRows = $conn->select("
                SELECT COLUMN_NAME
                FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = 'test_cilos_salesdb'
                  AND TABLE_NAME = 'Raw_Master_Import'
            ");
            $dbCols = array_map(fn($r) => $r->COLUMN_NAME, $dbColsRows);
 
            $dbSet = [];
            foreach ($dbCols as $c) {
                $dbSet[strtolower($c)] = $c; // preserve casing
            }
 
            /* ============================================================
               3) Build temp table columns = CSV header (SQL-safe, unique)
               ============================================================ */
            $tempCols = [];
            $seen = [];
 
            foreach ($csvHeader as $col) {
                // Temp table column must be SQL-safe (your CSV headers are already safe)
                $safe = preg_match('/^[A-Za-z0-9_]+$/', $col)
                    ? $col
                    : ('InvalidCol_' . substr(md5($col), 0, 8));
 
                // ensure unique (if duplicated header names)
                $key = strtolower($safe);
                if (!isset($seen[$key])) {
                    $seen[$key] = 1;
                } else {
                    $seen[$key]++;
                    $safe = $safe . '_' . $seen[$key];
                }
 
                $tempCols[] = $safe;
            }
 
            // map temp col -> original CSV header col name
            $tempToOriginal = [];
            for ($i = 0; $i < count($tempCols); $i++) {
                $tempToOriginal[$tempCols[$i]] = $csvHeader[$i];
            }
 
            /* ============================================================
               4) Build INSERT list (only columns that exist in DB, excluding Import_Batch_Id)
               ============================================================ */
            $insertCols = [];
            $selectCols = [];
 
            foreach ($tempCols as $tempCol) {
                $origCol = $tempToOriginal[$tempCol];
                $k = strtolower($origCol);
 
                if (isset($dbSet[$k]) && $dbSet[$k] !== 'Import_Batch_Id') {
                    $realDbCol = $dbSet[$k];
                    $insertCols[] = "[$realDbCol]";
                    $selectCols[] = "[$tempCol]";
                }
            }
 
            if (empty($insertCols)) {
                throw new \Exception("No matching columns found between CSV header and test_cilos_salesdb.Raw_Master_Import.");
            }
 
            /* ============================================================
               5) Create GLOBAL temp table
               ============================================================ */
            $conn->statement("IF OBJECT_ID('tempdb..{$tempTable}') IS NOT NULL DROP TABLE {$tempTable}");
 
            $tempColumnsSql = implode(", ", array_map(fn($c) => "[$c] NVARCHAR(MAX) NULL", $tempCols));
            $conn->statement("CREATE TABLE {$tempTable} ({$tempColumnsSql})");
 
            /* ============================================================
               6) BULK INSERT into GLOBAL temp table
               ============================================================ */
            $conn->statement("
                BULK INSERT {$tempTable}
                FROM '{$sqlPath}'
                WITH (
                    FIRSTROW = 2,
                    FIELDTERMINATOR = ',',
                    ROWTERMINATOR = '0x0d0a',
                    CODEPAGE = '65001',
                    TABLOCK,
                    BATCHSIZE = 5000
                )
            ");
 
            /* ============================================================
               7) Insert into test_cilos_salesdb.Raw_Master_Import + Import_Batch_Id
               ============================================================ */
            $insertList = implode(", ", $insertCols) . ", [Import_Batch_Id]";
            $selectList = implode(", ", $selectCols) . ", '{$batchId}'";
 
            $conn->statement("
                INSERT INTO test_cilos_salesdb.Raw_Master_Import ({$insertList})
                SELECT {$selectList}
                FROM {$tempTable}
            ");
 
            $rowsInsertedThisUpload = $conn->table('test_cilos_salesdb.Raw_Master_Import')
                ->where('Import_Batch_Id', $batchId)
                ->count();
 
            /* ============================================================
               8) Cleanup temp table
               ============================================================ */
            $conn->statement("DROP TABLE {$tempTable}");
 
            /* ============================================================
               9) Run stored procedure AFTER raw insert
               ============================================================ */
            $loadedBy = $request->user()->email ?? $request->user()->name ?? null;
 
            $conn->statement(
                "EXEC test_cilos_salesdb.usp_RawMaster_To_Stage ?, ?, ?",
                [$batchId, $loadedBy, $originalName]
            );
 
            /* ============================================================
               10) Cleanup Raw_Master_Import
                   ✅ If no other batch exists => TRUNCATE
                   ✅ Else => delete only this batch (safe)
               ============================================================ */
            $otherBatchExists = $conn->table('test_cilos_salesdb.Raw_Master_Import')
                ->where('Import_Batch_Id', '!=', $batchId)
                ->exists();
 
            if (!$otherBatchExists) {
                $conn->statement("TRUNCATE TABLE test_cilos_salesdb.Raw_Master_Import");
            } else {
                $conn->statement("DELETE FROM test_cilos_salesdb.Raw_Master_Import WHERE Import_Batch_Id = ?", [$batchId]);
            }
 
            return response()->json([
                'success' => true,
                'batch_id' => $batchId,
                'file_name' => $originalName,
                'rows_inserted_this_upload' => $rowsInsertedThisUpload,
                'stage_sync' => 'completed'
            ]);
 
        } catch (\Throwable $e) {
            // best-effort cleanup for temp table
            try {
                $conn->statement("IF OBJECT_ID('tempdb..{$tempTable}') IS NOT NULL DROP TABLE {$tempTable}");
            } catch (\Throwable $ignored) {}
 
            return response()->json([
                'success' => false,
                'batch_id' => $batchId,
                'file_name' => $originalName ?? null,
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
 