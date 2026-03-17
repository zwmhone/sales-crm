<?php
// Run:
// php tools/generate_stress_csv.php
//
// Output:
// storage/app/stress_import_20.csv
// storage/app/stress_import_40.csv
// storage/app/stress_import_60.csv
// storage/app/stress_import_full.csv
 
$baseDir = __DIR__ . '/../storage/app/';
@mkdir($baseDir, 0777, true);
 
/*
|--------------------------------------------------------------------------
| CRLF Writer (Windows Safe)
|--------------------------------------------------------------------------
*/
function writeCsvRowCRLF($handle, array $row)
{
    $temp = fopen('php://temp', 'r+');
    fputcsv($temp, $row);
    rewind($temp);
    $csvLine = stream_get_contents($temp);
    fclose($temp);
 
    $csvLine = rtrim($csvLine, "\n") . "\r\n";
    fwrite($handle, $csvLine);
}
 
/*
|--------------------------------------------------------------------------
| FULL DATABASE COLUMN MASTER LIST (Exclude Import_Batch_Id)
|--------------------------------------------------------------------------
*/
$allColumns = [
    'Contact_Type_Id','Salutation','First_Name','Last_Name',
    'Date_of_Birth','Address_Line_1','Address_Line_2','City','Postal_Code',
    'State_Region','Country_Id','Contact_Owner','Contact_Source',
    'Contact_DB_Status_Id','Curation_Id','NRIC_Number','Residence_Status_Id',
    'Work_Email','Highest_Qualification','Personal_Email','Major',
    'School_Attended','Mobile_Phone_Number','Viber_Number',
    'WhatsApp_Phone_Number','Nationality_Id','FIN_Number','Passport_Number',
    'Race_Id','Job_Classification','Current_Income_Yearly','Job_Title',
    'Current_Designation','No_of_Work_Experience_Year','Channel_Ref_Id',
    'Company_Id','Company_Segment','Cilos_Substage_Id',
    'Marketing_Campaign_Id','Lead_Status','Lifecycle_Stage',
    'Next_Activity_Date','Facebook_Id','LinkedIn_URL','Contact_Notes',
    'Parent_Guardian_Contact_No','Parent_Guardian_Email','Referred_By',
    'Referrer_Email_Address','Sales_Campaign_Id','Solution_Group_Id',
    'Sponsoring_Entity_Id','Solution','Resume','Do_Not_Call',
    'Desired_Quarter_Intake','Industry_Sector',
    'Parent_Guardian_NRIC_Passport_No','Career_Level','UTM_Source',
    'UTM_Medium','UTM_Campaign','Company_Name',
    'Company_Linkedin_URL','Linkedin_Handle','Company_Website',
    'Company_Email','Company_Phone','Company_Facebook',
    'Contact_Person','Contact_Person_Email',
    'Primary_Business_Unit_Id','Primary_Business_Acc_Mgr',
    'Secondary_Business_Unit_Id','Secondary_Business_Acc_Mgr',
    'Company_SSIC','Company_Code','Company_City','Company_Status',
    'Industry','Phone_Number','Referrer_Address',
    'Company_UEN_Registration_No','Company_Size_Category_Code',
    'Industry_Sector_Id','Industry_Group','Institute_Type',
    'Partner_Type','CILOS_Life_Cycle_Stage',
    'Company_Address_Line_1','Company_Address_Line_2',
    'Company_Postal_Code','Company_State_Region','Country',
    'Agentic_Type_Id','Sales_Region','Company_Domain_Name',
    'Employee_Range','Website_URL',
    'EduCLaaS_Account_Manager_Name','Referrer_Name',
    'Company_Owner','Managed_Contact','Annual_Revenue','Company_Notes'
];
 
/*
|--------------------------------------------------------------------------
| Column length map (based on your DB listing)
|--------------------------------------------------------------------------
| NVARCHAR lengths:
| - -1 means NVARCHAR(MAX)
|--------------------------------------------------------------------------
*/
$COLUMN_MAXLEN = [
    'Salutation' => 20,
    'Do_Not_Call' => 20,
    'Managed_Contact' => 20,
    'Postal_Code' => 40,
 
    'Contact_Type_Id' => 100,
    'First_Name' => 100,
    'Last_Name' => 100,
    'Date_of_Birth' => 100,
    'Country_Id' => 100,
    'Contact_Owner' => 100,
    'Contact_DB_Status_Id' => 100,
    'Curation_Id' => 100,
    'NRIC_Number' => 100,
    'Residence_Status_Id' => 100,
    'Mobile_Phone_Number' => 100,
    'Viber_Number' => 100,
    'WhatsApp_Phone_Number' => 100,
    'Nationality_Id' => 100,
    'FIN_Number' => 100,
    'Passport_Number' => 100,
    'Race_Id' => 100,
    'Current_Income_Yearly' => 100,
    'No_of_Work_Experience_Year' => 100,
    'Channel_Ref_Id' => 100,
    'Company_Id' => 100,
    'Cilos_Substage_Id' => 100,
    'Marketing_Campaign_Id' => 100,
    'Next_Activity_Date' => 100,
    'Parent_Guardian_Contact_No' => 100,
    'Sales_Campaign_Id' => 100,
    'Solution_Group_Id' => 100,
    'Sponsoring_Entity_Id' => 100,
    'Desired_Quarter_Intake' => 100,
    'Industry_Sector_Id' => 100,
    'CILOS_Life_Cycle_Stage' => 100,
    'Company_Postal_Code' => 100,
    'Agentic_Type_Id' => 100,
    'Sales_Region' => 100,
    'Annual_Revenue' => 100,
 
    'City' => 200,
    'State_Region' => 200,
    'Contact_Source' => 200,
    'Highest_Qualification' => 200,
    'Major' => 200,
    'Job_Classification' => 200,
    'Job_Title' => 200,
    'Current_Designation' => 200,
    'Lead_Status' => 200,
    'Lifecycle_Stage' => 200,
    'Facebook_Id' => 200,
    'Solution' => 200,
    'Industry_Sector' => 200,
    'Career_Level' => 200,
    'UTM_Source' => 200,
    'UTM_Medium' => 200,
    'UTM_Campaign' => 200,
 
    'Work_Email' => 300,
    'Personal_Email' => 300,
    'School_Attended' => 300,
    'Parent_Guardian_Email' => 300,
    'Referred_By' => 300,
    'Referrer_Email_Address' => 300,
 
    'Address_Line_1' => 510,
    'Address_Line_2' => 510,
    'LinkedIn_URL' => 510,
    'Resume' => 510,
    'Parent_Guardian_NRIC_Passport_No' => 200,
    'Company_Name' => 510,
    'Company_Linkedin_URL' => 510,
    'Linkedin_Handle' => 510,
    'Company_Website' => 510,
    'Company_Email' => 510,
    'Company_Phone' => 510,
    'Company_Facebook' => 510,
    'Contact_Person' => 510,
    'Contact_Person_Email' => 510,
    'Company_SSIC' => 510,
    'Company_City' => 510,
    'Company_Status' => 510,
    'Industry' => 510,
    'Phone_Number' => 510,
    'Referrer_Address' => 510,
    'Company_UEN_Registration_No' => 510,
    'Company_Size_Category_Code' => 510,
    'Industry_Group' => 510,
    'Institute_Type' => 510,
    'Partner_Type' => 510,
    'Company_Address_Line_1' => 510,
    'Company_Address_Line_2' => 510,
    'Company_State_Region' => 510,
    'Country' => 510,
    'Company_Domain_Name' => 510,
    'Employee_Range' => 510,
    'Website_URL' => 510,
    'EduCLaaS_Account_Manager_Name' => 510,
    'Referrer_Name' => 510,
    'Company_Owner' => 510,
 
    'Contact_Notes' => -1,
    'Company_Notes' => -1,
 
    'Company_Code' => 100,
    'Primary_Business_Unit_Id' => 100,
    'Primary_Business_Acc_Mgr' => 100,
    'Secondary_Business_Unit_Id' => 100,
    'Secondary_Business_Acc_Mgr' => 100,
    'Company_Segment' => 200,
];
 
/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/
function randomPhoneMY()
{
    return '01' . rand(10000000, 99999999);
}
 
function randomDate()
{
    return rand(1980, 2000) . '-' .
        str_pad(rand(1, 12), 2, '0', STR_PAD_LEFT) . '-' .
        str_pad(rand(1, 28), 2, '0', STR_PAD_LEFT);
}
 
function guid()
{
    return sprintf(
        '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000,
        mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}
 
function limitLen($value, $maxLen)
{
    if ($maxLen === -1) return $value;
    if (!is_int($maxLen) || $maxLen <= 0) return $value;
    return mb_substr((string)$value, 0, $maxLen);
}
 
function generateValue($column, $i, $maxLen)
{
    $v = match($column) {
        'Salutation' => ['Mr','Ms','Mrs','Dr','Mdm'][($i % 5)],
        'Do_Not_Call' => (string)(($i % 2) === 0 ? 0 : 1),
        'Managed_Contact' => (string)(($i % 2) === 0 ? 0 : 1),
 
        'First_Name' => "User{$i}",
        'Last_Name' => "Test{$i}",
        'Personal_Email' => "user{$i}@example.com",
        'Work_Email' => "work{$i}@example.com",
        'Parent_Guardian_Email' => "parent{$i}@example.com",
        'Contact_Person_Email' => "manager{$i}@company.com",
 
        'Mobile_Phone_Number' => randomPhoneMY(),
        'Viber_Number' => randomPhoneMY(),
        'WhatsApp_Phone_Number' => randomPhoneMY(),
        'Company_Phone' => '03' . rand(1000000, 9999999),
        'Phone_Number' => '03' . rand(1000000, 9999999),
        'Parent_Guardian_Contact_No' => randomPhoneMY(),
 
        'Date_of_Birth' => randomDate(),
        'Next_Activity_Date' => date('Y-m-d'),
 
        'Address_Line_1' => "Street {$i}",
        'Address_Line_2' => "Block {$i}",
        'Company_Address_Line_1' => "Company Street {$i}",
        'Company_Address_Line_2' => "Company Block {$i}",
        'Referrer_Address' => "Ref Address {$i}",
        'City' => "Kuala Lumpur",
        'Company_City' => "Kuala Lumpur",
        'State_Region' => "KL",
        'Company_State_Region' => "KL",
        'Postal_Code' => "50000",
        'Company_Postal_Code' => "50000",
        'Country' => "Malaysia",
 
        'Contact_Source' => ['Marketing','Sales','Purchased','Linkedin'][($i % 4)],
        'Highest_Qualification' => ['Diploma','Degree','Master','PhD'][($i % 4)],
        'Major' => ['Computer Science','Business','IT','Engineering'][($i % 4)],
        'School_Attended' => "Test University {$i}",
        'Job_Classification' => ['IT','Finance','Sales','Marketing'][($i % 4)],
        'Job_Title' => ['Engineer','Analyst','Manager','Developer'][($i % 4)],
        'Current_Designation' => ['Junior','Mid','Senior','Lead'][($i % 4)],
        'No_of_Work_Experience_Year' => (string)rand(0, 15),
        'Current_Income_Yearly' => (string)rand(30000, 150000),
        'Lead_Status' => ['New','Working','Nurture','Converted'][($i % 4)],
        'Lifecycle_Stage' => ['Prospect','Lead','Customer','Alumni'][($i % 4)],
        'UTM_Source' => ['Google','LinkedIn','Facebook','Direct'][($i % 4)],
        'UTM_Medium' => ['CPC','Email','Organic','Referral'][($i % 4)],
        'UTM_Campaign' => "Campaign " . (($i % 5) + 1),
 
        'Company_Name' => "Company {$i}",
        'Company_Website' => "https://company{$i}.com",
        'Website_URL' => "https://company{$i}.com",
        'Company_Domain_Name' => "company{$i}.com",
        'Company_Email' => "contact{$i}@company.com",
        'Company_Facebook' => "https://facebook.com/company{$i}",
        'Company_Linkedin_URL' => "https://linkedin.com/company/{$i}",
        'LinkedIn_URL' => "https://linkedin.com/in/user{$i}",
        'Linkedin_Handle' => "handle{$i}",
        'Contact_Person' => "Manager {$i}",
        'EduCLaaS_Account_Manager_Name' => "Account Manager {$i}",
        'Referrer_Name' => "Referrer {$i}",
        'Company_Owner' => "Owner {$i}",
        'Company_Segment' => ['Corporate','SME','Government','Education'][($i % 4)],
        'Company_Status' => ['Active','Inactive'][($i % 2)],
        'Employee_Range' => ['1-10','11-50','51-200','201-500'][($i % 4)],
 
        'Company_SSIC' => "SSIC{$i}",
        'Company_Code' => "C{$i}",
        'Company_UEN_Registration_No' => "UEN{$i}",
        'Company_Size_Category_Code' => ['Small','Medium','Large'][($i % 3)],
        'Industry' => ['Technology','Finance','Education','Retail'][($i % 4)],
        'Industry_Group' => ['Private','Public','NGO'][($i % 3)],
        'Institute_Type' => ['HigherED','Training-Institute'][($i % 2)],
        'Partner_Type' => ['Partner','Reseller','Direct'][($i % 3)],
 
        'Solution' => ['Solution A','Solution B','Solution C'][($i % 3)],
        'Resume' => "resume{$i}.pdf",
        'Desired_Quarter_Intake' => '2025-Q' . (($i % 4) + 1),
        'Annual_Revenue' => (string)rand(10000, 500000),
 
        'NRIC_Number' => "NRIC{$i}",
        'FIN_Number' => "FIN{$i}",
        'Passport_Number' => "PASS{$i}",
        'Parent_Guardian_NRIC_Passport_No' => "PP{$i}",
 
        'Contact_Notes' => str_repeat("Generated note {$i}. ", 10),
        'Company_Notes' => str_repeat("Company notes {$i}. ", 12),
 
        // many "Id" fields are GUID-ish (your DB stores them as nvarchar)
        default => (str_ends_with($column, '_Id') || str_ends_with($column, '_ID')) ? guid() : "Value_{$column}_{$i}",
    };
 
    return limitLen($v, $maxLen);
}
 
/*
|--------------------------------------------------------------------------
| Pick random subset of columns
|--------------------------------------------------------------------------
*/
function pickRandomColumns(array $all, int $count): array
{
    $count = min($count, count($all));
    $copy = $all;
    shuffle($copy);
    return array_slice($copy, 0, $count);
}
 
/*
|--------------------------------------------------------------------------
| File Generator Function
|--------------------------------------------------------------------------
*/
function generateFile($filePath, $columns, $totalRows, $COLUMN_MAXLEN)
{
    $fp = fopen($filePath, 'w');
    if (!$fp) {
        die("Unable to create {$filePath}\n");
    }
 
    // Always shuffle header order to differ from DB order
    shuffle($columns);
 
    writeCsvRowCRLF($fp, $columns);
 
    for ($i = 1; $i <= $totalRows; $i++) {
        $row = [];
 
        foreach ($columns as $column) {
            $maxLen = $COLUMN_MAXLEN[$column] ?? 100; // default safe
            $row[] = generateValue($column, $i, $maxLen);
        }
 
        writeCsvRowCRLF($fp, $row);
    }
 
    fclose($fp);
}
 
/*
|--------------------------------------------------------------------------
| Generate ALL Files
|--------------------------------------------------------------------------
*/
$totalRows = 100;
 
// 20 columns (random subset + shuffled header order)
generateFile(
    $baseDir . 'stress_import_20.csv',
    pickRandomColumns($allColumns, 20),
    $totalRows,
    $COLUMN_MAXLEN
);
 
// 40 columns (random subset + shuffled header order)
generateFile(
    $baseDir . 'stress_import_40.csv',
    pickRandomColumns($allColumns, 40),
    $totalRows,
    $COLUMN_MAXLEN
);
 
// 60 columns (random subset + shuffled header order) ✅ NEW
generateFile(
    $baseDir . 'stress_import_60.csv',
    pickRandomColumns($allColumns, 60),
    $totalRows,
    $COLUMN_MAXLEN
);
 
// full columns (shuffled header order)
generateFile(
    $baseDir . 'stress_import_full.csv',
    $allColumns,
    $totalRows,
    $COLUMN_MAXLEN
);
 
echo "Generated successfully:\n";
echo "- stress_import_20.csv\n";
echo "- stress_import_40.csv\n";
echo "- stress_import_60.csv\n";
echo "- stress_import_full.csv\n";