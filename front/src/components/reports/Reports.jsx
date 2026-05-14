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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import FirstPageIcon from "@mui/icons-material/FirstPage";
import LastPageIcon from "@mui/icons-material/LastPage";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import BoxAdmin from "../BoxAdmin/BoxAdmin";
import { useLocation } from "react-router-dom";
import {
  getSaldo,
  normalizeVenta,
  resolveClienteNombre,
  formatMoney,
} from "../../utils/ventasFinance";

const LOCAL_STORAGE_KEY = "reports_data";
const VENTAS_KEY = "ventas_credito_data";
const CLIENTES_KEY = "clientes_data";
const STOCK_KEY = "stock_data";

const CHART_COLORS = [
  "#1976d2",
  "#2e7d32",
  "#ed6c02",
  "#9c27b0",
  "#d32f2f",
  "#0288d1",
  "#6a1b9a",
  "#00796b",
  "#c62828",
  "#5d4037",
];

const defaultReport = {
  id: null,
  fecha: "",
  tipo_registro: "",
  descripcion: "",
  monto: "",
  estado: "",
};

function parseMonthKey(fecha) {
  if (!fecha || typeof fecha !== "string") return null;
  const p = fecha.slice(0, 7);
  if (p.length < 7 || !/^\d{4}-\d{2}$/.test(p)) return null;
  return p;
}

function buildChartSeries(reports, ventasNorm, clientes) {
  const tipoAcc = {};
  for (const r of reports) {
    const raw = (r.tipo_registro || "").trim();
    const label = raw || "Sin tipo";
    const key = label.toLowerCase();
    const m = Number(r.monto) || 0;
    if (!tipoAcc[key]) tipoAcc[key] = { name: label, value: 0 };
    tipoAcc[key].value += m;
  }
  const porTipo = Object.values(tipoAcc).filter((x) => x.value > 0);

  const mesAcc = {};
  for (const r of reports) {
    const mes = parseMonthKey(r.fecha);
    if (!mes) continue;
    mesAcc[mes] = (mesAcc[mes] || 0) + (Number(r.monto) || 0);
  }
  const porMes = Object.entries(mesAcc)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([mes, total]) => ({ mes, total }));

  const saldoCliente = {};
  for (const v of ventasNorm) {
    const saldo = getSaldo(v);
    if (saldo <= 0) continue;
    const label = resolveClienteNombre(v, clientes);
    saldoCliente[label] = (saldoCliente[label] || 0) + saldo;
  }
  const carteraCliente = Object.entries(saldoCliente)
    .map(([nombre, saldo]) => ({ nombre, saldo }))
    .sort((a, b) => b.saldo - a.saldo)
    .slice(0, 10);

  let stockRows = [];
  try {
    const raw = localStorage.getItem(STOCK_KEY);
    stockRows = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(stockRows)) stockRows = [];
  } catch {
    stockRows = [];
  }
  const catAcc = {};
  for (const row of stockRows) {
    const cat = (row.categoria || "").trim() || "Sin categoría";
    catAcc[cat] = (catAcc[cat] || 0) + (Number(row.cantidad) || 0);
  }
  const stockCategoria = Object.entries(catAcc)
    .map(([categoria, unidades]) => ({ categoria, unidades }))
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 12);

  return { porTipo, porMes, carteraCliente, stockCategoria };
}

function ReportsCharts({ series }) {
  const { porTipo, porMes, carteraCliente, stockCategoria } = series;

  const tickMoney = (v) => {
    if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
    if (v >= 1_000) return `${(v / 1_000).toFixed(0)}k`;
    return String(v);
  };

  const TooltipMonto = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const row = payload[0].payload;
    const val = row.value ?? row.total ?? row.saldo ?? row.unidades;
    const isUnits = row.unidades != null && payload[0].dataKey === "unidades";
    return (
      <Paper elevation={3} sx={{ px: 1.5, py: 1 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          {label ?? row.name ?? row.mes ?? row.nombre ?? row.categoria}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {isUnits ? `${val} uds.` : formatMoney(val)}
        </Typography>
      </Paper>
    );
  };

  const chartBox = (title, subtitle, minH, children) => (
    <Paper sx={{ p: 2, height: "100%" }} elevation={1}>
      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
        {title}
      </Typography>
      {subtitle ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
          {subtitle}
        </Typography>
      ) : null}
      <Box sx={{ width: "100%", height: minH }}>{children}</Box>
    </Paper>
  );

  const emptyMsg = (msg) => (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      height="100%"
      minHeight={220}
    >
      <Typography variant="body2" color="text.secondary" align="center" px={2}>
        {msg}
      </Typography>
    </Box>
  );

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Gráficas
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {chartBox(
          "Montos por tipo de movimiento",
          null,
          280,
          porTipo.length === 0 ? (
            emptyMsg("Sin datos.")
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={porTipo}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) =>
                    `${name} (${(percent * 100).toFixed(0)}%)`
                  }
                >
                  {porTipo.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<TooltipMonto />} />
              </PieChart>
            </ResponsiveContainer>
          ),
        )}

        {chartBox(
          "Evolución mensual",
          null,
          300,
          porMes.length === 0 ? (
            emptyMsg("Sin datos.")
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porMes} margin={{ top: 8, right: 8, left: 0, bottom: 32 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="mes" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={60} />
                <YAxis tickFormatter={tickMoney} width={48} tick={{ fontSize: 11 }} />
                <Tooltip content={<TooltipMonto />} />
                <Bar dataKey="total" name="Total mes" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ),
        )}

        {chartBox(
          "Cartera pendiente por cliente",
          null,
          320,
          carteraCliente.length === 0 ? (
            emptyMsg("Sin datos.")
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={carteraCliente}
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" tickFormatter={tickMoney} tick={{ fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="nombre"
                  width={130}
                  tick={{ fontSize: 10 }}
                  interval={0}
                />
                <Tooltip content={<TooltipMonto />} />
                <Bar dataKey="saldo" name="Saldo" fill="#ed6c02" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          ),
        )}

        {chartBox(
          "Unidades por categoría (existencias)",
          null,
          300,
          stockCategoria.length === 0 ? (
            emptyMsg("Sin datos.")
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockCategoria} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="categoria"
                  tick={{ fontSize: 10 }}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
                  height={70}
                />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<TooltipMonto />} />
                <Bar dataKey="unidades" name="Unidades" fill="#2e7d32" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ),
        )}
      </Box>
    </Box>
  );
}

const ReportsGestion = () => {
  const location = useLocation();
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
  const [chartTick, setChartTick] = useState(0);

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
    const bump = () => setChartTick((n) => n + 1);
    window.addEventListener("focus", bump);
    return () => window.removeEventListener("focus", bump);
  }, []);

  useEffect(() => {
    if (location.pathname.includes("reportes")) {
      setChartTick((n) => n + 1);
    }
  }, [location.pathname]);

  const chartSeries = useMemo(() => {
    let ventas = [];
    let clientes = [];
    try {
      const vRaw = localStorage.getItem(VENTAS_KEY);
      ventas = vRaw ? JSON.parse(vRaw) : [];
      if (!Array.isArray(ventas)) ventas = [];
      ventas = ventas.map(normalizeVenta);
    } catch {
      ventas = [];
    }
    try {
      const cRaw = localStorage.getItem(CLIENTES_KEY);
      clientes = cRaw ? JSON.parse(cRaw) : [];
      if (!Array.isArray(clientes)) clientes = [];
    } catch {
      clientes = [];
    }
    return buildChartSeries(reports, ventas, clientes);
  }, [reports, chartTick]);

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
    <Box p={{ xs: 2, sm: 4 }}>
      <ReportsCharts series={chartSeries} />

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
          Registros detallados
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
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Fecha</TableCell>
              <TableCell>Tipo</TableCell>
              <TableCell>Descripción</TableCell>
              <TableCell align="right">Monto</TableCell>
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
                    <TableRow key={item.id} hover>
                      <TableCell>{item.fecha}</TableCell>
                      <TableCell>{item.tipo_registro}</TableCell>
                      <TableCell>{item.descripcion}</TableCell>
                      <TableCell align="right">
                        {formatMoney(item.monto)}
                      </TableCell>
                      <TableCell>{item.estado}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          color="primary"
                          onClick={() => handleOpenVer(item.id)}
                          aria-label="ver"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton
                          color="secondary"
                          onClick={() => handleOpenEditar(item.id)}
                          aria-label="editar"
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
            <b>Monto:</b> {formatMoney(formReport.monto)}
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
