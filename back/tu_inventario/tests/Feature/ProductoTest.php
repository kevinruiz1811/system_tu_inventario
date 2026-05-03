<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductoTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_returns_token(): void
    {
        User::factory()->create([
            'name' => 'admin',
            'email' => 'qa@surtihogar.local',
            'password' => 'secret',
        ]);

        $response = $this->postJson('/api/login', [
            'username' => 'admin',
            'password' => 'secret',
        ]);

        $response->assertOk()->assertJsonStructure(['token']);
    }

    public function test_crear_producto_requires_auth(): void
    {
        $this->postJson('/api/productos', [
            'nombre' => 'Jabón',
            'codigo' => 'JAB-001',
            'categoria' => 'Aseo',
            'cantidad' => 10,
            'precio' => 2.5,
        ])->assertUnauthorized();
    }

    public function test_crear_producto(): void
    {
        Sanctum::actingAs(User::factory()->create());

        $response = $this->postJson('/api/productos', [
            'nombre' => 'Jabón',
            'codigo' => 'JAB-001',
            'categoria' => 'Aseo',
            'cantidad' => 10,
            'precio' => 2.5,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('productos', ['codigo' => 'JAB-001']);
    }
}
