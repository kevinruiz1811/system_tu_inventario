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

const LOCAL_STORAGE_KEY = "stock_data";

const defaultStock = {
  id: null,
  nombre: "",
  codigo: "",
  categoria: "",
  cantidad: "",
  precio: "",
};

const StockGestion = () => {
  const [stock, setStock] = useState([]);
  const [filteredStock, setFilteredStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [selectedStockId, setSelectedStockId] = useState(null);
  const [openVer, setOpenVer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formStock, setFormStock] = useState(defaultStock);

  // Cargar stock desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setStock(data);
      setFilteredStock(data);
    }
    setLoading(false);
  }, []);

  // Guardar stock en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(stock));
    setFilteredStock(
      stock.filter(
        (item) =>
          item.nombre.toLowerCase().includes(searchTerm) ||
          item.codigo.toLowerCase().includes(searchTerm) ||
          item.categoria.toLowerCase().includes(searchTerm)
      )
    );
  }, [stock]);

  // Filtrar stock al buscar
  useEffect(() => {
    setFilteredStock(
      stock.filter(
        (item) =>
          item.nombre.toLowerCase().includes(searchTerm) ||
          item.codigo.toLowerCase().includes(searchTerm) ||
          item.categoria.toLowerCase().includes(searchTerm)
      )
    );
    setPage(0);
  }, [searchTerm, stock]);

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
    setPage(Math.max(0, Math.ceil(filteredStock.length / rowsPerPage) - 1));
  };

  const handleOpen = () => {
    setFormStock(defaultStock);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormStock(defaultStock);
  };

  const handleOpenEditar = (stockId) => {
    const item = stock.find((p) => p.id === stockId);
    setFormStock(item || defaultStock);
    setSelectedStockId(stockId);
    setOpenEditar(true);
  };

  const handleCloseEditar = () => {
    setOpenEditar(false);
    setSelectedStockId(null);
    setFormStock(defaultStock);
  };

  const handleOpenVer = (stockId) => {
    const item = stock.find((p) => p.id === stockId);
    setFormStock(item || defaultStock);
    setOpenVer(true);
  };

  const handleCloseVer = () => {
    setOpenVer(false);
    setFormStock(defaultStock);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
  };

  // CRUD
  const handleFormChange = (e) => {
    setFormStock({ ...formStock, [e.target.name]: e.target.value });
  };

  const handleAddStock = () => {
    if (
      !formStock.nombre ||
      !formStock.codigo ||
      !formStock.categoria ||
      !formStock.cantidad ||
      !formStock.precio
    ) {
      return;
    }
    const newStock = {
      ...formStock,
      id: Date.now(),
    };
    setStock([newStock, ...stock]);
    handleClose();
  };

  const handleEditStock = () => {
    setStock(
      stock.map((p) =>
        p.id === selectedStockId ? { ...formStock, id: selectedStockId } : p
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
          Registrar Stock
        </Button>
        <Typography variant="h4">STOCK</Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar stock"
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
              ? Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell colSpan={6}>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                ))
              : filteredStock
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.nombre}</TableCell>
                      <TableCell>{item.codigo}</TableCell>
                      <TableCell>{item.categoria}</TableCell>
                      <TableCell>{item.cantidad}</TableCell>
                      <TableCell>{item.precio}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenVer(item.id)}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleOpenEditar(item.id)}
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
          count={filteredStock.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={
            page >= Math.ceil(filteredStock.length / rowsPerPage) - 1
          }
          aria-label="last page"
        >
          <LastPageIcon />
        </IconButton>
      </Box>

      {/* Modal Registrar Stock */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Registrar Stock</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre"
            name="nombre"
            fullWidth
            value={formStock.nombre}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Código"
            name="codigo"
            fullWidth
            value={formStock.codigo}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Categoría"
            name="categoria"
            fullWidth
            value={formStock.categoria}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Cantidad"
            name="cantidad"
            type="number"
            fullWidth
            value={formStock.cantidad}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Precio"
            name="precio"
            type="number"
            fullWidth
            value={formStock.precio}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleAddStock} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar Stock */}
      <Dialog open={openEditar} onClose={handleCloseEditar} fullWidth maxWidth="sm">
        <DialogTitle>Editar Stock</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre"
            name="nombre"
            fullWidth
            value={formStock.nombre}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Código"
            name="codigo"
            fullWidth
            value={formStock.codigo}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Categoría"
            name="categoria"
            fullWidth
            value={formStock.categoria}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Cantidad"
            name="cantidad"
            type="number"
            fullWidth
            value={formStock.cantidad}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Precio"
            name="precio"
            type="number"
            fullWidth
            value={formStock.precio}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditar}>Cancelar</Button>
          <Button onClick={handleEditStock} variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Ver Stock */}
      <Dialog open={openVer} onClose={handleCloseVer} fullWidth maxWidth="sm">
        <DialogTitle>Detalle del Stock</DialogTitle>
        <DialogContent>
          <Typography><b>Nombre:</b> {formStock.nombre}</Typography>
          <Typography><b>Código:</b> {formStock.codigo}</Typography>
          <Typography><b>Categoría:</b> {formStock.categoria}</Typography>
          <Typography><b>Cantidad:</b> {formStock.cantidad}</Typography>
          <Typography><b>Precio:</b> {formStock.precio}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVer}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default function Stock() {
  return <BoxAdmin content={<StockGestion />} />;
}
