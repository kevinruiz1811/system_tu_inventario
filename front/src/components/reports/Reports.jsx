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
  fecha: "",
  tipo_registro: "",
  descripcion: "",
  monto: "",
  estado: "",
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

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setReports(data);
      setFilteredReports(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(reports));
  }, [reports]);

  useEffect(() => {
    setFilteredReports(
      reports.filter(
        (item) =>
          String(item.fecha || "")
            .toLowerCase()
            .includes(searchTerm) ||
          String(item.tipo_registro || "")
            .toLowerCase()
            .includes(searchTerm) ||
          String(item.descripcion || "")
            .toLowerCase()
            .includes(searchTerm) ||
          String(item.monto || "")
            .toLowerCase()
            .includes(searchTerm) ||
          String(item.estado || "")
            .toLowerCase()
            .includes(searchTerm),
      ),
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
    setFormReport({ ...defaultReport, ...item });
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
    setFormReport({ ...defaultReport, ...item });
    setOpenVer(true);
  };

  const handleCloseVer = () => {
    setOpenVer(false);
    setFormReport(defaultReport);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value.toLowerCase());
  };

  const handleFormChange = (e) => {
    setFormReport({ ...formReport, [e.target.name]: e.target.value });
  };

  const handleAddReport = () => {
    if (
      !formReport.fecha ||
      !formReport.tipo_registro ||
      !formReport.descripcion ||
      formReport.monto === "" ||
      !formReport.estado
    ) {
      return;
    }
    setReports([{ ...formReport, id: Date.now() }, ...reports]);
    handleClose();
  };

  const handleEditReport = () => {
    setReports(
      reports.map((p) =>
        p.id === selectedReportId
          ? { ...formReport, id: selectedReportId }
          : p,
      ),
    );
    handleCloseEditar();
  };

  return (
    <Box p={4}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Reportes y resúmenes para cuadre de caja y decisiones (objetivo del
        documento: visibilidad frente al registro manual en cartera física).
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        <Button variant="contained" color="primary" onClick={handleOpen}>
          Registrar movimiento / nota
        </Button>
        <Typography variant="h4" component="h1">
          Reportes
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar…"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Monto</TableCell>
              <TableCell>Estado</TableCell>
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
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell>{item.tipo_registro}</TableCell>
                      <TableCell>{item.descripcion}</TableCell>
                      <TableCell>{item.monto}</TableCell>
                      <TableCell>{item.estado}</TableCell>
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

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>Registrar en reportes</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Fecha"
            name="fecha"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formReport.fecha}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Tipo (venta, abono, inventario, otro)"
            name="tipo_registro"
            fullWidth
            value={formReport.tipo_registro}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Descripción"
            name="descripcion"
            fullWidth
            value={formReport.descripcion}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Monto"
            name="monto"
            type="number"
            fullWidth
            value={formReport.monto}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Estado (pendiente, pagado, verificado…)"
            name="estado"
            fullWidth
            value={formReport.estado}
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

      <Dialog
        open={openEditar}
        onClose={handleCloseEditar}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Editar registro</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Fecha"
            name="fecha"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formReport.fecha}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Tipo"
            name="tipo_registro"
            fullWidth
            value={formReport.tipo_registro}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Descripción"
            name="descripcion"
            fullWidth
            value={formReport.descripcion}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Monto"
            name="monto"
            type="number"
            fullWidth
            value={formReport.monto}
            onChange={handleFormChange}
          />
          <TextField
            margin="dense"
            label="Estado"
            name="estado"
            fullWidth
            value={formReport.estado}
            onChange={handleFormChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditar}>Cancelar</Button>
          <Button onClick={handleEditReport} variant="contained" color="primary">
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openVer} onClose={handleCloseVer} fullWidth maxWidth="sm">
        <DialogTitle>Detalle</DialogTitle>
        <DialogContent>
          <Typography>
            <b>Fecha:</b> {formReport.fecha}
          </Typography>
          <Typography>
            <b>Tipo:</b> {formReport.tipo_registro}
          </Typography>
          <Typography>
            <b>Descripción:</b> {formReport.descripcion}
          </Typography>
          <Typography>
            <b>Monto:</b> {formReport.monto}
          </Typography>
          <Typography>
            <b>Estado:</b> {formReport.estado}
          </Typography>
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
