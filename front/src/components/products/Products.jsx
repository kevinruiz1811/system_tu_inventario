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

const LOCAL_STORAGE_KEY = "productos_data";

const defaultProduct = {
  id: null,
  nombre: "",
  codigo: "",
  categoria: "",
  cantidad: "",
  precio: "",
};

const ProductsGestion = () => {
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

  // Cargar productos desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setProductos(data);
      setFilteredProductos(data);
    }
    setLoading(false);
  }, []);

  // Guardar productos en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(productos));
    setFilteredProductos(
      productos.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(searchTerm) ||
          producto.codigo.toLowerCase().includes(searchTerm) ||
          producto.categoria.toLowerCase().includes(searchTerm)
      )
    );
  }, [productos]);

  // Filtrar productos al buscar
  useEffect(() => {
    setFilteredProductos(
      productos.filter(
        (producto) =>
          producto.nombre.toLowerCase().includes(searchTerm) ||
          producto.codigo.toLowerCase().includes(searchTerm) ||
          producto.categoria.toLowerCase().includes(searchTerm)
      )
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

  const handleAddProduct = () => {
    if (
      !formProduct.nombre ||
      !formProduct.codigo ||
      !formProduct.categoria ||
      !formProduct.cantidad ||
      !formProduct.precio
    ) {
      return;
    }
    const newProduct = {
      ...formProduct,
      id: Date.now(),
    };
    setProductos([newProduct, ...productos]);
    handleClose();
  };

  const handleEditProduct = () => {
    setProductos(
      productos.map((p) =>
        p.id === selectedProductId ? { ...formProduct, id: selectedProductId } : p
      )
    );
    handleCloseEditar();
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
