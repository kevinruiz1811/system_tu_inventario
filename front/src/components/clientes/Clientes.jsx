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

const LOCAL_STORAGE_KEY = "clientes_data";

const defaultCliente = {
  id: null,
  nombre: "",
  documento: "",
  telefono: "",
  direccion: "",
  cupo_credito: "",
};

const ClientesGestion = () => {
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
  const [form, setForm] = useState(defaultCliente);

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
        (c) =>
          String(c.nombre).toLowerCase().includes(searchTerm) ||
          String(c.documento).toLowerCase().includes(searchTerm) ||
          String(c.telefono).toLowerCase().includes(searchTerm) ||
          String(c.direccion).toLowerCase().includes(searchTerm),
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
      !form.nombre ||
      !form.documento ||
      !form.telefono ||
      !form.direccion ||
      form.cupo_credito === ""
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Completa todos los campos del cliente.",
      });
      return false;
    }
    return true;
  };

  const handleAdd = () => {
    if (!validate()) return;
    setItems([{ ...form, id: Date.now() }, ...items]);
    setOpen(false);
    setForm(defaultCliente);
  };

  const handleEdit = () => {
    if (!validate()) return;
    setItems(
      items.map((c) => (c.id === selectedId ? { ...form, id: selectedId } : c)),
    );
    setOpenEditar(false);
    setSelectedId(null);
    setForm(defaultCliente);
  };

  return (
    <Box p={4}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        flexWrap="wrap"
        gap={2}
      >
        <Button variant="contained" color="primary" onClick={() => { setForm(defaultCliente); setOpen(true); }}>
          Registrar cliente
        </Button>
        <Typography variant="h4" component="h1">
          Clientes
        </Typography>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Buscar por nombre, documento, teléfono…"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
        />
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Nombre</TableCell>
              <TableCell>Documento</TableCell>
              <TableCell>Teléfono</TableCell>
              <TableCell>Dirección</TableCell>
              <TableCell>Cupo crédito</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={6}>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                ))
              : filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((c) => (
                    <TableRow key={c.id}>
                      <TableCell>{c.nombre}</TableCell>
                      <TableCell>{c.documento}</TableCell>
                      <TableCell>{c.telefono}</TableCell>
                      <TableCell>{c.direccion}</TableCell>
                      <TableCell>{c.cupo_credito}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => {
                            setForm(c);
                            setOpenVer(true);
                          }}
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => {
                            setForm(c);
                            setSelectedId(c.id);
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
        <DialogTitle>Registrar cliente</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Nombre completo" name="nombre" fullWidth value={form.nombre} onChange={handleFormChange} />
          <TextField margin="dense" label="Documento" name="documento" fullWidth value={form.documento} onChange={handleFormChange} />
          <TextField margin="dense" label="Teléfono" name="telefono" fullWidth value={form.telefono} onChange={handleFormChange} />
          <TextField margin="dense" label="Dirección" name="direccion" fullWidth value={form.direccion} onChange={handleFormChange} />
          <TextField margin="dense" label="Cupo de crédito autorizado" name="cupo_credito" type="number" fullWidth value={form.cupo_credito} onChange={handleFormChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleAdd} variant="contained" color="primary">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEditar} onClose={() => setOpenEditar(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar cliente</DialogTitle>
        <DialogContent>
          <TextField margin="dense" label="Nombre completo" name="nombre" fullWidth value={form.nombre} onChange={handleFormChange} />
          <TextField margin="dense" label="Documento" name="documento" fullWidth value={form.documento} onChange={handleFormChange} />
          <TextField margin="dense" label="Teléfono" name="telefono" fullWidth value={form.telefono} onChange={handleFormChange} />
          <TextField margin="dense" label="Dirección" name="direccion" fullWidth value={form.direccion} onChange={handleFormChange} />
          <TextField margin="dense" label="Cupo de crédito" name="cupo_credito" type="number" fullWidth value={form.cupo_credito} onChange={handleFormChange} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditar(false)}>Cancelar</Button>
          <Button onClick={handleEdit} variant="contained" color="primary">
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openVer} onClose={() => setOpenVer(false)} fullWidth maxWidth="sm">
        <DialogTitle>Detalle del cliente</DialogTitle>
        <DialogContent>
          <Typography><b>Nombre:</b> {form.nombre}</Typography>
          <Typography><b>Documento:</b> {form.documento}</Typography>
          <Typography><b>Teléfono:</b> {form.telefono}</Typography>
          <Typography><b>Dirección:</b> {form.direccion}</Typography>
          <Typography><b>Cupo crédito:</b> {form.cupo_credito}</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVer(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default function Clientes() {
  return <BoxAdmin content={<ClientesGestion />} />;
}
