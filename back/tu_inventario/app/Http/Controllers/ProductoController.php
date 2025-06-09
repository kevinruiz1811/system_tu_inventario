
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;

class ProductoController extends Controller
{
    public function index() { return Producto::all(); }

    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string',
            'cantidad' => 'required|integer',
            'categoria' => 'required|string',
        ]);
        return Producto::create($request->all());
    }

    public function show($id) { return Producto::findOrFail($id); }

    public function update(Request $request, $id)
    {
        $producto = Producto::findOrFail($id);
        $producto->update($request->all());
        return $producto;
    }

    public function destroy($id) { return Producto::destroy($id); }
}
