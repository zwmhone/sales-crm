<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Foundation\Support\Providers\RouteServiceProvider as ServiceProvider;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;

class RouteServiceProvider extends ServiceProvider
{
    /**
     * Optional: where to redirect users after login.
     */
    public const HOME = '/';

    /**
     * Define your route model bindings, pattern filters, and route configuration.
     */
    public function boot(): void
    {
        // API rate limiting (standard Laravel behavior)
        $this->configureRateLimiting();

        $this->routes(function () {
            // ✅ API routes => /api/...
            Route::middleware('api')
                ->prefix('api')
                ->group(base_path('routes/api.php'));

            // ✅ Web routes => normal web middleware (sessions, CSRF, etc.)
            Route::middleware('web')
                ->group(base_path('routes/web.php'));
        });
    }

    /**
     * Configure the rate limiters for the application.
     */
    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', function (Request $request) {
            // 60 requests per minute per user (or per IP if not logged in)
            return Limit::perMinute(60)->by(
                optional($request->user())->id ?: $request->ip()
            );
        });
    }
}