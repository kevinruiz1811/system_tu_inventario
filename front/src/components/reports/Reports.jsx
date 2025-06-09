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

const LOCAL_STORAGE_KEY = "reports_data";

const defaultReport = {
  id: null,
  nombre: "",
  codigo: "",
  categoria: "",
  cantidad: "",
  precio: "",
};

const ReportsGestion = () => {
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [selectedReportId, setSelectedReportId] = useState(null);
  const [openVer, setOpenVer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [formReport, setFormReport] = useState(defaultReport);

  // Cargar reports desde localStorage
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setReports(data);
      setFilteredReports(data);
    }
    setLoading(false);
  }, []);

  // Guardar reports en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
    setFilteredReports(
      reports.filter(
        (item) =>
          item.nombre.toLowerCase().includes(searchTerm) ||
          item.codigo.toLowerCase().includes(searchTerm) ||
          item.categoria.toLowerCase().includes(searchTerm)
      )
    );
  }, [reports]);

  // Filtrar reports al buscar
  useEffect(() => {
    setFilteredReports(
      reports.filter(
        (item) =>
          item.nombre.toLowerCase().includes(searchTerm) ||
          item.codigo.toLowerCase().includes(searchTerm) ||
          item.categoria.toLowerCase().includes(searchTerm)
      )
    );
    setPage(0);
  }, [searchTerm, reports]);

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
    setPage(Math.max(0, Math.ceil(filteredReports.length / rowsPerPage) - 1));
  };

  const handleOpen = () => {
    setFormReport(defaultReport);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setFormReport(defaultReport);
  };

  const handleOpenEditar = (reportId) => {
    const item = reports.find((p) => p.id === reportId);
    setFormReport(item || defaultReport);
    setSelectedReportId(reportId);
    setOpenEditar(true);
  };

  const handleCloseEditar = () => {
    setOpenEditar(false);
    setSelectedReportId(null);
    setFormReport(defaultReport);
  };

  const handleOpenVer = (reportId) => {
    const item = reports.find((p) => p.id === reportId);
    setFormReport(item || defaultReport);
    setOpenVer(true);
  };

  const handleCloseVer = () => {
    setOpenVer(false);
    setFormReport(defaultReport);
  };

  const handleSearchChange = (event) => {
    const value = event.target.value.toLowerCase();
    setSearchTerm(value);
  };

  // CRUD
  const handleFormChange = (e) => {
    setFormReport({ ...formReport, [e.target.name]: e.target.value });
  };

  const handleAddReport = () => {
    if (
      !formReport.nombre ||
      !formReport.codigo ||
      !formReport.categoria ||
      !formReport.cantidad ||
      !formReport.precio
    ) {
      return;
    }
    const newReport = {
      ...formReport,
      id: Date.now(),
    };
    setReports([newReport, ...reports]);
    handleClose();
  };

  const handleEditReport = () => {
    setReports(
      reports.map((p) =>
        p.id === selectedReportId ? { ...formReport, id: selectedReportId } : p
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
          Registrar Reporte
        </Button>
        <Typography variant="h4">REPORTES</Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar reporte"
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
              : filteredReports
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
          count={filteredReports.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
        <IconButton
          onClick={handleLastPageButtonClick}
          disabled={
            page >= Math.ceil(filteredReports.length / rowsPerPage) - 1
          }
          aria-label="last page"
        >
          <LastPageIcon />
        </IconButton>
      </Box>

      {/* Modal Registrar Reporte */}
      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Registrar Reporte</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre"
            name="nombre"
            fullWidth
            value={formReport.nombre}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Código"
            name="codigo"
            fullWidth
            value={formReport.codigo}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Categoría"
            name="categoria"
            fullWidth
            value={formReport.categoria}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Cantidad"
            name="cantidad"
            type="number"
            fullWidth
            value={formReport.cantidad}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Precio"
            name="precio"
            type="number"
            fullWidth
            value={formReport.precio}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button onClick={handleAddReport} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Editar Reporte */}
      <Dialog open={openEditar} onClose={handleCloseEditar} fullWidth maxWidth="sm">
        <DialogTitle>Editar Reporte</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Nombre"
            name="nombre"
            fullWidth
            value={formReport.nombre}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Código"
            name="codigo"
            fullWidth
            value={formReport.codigo}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Categoría"
            name="categoria"
            fullWidth
            value={formReport.categoria}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Cantidad"
            name="cantidad"
            type="number"
            fullWidth
            value={formReport.cantidad}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Precio"
            name="precio"
            type="number"
            fullWidth
            value={formReport.precio}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditar}>Cancelar</Button>
          <Button onClick={handleEditReport} variant="contained" color="primary">
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Ver Reporte */}
      <Dialog open={openVer} onClose={handleCloseVer} fullWidth maxWidth="sm">
        <DialogTitle>Detalle del Reporte</DialogTitle>
        <DialogContent>
          <Typography><b>Nombre:</b> {formReport.nombre}</Typography>
          <Typography><b>Código:</b> {formReport.codigo}</Typography>
          <Typography><b>Categoría:</b> {formReport.categoria}</Typography>
          <Typography><b>Cantidad:</b> {formReport.cantidad}</Typography>
          <Typography><b>Precio:</b> {formReport.precio}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseVer}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default function Reports() {
  return <BoxAdmin content={<ReportsGestion />} />;
}
