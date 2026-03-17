<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CompaniesController extends Controller
{

/*
|--------------------------------------------------------------------------
| COMPANY LIST
|--------------------------------------------------------------------------
*/

public function index(Request $request)
{

$query = DB::table('test_cilos_salesdb.CrmDB_Company_Stage')
->select([
'Company_Id as company_id',
'Company_Name as name',
'Primary_Business_Unit_Id as bu',
'Company_Owner as owner',
'Industry as industry',
'City',
'Country'
]);

/*
|--------------------------------------------------------------------------
| FILTER BY BU (Retail / Alliance / Enterprise)
|--------------------------------------------------------------------------
*/

if($request->bu){
$query->where('Primary_Business_Unit_Id',$request->bu);
}

$companies = $query->get();

/*
|--------------------------------------------------------------------------
| FORMAT FOR UI
|--------------------------------------------------------------------------
*/

$data = $companies->map(function($c){

return [
'company_id'=>$c->company_id,
'lead'=>$c->name,
'bu'=>$c->bu,
'owner'=>$c->owner,
'industry'=>$c->industry,
'location'=>trim($c->City.' '.$c->Country),
'related_contacts'=>0,
'related_opportunities'=>0
];

});

return response()->json([
'data'=>$data
]);

}


/*
|--------------------------------------------------------------------------
| COMPANY DETAIL
|--------------------------------------------------------------------------
*/

public function show($id)
{

$company = DB::table('test_cilos_salesdb.CrmDB_Company_Stage')
->where('Company_Id',$id)
->first();

return response()->json($company);

}

}