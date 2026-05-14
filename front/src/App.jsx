import Home from "./components/home/Home";
import Login from "./components/Login";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Inventario from "./components/inventario/Inventario";
import Reports from "./components/reports/Reports";
import Users from "./components/Users/Users";
import Clientes from "./components/clientes/Clientes";
import Ventas from "./components/ventas/Ventas";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/productos" element={<Navigate to="/inventario?tab=0" replace />} />
        <Route path="/stock" element={<Navigate to="/inventario?tab=1" replace />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/reportes" element={<Reports />} />
        <Route path="/usuarios" element={<Users />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
