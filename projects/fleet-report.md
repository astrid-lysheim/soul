# Central Leasing Fleet — Full Platform Report

**URL:** `https://fleet.centralleasing.mx`
**Account:** José Esparza Rangel (`jesparza@centralleasing.mx`)
**Stack:** Laravel (PHP) + jQuery + Bootstrap | Apache/Debian | Session-based auth
**Explored:** February 20, 2026

---

## 📊 Dashboard (`/index`)

The main dashboard shows fleet-wide KPIs at a glance:

| Metric | Value |
|--------|-------|
| Active Assets | 1,611 |
| Services Operated | 6,181 |
| Total Service Spend | $35.2M MXN |
| Savings on Services | $804K (2%) |
| Savings on Assets | $3.7M (14.07%) |
| Average Fleet Age | 1.2 years |
| Vehicles Without Maintenance | 624 |
| Tires Changed | 1,056 |
| Open Claims/Fines/Taxes | 0 |

**Charts include:**
- Asset Status distribution
- Asset Type breakdown
- Service Type costs
- Mechanical Family costs
- Client/Provider operated costs
- Deliveries tracking
- Credit Providers distribution
- User Satisfaction ratings
- Top 10 vehicles with most incidents (highest: DG542P2 at $389K)

---

## 🔧 1. Servicios (Services)

### 1.1 Nuevo (`/servicios/create`)
- **Purpose:** Create a new service order
- **Flow:** Search for vehicle by Placas (plates) or Serie (VIN last 6 digits), then fill service details
- Vehicle lookup is the first step — the form only loads after a valid vehicle is found

### 1.2 Listado (`/orden-compra`)
- **Purpose:** List all Purchase Orders (Órdenes de Compra / Agreements)
- **Volume:** 124 pages of records (Agreement numbers like 006293, 006292...)
- **Search by:** Agreement number, Núm. Serie, Placas
- **Actions per record:** View (👁), Edit (✏️), Delete (🗑) — colored icon buttons

### 1.3 Historial (`/orden-compra_historial`)
- **Purpose:** Look up full service history for a specific vehicle
- **Search by:** Placas or Serie (last 6 digits)
- Historical view — no bulk listing, must search per vehicle

### 1.4 Tickets (`/tickets`)
- **Purpose:** Service ticket management (the core workflow hub)
- **Volume:** 1,859 tickets across 38 pages (most recent: Feb 20, 2026)
- **Ticket columns:** Núm. Ticket, Fecha/hora, Cliente, Usuario, Teléfono, Correo, Tipo Servicio, Acciones
- **Service types seen:**
  - Mantenimiento preventivo (most common)
  - Revisión/reparación
  - Reporte de siniestro
- **Actions per ticket:**
  - "Detalles" — view ticket details
  - "Levantar Servicio" — create a service order from this ticket (links to `/servicios/create?serie=...&ticket_id=...`)
  - "Servicio" — view linked service (appears when a service has been created)
- **Search filters:** Date range, Cliente, Usuario, Placas, Núm. Serie, Núm. Ticket, Tipo Servicio, Tipo Siniestro/Gestoría, Estado, Aseguradora, Póliza
- **Export:** Excel download available
- **Key clients visible:** GOBIERNO DEL ESTADO DE MEXICO (dominant), MUNICIPIO DE HERMOSILLO, INGENIO TALA, BOMBAS GRUNDFOS, TOTAL BOX

---

## 📦 2. Compra & Entrega (Purchase & Delivery)

### 2.1 Nuevo (`/compra-entrega/create`)
- Create new purchase/delivery orders

### 2.2 Listado (`/compra-entrega`)
- **Volume:** 52 pages of folio records (numbered 26003048–26003070+)
- **Search by:** Folio, Cliente, Núm. Serie, Estatus, Tipo de Producto, Fecha range
- **Export:** "Bitácora" (logbook) download

### 2.3 Chat-Off-Line (`/chat-off-line-admin`)
- **Purpose:** Offline communication tracker for Compra & Entrega
- Same search interface as Incidencias (Folio Compra, Cliente, Núm. Serie, Estatus)
- Only 1 record visible (Folio 1500)
- **Export:** Excel available

### 2.4 Incidencias (`/incidencias`)
- **Purpose:** Track delivery incidents
- **Columns:** Folio/Compra, Cliente, No. Serie, Estatus, Fecha, Acción
- 1 record: Folio 1500 — CLEAR LEASING, VIN LFBGE3066PJK04673, Status: "Atendido" (Resolved), dated 01/03/2024
- **Export:** Excel available

---

## 📈 3. Reportes (Reports)

Has a "1" badge (likely 1 pending/new report).

### 3.1 Clientes (`#`)
- Client listing (URL is `#` — might require selection first)

### 3.2 Proveedores (`/proveedores`)
- **Purpose:** Supplier/vendor management
- **Volume:** 6 pages of providers (IDs: 207, 103, 155, 184, etc.)
- **Search by:** Nombre, Estatus, Marca, Tipo, Estado
- **Export:** Excel available

### 3.3 Códigos de Reparación (`#`)
- Repair codes reference (URL is `#` — similar to Clientes)

### 3.4 Inventario (`/reporte/inventario`)
- **Purpose:** Fleet inventory report
- **Filters:** Client-specific
- **Action:** "Descargar Inventario" — full inventory download

### 3.5 Historial Servicios (`/servicios_historial`)
- **Purpose:** Detailed service history with financial data
- **Default view:** Today's date (auto-populated)
- **Columns:** Núm. Ticket, Agreement, Folio de Proveedor, Proveedor, Cliente, Serie Vehículo, No. Contrato, Reparación, Total, Fecha
- **Data observed:** Mostly NR FINANCE MEXICO S.A. DE C.V. as provider, GOBIERNO DEL ESTADO DE MEXICO as client
- **Repair types:** 10000KM/20000KM/30000KM Servicio, FILTRO DE AIRE, CAMBIAR FILTRO DE A/C, REPARAR NEUMATICO
- **Price range:** $189 (tire repair) to $2,655.15 (20000KM service)
- **Export:** Excel available

### 3.6 Inventario de Pólizas (`/seguros_historial`)
- Insurance policy inventory

### 3.7 Clientes-CentroCostos (`#`)
- Client cost center mapping

### 3.8 Reporte Mensual Dependencia (`/reporte/entregable_mensual`)
- Monthly government dependency report

### 3.9 Reporte Entregas (`/reporte/entregas`)
- Delivery report

---

## 🧾 4. Facturas (Invoices) (`/facturas`)

- **Purpose:** Purchase invoice management
- **Columns:** ADM Flota, Tipo Fac, Placas, Serie, Número OC, Fecha OC, Importe OC, Núm Factura, Importe Fac, Fecha Registro, Días, DIF, Fecha Pago, Estatus, Acciones
- **Current view:** "No hay información" (empty when not filtered)
- Search by: Proveedor, Tipo Factura, Estatus, Núm. Factura, Placas, Núm. Serie

---

## 👥 5. ATC (Atención a Clientes)

### 5.1 Encuesta Satisfacción (`/atencion-clientes`)
- **Purpose:** Customer satisfaction survey dashboard
- **Date range:** Filterable (default: Feb 1–20, 2026)
- **9 survey questions with pie/donut charts:**
  1. Did CL send maintenance confirmation within 24h? → 93.3% Sí
  2. Fleet admin service follow-up quality? → 53.3% Excelente, 43.3% Bueno
  3. Vehicle delivered on notified day/time? → 96.7% Sí
  4. Any problems with vehicle release? → 100% No problems
  5. Delivery turnaround time? → 86.7% Same day, 10% 1-2 days
  6. Maintenance quality (trato, atención, rapidez)? → 60% Excelente, 36.7% Bueno
  7. Overall CL service quality? → 56.7% Excelente, 40% Bueno
  8. Would recommend CL? → 96.7% Sí
  9. Additional comments table (with actual client feedback)

---

## ⚖️ 6. Gestorías

### 6.1 Tenencias
- Vehicle tax management (sub-button, no direct URL captured)

### 6.2 Multas
- Traffic fine management (sub-button, no direct URL captured)

---

## 🛡️ 7. Seguros (Insurance) (`/seguros`)

### 7.1 Administración de Pólizas (`/seguros`)
- **Purpose:** Insurance policy administration
- **Volume:** 52 pages of records
- **Columns:** Folio, Cliente, Serie Vehículo, Aseguradora, Póliza, F Inicio, F Fin, Acciones
- **Clients seen:** ML&S MEXICO, FORWARD CEMENT CO, OPERADORA STARFOOD, EXPERTS BUSINESS TRANSPORTATION, MARTHA PATRICIA HERNANDEZ AMARO, BOTANIMEX, INTER HOSP
- **Insurance provider:** CHUBB SEGUROS MÉXICO, S.A. (visible for one record)
- **Can create new policies** ("Nuevo" button)
- **Actions:** View (👁), Edit (✏️)

### 7.2 Seguimiento de Siniestros (`/tickets`)
- Links back to the Tickets page (filtered for siniestros)

---

## 🔝 Header Features

- **Search bar** (global search)
- **Notifications** icon (bell-like)
- **EBC Consulta** (`/ebc/consulta`) — external banking/credit verification tool
- **Calendar** icon
- **User** icon
- **Profile avatar** (logged in as José Esparza Rangel)

---

## 🏗️ Technical Observations

| Aspect | Detail |
|--------|--------|
| **Framework** | Laravel (PHP) — evident from session cookies, Blade templates, encrypted route params |
| **Frontend** | jQuery + Bootstrap (responsive, server-rendered pages) |
| **Server** | Apache on Debian |
| **Auth** | Session cookie: `central_leasing_fleet_session` |
| **Route encryption** | Detail URLs use encrypted/signed tokens (base64 JSON with IV, value, MAC, tag) |
| **Pagination** | Server-side, 15-25 records per page |
| **Export** | Excel export available on most listing pages |
| **Internal name** | "Fonik" appears in page source |
| **API** | No visible REST API — everything is server-rendered forms |
| **Real-time** | No WebSocket/real-time features observed |
| **Mobile** | Responsive Bootstrap but no dedicated mobile app |

---

## 🧭 Data Flow Summary

```
Client requests service → Ticket created
                            ↓
Ticket reviewed → Service Order (Agreement) created
                            ↓
Service executed by Provider (e.g., NR Finance Mexico)
                            ↓
Invoice generated → Factura linked to OC
                            ↓
Satisfaction survey sent to client
```

**Purchase & Delivery flow:**
```
Vehicle acquisition → Compra & Entrega folio
                        ↓
Delivery scheduled → Incidencias tracked if issues
                        ↓
Insurance policy assigned → Seguros management
```

---

## 📊 Platform Scale

| Entity | Count |
|--------|-------|
| Active assets | 1,611 |
| Service tickets (all time) | ~1,859+ |
| Purchase orders | ~124 pages × ~15/page = ~1,860 |
| Compra & Entrega folios | ~52 pages = ~780+ |
| Insurance policies | ~52 pages = ~780+ |
| Providers | ~6 pages = ~130+ |
| Incidents | Minimal (1 visible) |

---

## 💡 Replication Notes

For building an independent replica:

1. **Core entities:** Vehicles (by VIN/Serie + Placas), Clients, Providers, Users
2. **Main workflows:**
   - Ticket → Service Order → Invoice pipeline
   - Purchase & Delivery tracking
   - Insurance policy management
   - Gestoría (taxes/fines) tracking
3. **Reports are key differentiator** — inventory, service history, monthly dependency reports, delivery reports
4. **Customer satisfaction** module is a nice touch (9-question survey with charts)
5. **Government clients** appear to be the bread and butter (GOBIERNO DEL ESTADO DE MEXICO dominates the ticket volume)
6. **No complex real-time features** — standard CRUD with good search/filter capabilities
7. **Excel exports everywhere** — data portability is built in
8. **Route encryption** adds security but complicates any scraping/API approach

---

*Report generated by Astrid Lysheim, Feb 20, 2026* 🏔️
