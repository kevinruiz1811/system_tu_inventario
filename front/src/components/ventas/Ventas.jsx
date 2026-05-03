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
import Swal from "sweetalert2";

const LOCAL_STORAGE_KEY = "ventas_credito_data";

const defaultVenta = {
  id: null,
  cliente: "",
  descripcion: "",
  valor_total: "",
  abono: "",
  fecha: "",
};

function calcularSaldo(total, abono) {
  const t = Number(total) || 0;
  const a = Number(abono) || 0;
  return Math.max(0, t - a);
}

const VentasGestion = () => {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [openVer, setOpenVer] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState(defaultVenta);

  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      setItems(data);
      setFiltered(data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    setFiltered(
      items.filter(
        (v) =>
          String(v.cliente).toLowerCase().includes(searchTerm) ||
          String(v.descripcion).toLowerCase().includes(searchTerm) ||
          String(v.fecha).toLowerCase().includes(searchTerm),
      ),
    );
    setPage(0);
  }, [searchTerm, items]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };
  const handleFirst = () => setPage(0);
  const handleLast = () =>
    setPage(Math.max(0, Math.ceil(filtered.length / rowsPerPage) - 1));

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    if (
      !form.cliente ||
      !form.descripcion ||
      form.valor_total === "" ||
      form.abono === "" ||
      !form.fecha
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Indica cliente, descripción de la venta, valores y fecha.",
      });
      return false;
    }
    if (Number(form.abono) > Number(form.valor_total)) {
      Swal.fire({
        icon: "warning",
        title: "Abono inválido",
        text: "El abono no puede ser mayor al valor total.",
      });
      return false;
    }
    return true;
  };

  const withSaldo = (row) => ({
    ...row,
    saldo: calcularSaldo(row.valor_total, row.abono),
  });

  const handleAdd = () => {
    if (!validate()) return;
    setItems([withSaldo({ ...form, id: Date.now() }), ...items]);
    setOpen(false);
    setForm(defaultVenta);
  };

  const handleEdit = () => {
    if (!validate()) return;
    setItems(
      items.map((v) =>
        v.id === selectedId ? withSaldo({ ...form, id: selectedId }) : v,
      ),
    );
    setOpenEditar(false);
    setSelectedId(null);
    setForm(defaultVenta);
  };

  return (
    <Box p={4}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Control de ventas a crédito y seguimiento de saldos (cartera) —
        alineado al MVP TuInventario / SurtiHogar.
      </Typography>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        <Button
          variant="contained"
          color="primary"
          onClick={() => {
            setForm(defaultVenta);
            setOpen(true);
          }}
        >
          Registrar venta
        </Button>
        <Typography variant="h4" component="h1">
          Ventas a crédito
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar cliente o concepto…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Abono</TableCell>
              <TableCell>Saldo</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={7}>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                ))
              : filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((v) => (
                    <TableRow key={v.id}>
                      <TableCell>{v.cliente}</TableCell>
                      <TableCell>{v.descripcion}</TableCell>
                      <TableCell>{v.valor_total}</TableCell>
                      <TableCell>{v.abono}</TableCell>
                      <TableCell>
                        {v.saldo != null
                          ? v.saldo
                          : calcularSaldo(v.valor_total, v.abono)}
                      </TableCell>
                      <TableCell>{v.fecha}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setForm(v);
                            setOpenVer(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => {
                            setForm(v);
                            setSelectedId(v.id);
                            setOpenEditar(true);
                          }}
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
        <IconButton onClick={handleFirst} disabled={page === 0} aria-label="first page">
          <FirstPageIcon />
        </IconButton>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filtered.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Filas por página:"
        />
        <IconButton
          onClick={handleLast}
          disabled={page >= Math.ceil(filtered.length / rowsPerPage) - 1}
          aria-label="last page"
        >
          <LastPageIcon />
        </IconButton>
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Nueva venta a crédito</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Cliente" name="cliente" fullWidth value={form.cliente} onChange={handleFormChange} />
          <TextField margin="dense" label="Descripción (productos / servicio)" name="descripcion" fullWidth value={form.descripcion} onChange={handleFormChange} />
          <TextField margin="dense" label="Valor total" name="valor_total" type="number" fullWidth value={form.valor_total} onChange={handleFormChange} />
          <TextField margin="dense" label="Abono inicial" name="abono" type="number" fullWidth value={form.abono} onChange={handleFormChange} />
          <TextField margin="dense" label="Fecha" name="fecha" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.fecha} onChange={handleFormChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleAdd} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditar} onClose={() => setOpenEditar(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar venta</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Cliente" name="cliente" fullWidth value={form.cliente} onChange={handleFormChange} />
          <TextField margin="dense" label="Descripción" name="descripcion" fullWidth value={form.descripcion} onChange={handleFormChange} />
          <TextField margin="dense" label="Valor total" name="valor_total" type="number" fullWidth value={form.valor_total} onChange={handleFormChange} />
          <TextField margin="dense" label="Abono" name="abono" type="number" fullWidth value={form.abono} onChange={handleFormChange} />
          <TextField margin="dense" label="Fecha" name="fecha" type="date" fullWidth InputLabelProps={{ shrink: true }} value={form.fecha} onChange={handleFormChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditar(false)}>Cancelar</Button>
          <Button onClick={handleEdit} variant="contained" color="primary">
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openVer} onClose={() => setOpenVer(false)} fullWidth maxWidth="sm">
        <DialogTitle>Detalle de la venta</DialogTitle>
        <DialogContent>
          <Typography><b>Cliente:</b> {form.cliente}</Typography>
          <Typography><b>Descripción:</b> {form.descripcion}</Typography>
          <Typography><b>Total:</b> {form.valor_total}</Typography>
          <Typography><b>Abono:</b> {form.abono}</Typography>
          <Typography>
            <b>Saldo pendiente:</b>{" "}
            {form.saldo != null
              ? form.saldo
              : calcularSaldo(form.valor_total, form.abono)}
          </Typography>
          <Typography><b>Fecha:</b> {form.fecha}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVer(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default function Ventas() {
  return <BoxAdmin content={<VentasGestion />} />;
}
