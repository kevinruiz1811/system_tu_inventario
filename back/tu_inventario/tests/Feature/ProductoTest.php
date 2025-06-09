
<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Producto;

class ProductoTest extends TestCase
{
    use RefreshDatabase;

    public function test_crear_producto()
    {
        $response = $this->postJson('/api/productos', [
            'nombre' => 'Jabón',
            'cantidad' => 10,
            'categoria' => 'Aseo'
        ]);

        $response->assertStatus(201);
    }
}
