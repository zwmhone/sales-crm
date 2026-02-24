@'
<?php

use Illuminate\Support\Facades\Route;

Route::view('/{any}', 'app')->where('any', '.*');
//'@ | Out-File -Encoding utf8 routes/web.php