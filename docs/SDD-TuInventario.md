# SDD — Spec Driven Development · TuInventario

**Proyecto:** TuInventario (SurtiHogar — Sibaté / región Soacha)  
**Documentos fuente:** Actividad 1 y Actividad 2 (Emprendimiento — prácticas universitarias)  
**Última actualización:** 2026-05-13  

Este documento es la **fuente de verdad** para priorizar cambios en el repositorio. Cualquier implementación debe **actualizar este spec** si altera alcance, rutas o contratos.

---

## 1. Propósito y alcance

### 1.1 Problema de negocio (Act 1)

- Negocio **itinerante**, sin punto de venta fijo.
- **Cartera en papel**: ventas a crédito, abonos y saldos con baja trazabilidad y riesgo de pérdida de datos.
- Necesidad de **inventario** y **visibilidad** para decisiones y cuadre.

### 1.2 Objetivo del software

Aplicación web **TuInventario** que digitalice inventario y **ventas a crédito / cartera** para Surtihogar, escalable en el tiempo (visión SaaS / multitenant en documentación).

### 1.3 Alcance actual acordado (fase transitoria)

- **Frontend:** React (SPA), despliegue posible en **Vercel**.
- **Persistencia transitoria:** `localStorage` en el navegador **hasta** despliegue y consumo estable del **backend Laravel + API + BD relacional**.
- **Backend:** existe en repo (`back/tu_inventario`) pero **no es requisito** para validar el spec en modo solo-front.

---

## 2. Stack objetivo (según documentos)

| Capa        | Documentado                         | Estado en repo (2026-05)        |
|------------|--------------------------------------|----------------------------------|
| Frontend   | React, SPA                           | React + Vite + MUI             |
| Integración| Axios → API REST                     | **No** (solo `localStorage`)   |
| Backend    | Laravel, API, auth                 | Laravel presente; front no API |
| BD         | Relacional (MySQL en Act 2)        | Pendiente uso desde front      |
| Despliegue | Vercel (front); servidor/Docker (Act 2) | Vercel típico para front   |

---

## 3. Actores y roles (Act 2)

| Actor            | Documento | Implementación actual |
|------------------|-----------|------------------------|
| Administrador    | Sí        | Login `admin`/`admin` sin roles |
| Cliente deudor   | Mencionado | **No** hay flujo ni pantalla “cliente” |

**Brecha:** no hay **restricción por rol** ni vistas separadas para “cliente deudor”.

---

## 4. Módulos — especificación vs implementación

### 4.1 Autenticación y seguridad (Act 2: JWT, roles)

**Especificado:** tokens JWT, roles Administrador / Cliente, datos sensibles restringidos.

**Implementado:** sesión local (`access_token` = `demo-local`), sin JWT, sin RBAC en UI.

**Criterios de aceptación (cuando haya API):**

- [ ] Login devuelve token firmado (JWT o Sanctum según decisión técnica documentada).
- [ ] Rutas o acciones sensibles exigen token válido.
- [ ] Rol “cliente” solo ve su cartera (definir alcance en sprint).

---

### 4.2 Registro de clientes (Act 1 + Act 2)

**Especificado:** perfiles de cliente para cartera.

**Implementado:** módulo **Clientes** (`/clientes`), CRUD en `localStorage` (`clientes_data`): nombre, documento, teléfono, dirección, cupo.

**Brechas:**

- [ ] No hay **validación** de documento único en el módulo Clientes.
- [x] **Vínculo** con ventas: en **Ventas** se exige seleccionar un cliente del catálogo (`cliente_id`); las filas migradas desde el modelo antiguo pueden mostrar “texto libre” si no tenían id.

**Criterios de aceptación (MVP enriquecido):**

- [x] Crear venta seleccionando cliente existente (`cliente_id`).
- [x] Advertencia informativa (SweetAlert) si deuda estimada del cliente supera el **cupo** registrado (no bloquea el guardado).

---

### 4.3 Ventas a crédito y cartera (Act 2: ventas vinculadas a clientes + abonos)

**Especificado:** “Gestión de Cartera Digital” **vinculada** a perfiles de clientes; **Control de Abonos** con pagos parciales y **recálculo automático** del saldo.

**Implementado (front + `localStorage`):** **Ventas** (`/ventas`) con `cliente_id`, arreglo **`abonos[]`** (`id`, `fecha`, `monto`), saldo = `valor_total − sum(abonos)`; detalle con historial y **Registrar abono**; tarjetas de resumen (cartera pendiente, ventas con saldo, suma de abonos); migración automática desde el modelo legado (`abono` único + `cliente` texto).

**Brechas / mejoras posteriores:**

- [ ] Sin API: no hay `venta_id` en servidor ni concurrencia multi-dispositivo.
- [ ] No hay anulación ni edición de un abono ya registrado (solo nuevos abonos).

**Criterios de aceptación (alineación fuerte con Act 2):**

- [x] Venta con `cliente_id` ligado a `clientes_data`.
- [x] Registros de **abono** (fecha, monto) en lista por venta; saldo derivado.
- [x] UI: detalle con listado de abonos y acción “Registrar abono”.

---

### 4.4 Inventario y existencias (Act 1)

**Especificado:** control de inventario disponible y trazabilidad.

**Implementado:** Vista única **`/inventario`** con pestañas: **Catálogo** (`/inventario?tab=0`, `productos_data`) y **Existencias** (`?tab=1`, `stock_data`). Misma información que antes; **sin** fusión de datos en una sola tabla (sigue siendo dos colecciones en `localStorage`). Resumen de existencias solo en la pestaña Existencias. Redirección desde `/productos` y `/stock`.

**Brechas:**

- [ ] Duplicación conceptual (dos catálogos parecidos).
- [ ] No hay descuento automático de inventario al vender.
- [ ] Act 2 “Debería tener”: alertas de stock bajo → **parcial** (avisos en resumen de existencias, sin notificación push).

---

### 4.5 Reportes (Act 1 “reportes financieros”; Act 2 “reportes PDF” en backlog)

**Especificado:** apoyo a cuadre y decisiones; Act 2 menciona reportes PDF como mejora.

**Implementado:** CRUD manual en `reports_data` (fecha, tipo, descripción, monto, estado) más **panel de gráficas** en la misma vista (`recharts`): montos por tipo (pastel), evolución mensual de montos registrados, cartera pendiente por cliente (lectura de `ventas_credito_data` + `clientes_data` con `ventasFinance.js`), unidades en stock por categoría (`stock_data`). Sin PDF (Act 2 backlog).

**Criterios de aceptación (mínimo útil):**

- [x] Vista resumen con gráficas derivadas de `localStorage` (se refrescan al cambiar registros de reportes, al entrar a `/reportes` y al volver el foco a la ventana).
- [ ] PDF = fase posterior explícita en Act 2.

---

### 4.6 Usuarios (Act 1 “administración de usuarios”)

**Implementado:** CRUD `users_data` con nombre, usuario_login, rol, teléfono, correo.

**Brechas:**

- [ ] El rol **no afecta** la navegación ni permisos.
- [ ] No hay flujo de “alta de cliente como usuario”.

---

### 4.7 No funcional (Act 2)

| RNF / tema        | Documento              | Observación |
|-------------------|------------------------|-------------|
| Mobile-first      | Act 2                  | UI MUI responsive; **no** auditado como “mobile-first” estricto. |
| Navegación 3 clics| Act 2 evaluación       | Revisión heurística pendiente (checklist en QA). |
| Docker / Ubuntu   | Act 2 arquitectura     | Infra; **no** validable solo desde este front. |
| Offline-first     | Act 2 mejora futura    | Fuera de alcance. |

---

## 5. Flujo de usuario (spec actual SPA)

1. `/` — Login (`admin` / `admin`) → guarda sesión demo en `localStorage`.
2. `/home` — Tarjetas a módulos.
3. Módulos con layout **BoxAdmin** (Navbar + Sidebar + contenido).
4. Logout limpia claves y recarga.

**Rutas:** ver `App.jsx` — **`/inventario`** (pestañas `?tab=0` catálogo, `?tab=1` existencias); **`/productos`** y **`/stock`** redirigen allí (compatibilidad). También: `/clientes`, `/ventas`, `/reportes`, `/usuarios`.

---

## 6. Contratos de datos (localStorage) — nombres de claves

| Clave              | Módulo    | Contenido |
|--------------------|-----------|-----------|
| `productos_data`   | Inventario — pestaña Catálogo | array JSON |
| `stock_data`       | Inventario — pestaña Existencias | array JSON |
| `clientes_data`    | Clientes  | array JSON |
| `ventas_credito_data` | Ventas | array JSON: `{ id, cliente_id, descripcion, valor_total, fecha, abonos: [{ id, fecha, monto }], saldo? }` — al cargar, se normaliza desde el legado `{ abono, cliente }` si hace falta |
| `reports_data`     | Reportes  | array JSON |
| `users_data`       | Usuarios  | array JSON |
| `access_token`     | Sesión    | string demo |

Cualquier cambio de forma de objeto debe documentarse aquí y, si aplica, migración en código.

---

## 7. Definition of Done (DoD) — incremento

- [ ] Cumple criterios de aceptación del apartado tocado.
- [ ] No rompe rutas existentes sin actualizar este SDD.
- [ ] `npm run lint` y `npm run build` en `front/` sin errores.
- [ ] Si se conecta API: actualizar sección 2 y contratos; pruebas de integración documentadas.

---

## 8. Backlog explícito (Act 2 “Próximos pasos” + matriz Canva)

- Notificaciones (WhatsApp / correo).
- Exportación PDF (estados de cuenta).
- Analítica / gráficos de flujo de caja.
- Alertas stock bajo.
- Multitenant / SaaS.
- Offline-first (mejora por cobertura en Sibaté).

---

## 9. Mantenimiento del spec

1. Antes de codificar un feature: localizar sección en este archivo o añadir subsección.
2. Al terminar: marcar criterios cumplidos o crear nuevos “Act 3”.
3. Si el tribunal o el docente pide trazabilidad: **diff código ↔ este documento**.

---

*Fin del SDD base. Las siguientes iteraciones deben citar secciones (ej. “§4.3 Abonos”) en commits o PRs cuando sea posible.*
