<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app' => config('app.name'),
        'status' => 'ok',
        'docs' => 'La API está en /api; este front de demo usa localStorage.',
    ]);
});
