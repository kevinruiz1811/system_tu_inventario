import React, { useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  Stack,
  Chip,
  Alert,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import ListAltIcon from "@mui/icons-material/ListAlt";

const UMBRAL_BAJO = 5;

export default function ExistenciasResumen({ stockList }) {
  const stock = Array.isArray(stockList) ? stockList : [];

  const m = useMemo(() => {
    const totalUnidades = stock.reduce(
      (s, r) => s + (Number(r.cantidad) || 0),
      0,
    );
    const bajo = stock.filter((r) => {
      const q = Number(r.cantidad) || 0;
      return q > 0 && q <= UMBRAL_BAJO;
    }).length;
    const agotados = stock.filter((r) => (Number(r.cantidad) || 0) === 0).length;
    const categorias = new Set(
      stock.map((r) => (r.categoria || "").trim()).filter(Boolean),
    ).size;
    return {
      refs: stock.length,
      totalUnidades,
      bajo,
      agotados,
      categorias,
    };
  }, [stock]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 3,
        borderLeft: "4px solid #0d6efd",
        backgroundColor: "action.hover",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
        sx={{ mb: 1.5 }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <ListAltIcon color="primary" fontSize="small" />
          <Typography variant="subtitle1" fontWeight={600}>
            Resumen de existencias
          </Typography>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ typography: "caption" }}>
          <RouterLink to="/reportes" style={{ color: "inherit" }}>
            Reportes
          </RouterLink>
          <RouterLink to="/inventario?tab=0" style={{ color: "inherit" }}>
            Catálogo
          </RouterLink>
        </Stack>
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={1} useFlexGap>
        <Chip
          size="small"
          color="primary"
          variant="outlined"
          label={`${m.refs} referencias`}
        />
        <Chip
          size="small"
          variant="outlined"
          label={`${m.totalUnidades.toLocaleString("es-CO")} uds. totales`}
        />
        <Chip
          size="small"
          variant="outlined"
          label={`${m.categorias} categorías`}
        />
        {m.bajo > 0 && (
          <Chip
            size="small"
            color="warning"
            label={`${m.bajo} con ≤ ${UMBRAL_BAJO} uds.`}
          />
        )}
        {m.agotados > 0 && (
          <Chip size="small" color="error" label={`${m.agotados} en 0 uds.`} />
        )}
      </Stack>
      {m.refs === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          No hay registros. Use «Registrar movimiento» para agregar.
        </Alert>
      )}
      {(m.bajo > 0 || m.agotados > 0) && m.refs > 0 && (
        <Box sx={{ mt: 1.5 }}>
          <Alert severity={m.agotados > 0 ? "warning" : "info"} variant="outlined">
            {m.agotados > 0 && <>Hay ítems con existencia en cero.</>}
            {m.agotados === 0 && m.bajo > 0 && (
              <>Existencia baja en uno o más ítems (≤ {UMBRAL_BAJO} uds.).</>
            )}
          </Alert>
        </Box>
      )}
    </Paper>
  );
}
