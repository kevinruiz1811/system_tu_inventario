import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Skeleton,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import BoxAdmin from "../BoxAdmin/BoxAdmin";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import api from "../../api/client";

const defaultProduct = {
  id: null,
  nombre: "",
  codigo: "",
  categoria: "",
  cantidad: "",
  precio: "",
};

const ProductsGestion = () => {
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [openVer, setOpenVer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formProduct, setFormProduct] = useState(defaultProduct);

  const normalizeProduct = (p) => ({
    ...p,
    cantidad: String(p.cantidad ?? ""),
    precio: String(p.precio ?? ""),
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchProductos() {
      try {
        const { data } = await api.get("/productos");
        if (!cancelled) {
          setProductos(data.map(normalizeProduct));
        }
      } catch (err) {
        if (err.response?.status === 401) {
          navigate("/");
          return;
        }
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudieron cargar los productos.",
        });
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchProductos();
    return () => {
      cancelled = true;
    };
  }, [navigate]);

  useEffect(() => {
    setFilteredProductos(
      productos.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(searchTerm) ||
          producto.codigo.toLowerCase().includes(searchTerm) ||
          producto.categoria.toLowerCase().includes(searchTerm),
      ),
    );
    setPage(0);
  }, [searchTerm, productos]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleFirstPageButtonClick = () => {
    setPage(0);
  };

  const handleLastPageButtonClick = () => {
    setPage(Math.max(0, Math.ceil(filteredProductos.length / rowsPerPage) - 1));
  };

  const handleOpen = () => {
    setFormProduct(defaultProduct);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormProduct(defaultProduct);
  };

  const handleOpenEditar = (productId) => {
    const prod = productos.find((p) => p.id === productId);
    setFormProduct(prod || defaultProduct);
    setSelectedProductId(productId);
    setOpenEditar(true);
  };

  const handleCloseEditar = () => {
    setOpenEditar(false);
    setSelectedProductId(null);
    setFormProduct(defaultProduct);
  };

  const handleOpenVer = (productId) => {
    const prod = productos.find((p) => p.id === productId);
    setFormProduct(prod || defaultProduct);
    setOpenVer(true);
  };

  const handleCloseVer = () => {
    setOpenVer(false);
    setFormProduct(defaultProduct);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
  };

  // CRUD
  const handleFormChange = (e) => {
    setFormProduct({ ...formProduct, [e.target.name]: e.target.value });
  };

  const handleAddProduct = async () => {
    if (
      !formProduct.nombre ||
      !formProduct.codigo ||
      !formProduct.categoria ||
      formProduct.cantidad === "" ||
      formProduct.precio === ""
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Completa todos los campos antes de guardar.",
      });
      return;
    }

    const payload = {
      nombre: formProduct.nombre,
      codigo: formProduct.codigo,
      categoria: formProduct.categoria,
      cantidad: Number(formProduct.cantidad),
      precio: Number(formProduct.precio),
    };

    try {
      const { data } = await api.post("/productos", payload);
      setProductos([normalizeProduct(data), ...productos]);
      handleClose();
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/");
        return;
      }
      const apiErrors = err.response?.data?.errors;
      const msg = apiErrors
        ? Object.values(apiErrors).flat().join(" ")
        : err.response?.data?.message || "No se pudo crear el producto.";
      Swal.fire({ icon: "error", title: "Error", text: msg });
    }
  };

  const handleEditProduct = async () => {
    if (
      !formProduct.nombre ||
      !formProduct.codigo ||
      !formProduct.categoria ||
      formProduct.cantidad === "" ||
      formProduct.precio === ""
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Completa todos los campos antes de guardar.",
      });
      return;
    }

    const payload = {
      nombre: formProduct.nombre,
      codigo: formProduct.codigo,
      categoria: formProduct.categoria,
      cantidad: Number(formProduct.cantidad),
      precio: Number(formProduct.precio),
    };

    try {
      const { data } = await api.put(`/productos/${selectedProductId}`, payload);
      setProductos(
        productos.map((p) =>
          p.id === selectedProductId ? normalizeProduct(data) : p,
        ),
      );
      handleCloseEditar();
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/");
        return;
      }
      const apiErrors = err.response?.data?.errors;
      const msg = apiErrors
        ? Object.values(apiErrors).flat().join(" ")
        : err.response?.data?.message || "No se pudo actualizar el producto.";
      Swal.fire({ icon: "error", title: "Error", text: msg });
    }
  };

  return (
    <Box p={4}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
      >
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Registrar Producto
        </Button>
        <Typography variant="h4">PRODUCTOS</Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar producto"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Código</TableCell>
              <TableCell>Categoría</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Precio</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from(new Array(5)).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                ))
              : filteredProductos
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((producto) => (
                    <TableRow key={producto.id}>
                      <TableCell>{producto.nombre}</TableCell>
                      <TableCell>{producto.codigo}</TableCell>
                      <TableCell>{producto.categoria}</TableCell>
                      <TableCell>{producto.cantidad}</TableCell>
                      <TableCell>{producto.precio}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenVer(producto.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleOpenEditar(producto.id)}
                        >
                          <EditIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box display="flex" justifyContent="flex-end" alignItems="center">
        <IconButton
          onClick={handleFirstPageButtonClick}
          disabled={page === 0}
          aria-label="first page"
        >
          <FirstPageIcon />
        </IconButton>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredProductos.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={
            page >= Math.ceil(filteredProductos.length / rowsPerPage) - 1
          }
          aria-label="last page"
        >
          <LastPageIcon />
        </IconButton>
      </Box>

      {/* Modal Registrar Producto */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Registrar Producto</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre"
            name="nombre"
            fullWidth
            value={formProduct.nombre}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Código"
            name="codigo"
            fullWidth
            value={formProduct.codigo}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Categoría"
            name="categoria"
            fullWidth
            value={formProduct.categoria}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Cantidad"
            name="cantidad"
            type="number"
            fullWidth
            value={formProduct.cantidad}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Precio"
            name="precio"
            type="number"
            fullWidth
            value={formProduct.precio}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleAddProduct} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar Producto */}
      <Dialog open={openEditar} onClose={handleCloseEditar} fullWidth maxWidth="sm">
        <DialogTitle>Editar Producto</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre"
            name="nombre"
            fullWidth
            value={formProduct.nombre}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Código"
            name="codigo"
            fullWidth
            value={formProduct.codigo}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Categoría"
            name="categoria"
            fullWidth
            value={formProduct.categoria}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Cantidad"
            name="cantidad"
            type="number"
            fullWidth
            value={formProduct.cantidad}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Precio"
            name="precio"
            type="number"
            fullWidth
            value={formProduct.precio}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditar}>Cancelar</Button>
          <Button onClick={handleEditProduct} variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Ver Producto */}
      <Dialog open={openVer} onClose={handleCloseVer} fullWidth maxWidth="sm">
        <DialogTitle>Detalle del Producto</DialogTitle>
        <DialogContent>
          <Typography><b>Nombre:</b> {formProduct.nombre}</Typography>
          <Typography><b>Código:</b> {formProduct.codigo}</Typography>
          <Typography><b>Categoría:</b> {formProduct.categoria}</Typography>
          <Typography><b>Cantidad:</b> {formProduct.cantidad}</Typography>
          <Typography><b>Precio:</b> {formProduct.precio}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVer}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default function Products() {
  return <BoxAdmin content={<ProductsGestion />} />;
}
