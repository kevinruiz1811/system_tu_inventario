import Home from "./components/home/Home";
import Login from "./components/Login";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Products from "./components/products/Products";
import Stock from "./components/Stock/Stock";
import Reports from "./components/reports/Reports";
import Users from "./components/Users/Users";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/productos" element={<Products />} />
        <Route path="/stock" element={<Stock />} />
        <Route path="/reportes" element={<Reports />} />
        <Route path="/usuarios" element={<Users />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
