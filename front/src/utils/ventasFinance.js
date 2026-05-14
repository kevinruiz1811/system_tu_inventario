/** Utilidades compartidas para ventas a crédito. */

export function sumAbonos(abonos) {
  if (!Array.isArray(abonos)) return 0;
  return abonos.reduce((s, a) => s + (Number(a.monto) || 0), 0);
}

export function getSaldo(venta) {
  const total = Number(venta.valor_total) || 0;
  return Math.max(0, total - sumAbonos(venta.abonos));
}

export function normalizeVenta(v) {
  const total = Number(v.valor_total) || 0;
  if (Array.isArray(v.abonos)) {
    const abonos = v.abonos.map((a, idx) => ({
      id: a.id ?? `${v.id}-ab${idx}`,
      fecha: a.fecha || "",
      monto: Number(a.monto) || 0,
    }));
    return {
      id: v.id,
      cliente_id: v.cliente_id != null && v.cliente_id !== "" ? v.cliente_id : null,
      cliente: v.cliente ?? "",
      descripcion: v.descripcion ?? "",
      valor_total: v.valor_total,
      fecha: v.fecha ?? "",
      abonos,
      saldo: getSaldo({ ...v, abonos }),
    };
  }
  const monto = Number(v.abono) || 0;
  const abonos =
    monto > 0
      ? [{ id: `${v.id}-legacy`, fecha: v.fecha || "", monto }]
      : [];
  return {
    id: v.id,
    cliente_id: v.cliente_id != null && v.cliente_id !== "" ? v.cliente_id : null,
    cliente: v.cliente ?? "",
    descripcion: v.descripcion ?? "",
    valor_total: v.valor_total,
    fecha: v.fecha ?? "",
    abonos,
    saldo: Math.max(0, total - monto),
  };
}

export function resolveClienteNombre(venta, clientes) {
  if (venta.cliente_id != null && venta.cliente_id !== "") {
    const c = clientes.find((x) => String(x.id) === String(venta.cliente_id));
    if (c) return `${c.nombre} · ${c.documento}`;
  }
  if (venta.cliente) return venta.cliente;
  return "—";
}

export function formatMoney(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  });
}
