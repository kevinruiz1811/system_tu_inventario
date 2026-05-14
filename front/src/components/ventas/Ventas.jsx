import React, { useState, useEffect, useMemo } from "react";
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Stack,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import AddCardIcon from "@mui/icons-material/AddCard";
import { Link, useLocation } from "react-router-dom";
import BoxAdmin from "../BoxAdmin/BoxAdmin";
import Swal from "sweetalert2";
import {
  sumAbonos,
  getSaldo,
  normalizeVenta,
  resolveClienteNombre,
  formatMoney,
} from "../../utils/ventasFinance";

const VENTAS_KEY = "ventas_credito_data";
const CLIENTES_KEY = "clientes_data";

const defaultCreate = {
  cliente_id: "",
  descripcion: "",
  valor_total: "",
  abono_inicial: "",
  fecha: "",
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function deudaOtrosCredito(clienteId, ventas, excludeId) {
  if (clienteId == null || clienteId === "") return 0;
  return ventas
    .filter((v) => String(v.cliente_id) === String(clienteId) && v.id !== excludeId)
    .reduce((s, v) => s + getSaldo(v), 0);
}

const VentasGestion = () => {
  const location = useLocation();
  const [items, setItems] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openVer, setOpenVer] = useState(false);
  const [openAbono, setOpenAbono] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [createForm, setCreateForm] = useState(defaultCreate);
  const [editForm, setEditForm] = useState(null);
  const [viewVenta, setViewVenta] = useState(null);
  const [abonoForm, setAbonoForm] = useState({ fecha: todayISO(), monto: "" });

  useEffect(() => {
    const stored = localStorage.getItem(VENTAS_KEY);
    if (!stored) {
      setLoading(false);
      return;
    }
    try {
      let data = JSON.parse(stored);
      if (!Array.isArray(data)) data = [];
      const needsMigrate = data.some((v) => !Array.isArray(v.abonos));
      const normalized = data.map(normalizeVenta);
      setItems(normalized);
      if (needsMigrate) {
        localStorage.setItem(VENTAS_KEY, JSON.stringify(normalized));
      }
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    try {
      const c = localStorage.getItem(CLIENTES_KEY);
      setClientes(c ? JSON.parse(c) : []);
    } catch {
      setClientes([]);
    }
  }, [location.pathname]);

  useEffect(() => {
    localStorage.setItem(VENTAS_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    const q = searchTerm.toLowerCase();
    setFiltered(
      items.filter((v) => {
        const nombre = resolveClienteNombre(v, clientes).toLowerCase();
        return (
          nombre.includes(q) ||
          String(v.descripcion).toLowerCase().includes(q) ||
          String(v.fecha).toLowerCase().includes(q)
        );
      }),
    );
    setPage(0);
  }, [searchTerm, items, clientes]);

  const resumen = useMemo(() => {
    const cartera = items.reduce((s, v) => s + getSaldo(v), 0);
    const conSaldo = items.filter((v) => getSaldo(v) > 0).length;
    const totalAbonado = items.reduce((s, v) => s + sumAbonos(v.abonos), 0);
    return { cartera, conSaldo, totalAbonado };
  }, [items]);

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(+e.target.value);
    setPage(0);
  };
  const handleFirst = () => setPage(0);
  const handleLast = () =>
    setPage(Math.max(0, Math.ceil(filtered.length / rowsPerPage) - 1));

  const validateCreate = () => {
    const abonoIni = createForm.abono_inicial === "" ? 0 : Number(createForm.abono_inicial);
    if (
      !createForm.cliente_id ||
      !createForm.descripcion ||
      createForm.valor_total === "" ||
      !createForm.fecha
    ) {
      Swal.fire({
        icon: "warning",
        title: "Campos incompletos",
        text: "Selecciona un cliente registrado, descripción, valor total y fecha.",
      });
      return false;
    }
    const total = Number(createForm.valor_total);
    if (Number.isNaN(total) || total <= 0) {
      Swal.fire({ icon: "warning", title: "Valor total inválido" });
      return false;
    }
    if (abonoIni < 0 || abonoIni > total) {
      Swal.fire({
        icon: "warning",
        title: "Abono inicial inválido",
        text: "Debe estar entre 0 y el valor total.",
      });
      return false;
    }
    return true;
  };

  const warnCupo = (clienteId, nuevoTotal, abonoIni, excludeId) => {
    const c = clientes.find((x) => String(x.id) === String(clienteId));
    if (!c) return;
    const cupo = Number(c.cupo_credito);
    if (Number.isNaN(cupo)) return;
    const saldoNueva = Number(nuevoTotal) - abonoIni;
    const otra = deudaOtrosCredito(clienteId, items, excludeId);
    if (otra + saldoNueva > cupo) {
      Swal.fire({
        icon: "info",
        title: "Atención: cupo de crédito",
        html: `La deuda total estimada del cliente (<b>${formatMoney(otra + saldoNueva)}</b>) supera su cupo registrado (<b>${formatMoney(cupo)}</b>). Puedes continuar, pero conviene revisar el dato en <b>Clientes</b>.`,
      });
    }
  };

  const handleAdd = () => {
    if (!validateCreate()) return;
    const total = Number(createForm.valor_total);
    const abonoIni = createForm.abono_inicial === "" ? 0 : Number(createForm.abono_inicial);
    warnCupo(createForm.cliente_id, total, abonoIni, null);
    const abonos =
      abonoIni > 0
        ? [{ id: Date.now(), fecha: createForm.fecha, monto: abonoIni }]
        : [];
    const row = normalizeVenta({
      id: Date.now(),
      cliente_id: createForm.cliente_id,
      descripcion: createForm.descripcion,
      valor_total: createForm.valor_total,
      fecha: createForm.fecha,
      abonos,
    });
    setItems([row, ...items]);
    setOpenCreate(false);
    setCreateForm(defaultCreate);
  };

  const validateEdit = () => {
    if (!editForm) return false;
    const pagado = sumAbonos(editForm.abonos);
    const total = Number(editForm.valor_total);
    if (!editForm.cliente_id || !editForm.descripcion || !editForm.fecha) {
      Swal.fire({ icon: "warning", title: "Completa cliente, descripción y fecha." });
      return false;
    }
    if (Number.isNaN(total) || total <= 0) {
      Swal.fire({ icon: "warning", title: "Valor total inválido" });
      return false;
    }
    if (total + 1e-9 < pagado) {
      Swal.fire({
        icon: "warning",
        title: "Valor total insuficiente",
        text: `Ya hay abonos por ${formatMoney(pagado)}; el total no puede ser menor.`,
      });
      return false;
    }
    return true;
  };

  const handleEditSave = () => {
    if (!validateEdit() || !editForm) return;
    const total = Number(editForm.valor_total);
    const abonoIni = 0;
    warnCupo(editForm.cliente_id, total, abonoIni, editForm.id);
    const updated = normalizeVenta({
      ...editForm,
      abonos: editForm.abonos,
    });
    setItems(items.map((v) => (v.id === updated.id ? updated : v)));
    setOpenEdit(false);
    setEditForm(null);
  };

  const openDetalle = (v) => {
    setViewVenta({ ...v, abonos: [...(v.abonos || [])] });
    setOpenVer(true);
  };

  const handleRegistrarAbono = () => {
    const monto = Number(abonoForm.monto);
    if (!abonoForm.fecha || !viewVenta) {
      Swal.fire({ icon: "warning", title: "Indica fecha y monto del abono." });
      return;
    }
    if (Number.isNaN(monto) || monto <= 0) {
      Swal.fire({ icon: "warning", title: "Monto inválido" });
      return;
    }
    const actual = items.find((i) => i.id === viewVenta.id);
    if (!actual) return;
    const saldoActual = getSaldo(actual);
    if (monto > saldoActual + 0.0001) {
      Swal.fire({
        icon: "warning",
        title: "Abono demasiado alto",
        text: `El saldo pendiente es ${formatMoney(saldoActual)}.`,
      });
      return;
    }
    const nuevo = {
      ...actual,
      abonos: [...(actual.abonos || []), { id: Date.now(), fecha: abonoForm.fecha, monto }],
    };
    const norm = normalizeVenta(nuevo);
    setItems(items.map((i) => (i.id === norm.id ? norm : i)));
    setViewVenta(norm);
    setOpenAbono(false);
    setAbonoForm({ fecha: todayISO(), monto: "" });
    Swal.fire({
      icon: "success",
      title: "Abono registrado",
      toast: true,
      position: "top-end",
      timer: 2200,
      showConfirmButton: false,
    });
  };

  const abonosOrdenados = (abonos) =>
    [...(abonos || [])].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));

  return (
    <Box p={{ xs: 2, sm: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Cartera pendiente
          </Typography>
          <Typography variant="h6">{formatMoney(resumen.cartera)}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Ventas con saldo &gt; 0
          </Typography>
          <Typography variant="h6">{resumen.conSaldo}</Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Suma histórica de abonos
          </Typography>
          <Typography variant="h6">{formatMoney(resumen.totalAbonado)}</Typography>
        </Paper>
      </Stack>

      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        flexWrap="wrap"
        gap={2}
      >
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddCardIcon />}
          onClick={() => {
            try {
              const c = localStorage.getItem(CLIENTES_KEY);
              setClientes(c ? JSON.parse(c) : []);
            } catch {
              setClientes([]);
            }
            setCreateForm({ ...defaultCreate, fecha: todayISO() });
            setOpenCreate(true);
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
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>

      {clientes.length === 0 && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Aún no hay clientes en el catálogo.{" "}
          <Link to="/clientes">Registra al menos un cliente</Link> para vincular ventas y
          validar cupos.
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Cliente</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="right">Abonado</TableCell>
              <TableCell align="right">Saldo</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={8}>
                      <Skeleton />
                    </TableCell>
                  </TableRow>
                ))
              : filtered
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((v) => {
                    const saldo = getSaldo(v);
                    const pagado = sumAbonos(v.abonos);
                    return (
                      <TableRow key={v.id} hover>
                        <TableCell>{resolveClienteNombre(v, clientes)}</TableCell>
                        <TableCell>{v.descripcion}</TableCell>
                        <TableCell align="right">{formatMoney(v.valor_total)}</TableCell>
                        <TableCell align="right">{formatMoney(pagado)}</TableCell>
                        <TableCell align="right">{formatMoney(saldo)}</TableCell>
                        <TableCell>
                          {saldo <= 0 ? (
                            <Chip size="small" label="Pagada" color="success" variant="outlined" />
                          ) : (
                            <Chip size="small" label="Pendiente" color="warning" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>{v.fecha}</TableCell>
                        <TableCell align="right">
                          <IconButton color="primary" onClick={() => openDetalle(v)} aria-label="ver">
                            <VisibilityIcon />
                          </IconButton>
                          <IconButton
                            color="secondary"
                            onClick={() => {
                              setEditForm({
                                id: v.id,
                                cliente_id: v.cliente_id != null ? String(v.cliente_id) : "",
                                descripcion: v.descripcion,
                                valor_total: v.valor_total,
                                fecha: v.fecha,
                                abonos: [...(v.abonos || [])],
                              });
                              setOpenEdit(true);
                            }}
                            aria-label="editar"
                          >
                            <EditIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Nueva venta a crédito</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense" required>
            <InputLabel id="cli-venta">Cliente</InputLabel>
            <Select
              labelId="cli-venta"
              label="Cliente"
              value={createForm.cliente_id}
              onChange={(e) =>
                setCreateForm({ ...createForm, cliente_id: e.target.value })
              }
            >
              <MenuItem value="">
                <em>Seleccione un cliente</em>
              </MenuItem>
              {clientes.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.nombre} — {c.documento}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            margin="dense"
            label="Descripción (productos / servicio)"
            fullWidth
            multiline
            minRows={2}
            value={createForm.descripcion}
            onChange={(e) => setCreateForm({ ...createForm, descripcion: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Valor total"
            type="number"
            fullWidth
            value={createForm.valor_total}
            onChange={(e) => setCreateForm({ ...createForm, valor_total: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Abono inicial (opcional)"
            type="number"
            fullWidth
            helperText="Puedes dejarlo en 0 y registrar abonos después desde el detalle."
            value={createForm.abono_inicial}
            onChange={(e) =>
              setCreateForm({ ...createForm, abono_inicial: e.target.value })
            }
          />
          <TextField
            margin="dense"
            label="Fecha de la venta"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={createForm.fecha}
            onChange={(e) => setCreateForm({ ...createForm, fecha: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancelar</Button>
          <Button onClick={handleAdd} variant="contained" disabled={clientes.length === 0}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="sm">
        <DialogTitle>Editar venta</DialogTitle>
        <DialogContent>
          {editForm && (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel id="cli-edit">Cliente</InputLabel>
                <Select
                  labelId="cli-edit"
                  label="Cliente"
                  value={editForm.cliente_id}
                  onChange={(e) =>
                    setEditForm({ ...editForm, cliente_id: e.target.value })
                  }
                >
                  {clientes.map((c) => (
                    <MenuItem key={c.id} value={String(c.id)}>
                      {c.nombre} — {c.documento}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                margin="dense"
                label="Descripción"
                fullWidth
                multiline
                minRows={2}
                value={editForm.descripcion}
                onChange={(e) =>
                  setEditForm({ ...editForm, descripcion: e.target.value })
                }
              />
              <TextField
                margin="dense"
                label="Valor total"
                type="number"
                fullWidth
                value={editForm.valor_total}
                onChange={(e) =>
                  setEditForm({ ...editForm, valor_total: e.target.value })
                }
              />
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Abonos registrados: {formatMoney(sumAbonos(editForm.abonos))} — edítalos desde
                &quot;Ver&quot; (nuevos abonos o historial).
              </Typography>
              <TextField
                margin="dense"
                label="Fecha"
                type="date"
                fullWidth
                InputLabelProps={{ shrink: true }}
                value={editForm.fecha}
                onChange={(e) => setEditForm({ ...editForm, fecha: e.target.value })}
              />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancelar</Button>
          <Button onClick={handleEditSave} variant="contained">
            Guardar cambios
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openVer} onClose={() => setOpenVer(false)} fullWidth maxWidth="sm">
        <DialogTitle>Detalle y abonos</DialogTitle>
        <DialogContent>
          {viewVenta && (
            <>
              <Typography variant="subtitle2" gutterBottom>
                {resolveClienteNombre(viewVenta, clientes)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                <b>Concepto:</b> {viewVenta.descripcion}
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <b>Total:</b> {formatMoney(viewVenta.valor_total)}
                </Typography>
                <Typography variant="body2">
                  <b>Abonado:</b> {formatMoney(sumAbonos(viewVenta.abonos))}
                </Typography>
                <Typography variant="body2" color={getSaldo(viewVenta) > 0 ? "warning.main" : "success.main"}>
                  <b>Saldo:</b> {formatMoney(getSaldo(viewVenta))}
                </Typography>
                <Typography variant="body2">
                  <b>Fecha venta:</b> {viewVenta.fecha}
                </Typography>
              </Stack>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom>
                Historial de abonos
              </Typography>
              {abonosOrdenados(viewVenta.abonos).length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  Sin abonos aún.
                </Typography>
              ) : (
                <List dense disablePadding>
                  {abonosOrdenados(viewVenta.abonos).map((a) => (
                    <ListItem key={a.id} disableGutters>
                      <ListItemText
                        primary={formatMoney(a.monto)}
                        secondary={a.fecha || "—"}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
              <Box mt={2}>
                <Button
                  variant="outlined"
                  disabled={getSaldo(viewVenta) <= 0}
                  onClick={() => {
                    setAbonoForm({ fecha: todayISO(), monto: "" });
                    setOpenAbono(true);
                  }}
                >
                  Registrar abono
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenVer(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openAbono} onClose={() => setOpenAbono(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Nuevo abono</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Fecha del abono"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={abonoForm.fecha}
            onChange={(e) => setAbonoForm({ ...abonoForm, fecha: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Monto"
            type="number"
            fullWidth
            value={abonoForm.monto}
            onChange={(e) => setAbonoForm({ ...abonoForm, monto: e.target.value })}
            helperText={
              viewVenta
                ? `Saldo actual: ${formatMoney(getSaldo(items.find((i) => i.id === viewVenta.id) || viewVenta))}`
                : ""
            }
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAbono(false)}>Cancelar</Button>
          <Button variant="contained" onClick={handleRegistrarAbono}>
            Registrar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default function Ventas() {
  return <BoxAdmin content={<VentasGestion />} />;
}
