import Home from "./components/home/Home";
import Login from "./components/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./components/products/Products";
import Stock from "./components/Stock/Stock";
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
        <Route path="/productos" element={<Products />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/ventas" element={<Ventas />} />
        <Route path="/reportes" element={<Reports />} />
        <Route path="/usuarios" element={<Users />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
