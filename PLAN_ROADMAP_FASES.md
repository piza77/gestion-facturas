# 📋 PLAN ROADMAP - GESTIÓN DE FACTURAS FASES 1-4
**Equipo:** 2 personas (1 Full-stack dev + 1 Product/QA)  
**Duración Total:** 20 semanas (5 meses)  
**Fecha Inicio:** Diciembre 15, 2025  
**Fecha Meta:** Mayo 15, 2026

---

## 🎯 PRINCIPIOS DEL PLAN

✅ **Entrega iterativa** - Cada 2 semanas un MVP funcional  
✅ **Testing paralelo** - Mientras se desarrolla, se prueba  
✅ **Documentación continua** - API docs + user guides  
✅ **Feedback inmediato** - Validar con usuarios reales  
✅ **Flexibilidad** - Ajustes según aprendizajes  

---

# FASE 1: REPORTES + BÚSQUEDA + AUDITORÍA
**Duración:** 5-6 semanas (Jan 5 - Feb 15, 2026)  
**Objetivo:** Dashboard ejecutivo + inteligencia de datos

## Sprint 1.1 (Semana 1-2: Jan 5-18)
### 🔨 Desarrollo
**Backend (Yo):**
- Crear tabla `reports` y `report_filters`
- Endpoint GET `/dashboard/summary` (KPIs clave)
  - Total facturas por estado
  - Total dinero por mes
  - Top 5 proveedores por monto
  - Facturas vencidas/próximas a vencer
- Queries optimizadas con índices

**Frontend (Tú):**
- Componente Dashboard principal
- Tarjetas de KPIs (animadas)
- Gráfico de barras: dinero por mes (Chart.js)
- Tabla de facturas recientes + filtro rápido por estado

### 📊 Testing
- Validar KPIs con datos manuales
- Performance queries (< 500ms)
- Responsive design mobile/desktop

### 📦 Entregable
- Dashboard básico funcional
- GET `/dashboard/summary` documentado
- 3 gráficos simples

---

## Sprint 1.2 (Semana 3-4: Jan 19 - Feb 1)
### 🔨 Desarrollo
**Backend (Yo):**
- Endpoints de reportes:
  - `GET /reports/monthly` - Gastos mensuales
  - `GET /reports/by-provider` - Top proveedores
  - `GET /reports/by-cost-center` - Por centro de costo
  - `GET /reports/by-type` - Por tipo de factura
- Queries con GROUP BY y SUM optimizadas
- Caché de reportes (Redis o en memoria)

**Frontend (Tú):**
- Página "Reportes" con tabs (Mensual/Proveedor/Centro)
- Selector de rango de fechas
- 4-5 gráficos diferentes
- Botón descargar como JSON/CSV

### 📊 Testing
- Validar datos contra manualmente
- Probar filtros por fechas
- Exportación CSV funciona

### 📦 Entregable
- Página Reportes completa
- 4 endpoints de reportes
- Exportación CSV básica

---

## Sprint 1.3 (Semana 5-6: Feb 2-15)
### 🔨 Desarrollo
**Backend (Yo):**
- Full-text search en invoices:
  ```sql
  MATCH(invoice_number, provider_name, description) AGAINST(?)
  ```
- Filtros avanzados:
  - `GET /invoices/search?q=...&dateFrom=...&dateTo=...&status=...&amount=...`
  - Almacenar búsquedas frecuentes
- Auditoría: tabla `audit_logs` con triggers
- Endpoint `GET /invoices/:id/history` (cambios)

**Frontend (Tú):**
- Búsqueda avanzada UI (modal con 6-8 filtros)
- Búsquedas guardadas (favoritos)
- Historial de cambios modal para cada factura
- Mostrar "cambió de X a Y" de forma legible

### 📊 Testing
- Buscar por diferentes criterios
- Validar historial de cambios
- Performance búsqueda (< 1s)

### 📦 Entregable
- Búsqueda avanzada + filtros
- Auditoría completa de cambios
- Historial por documento

---

## 📈 Fin Fase 1: KPIs a Validar
- ✅ Dashboard carga en < 2 segundos
- ✅ Reportes exportan correctamente
- ✅ Búsqueda encuentra documentos en < 1s
- ✅ Historial muestra todos los cambios

---

# FASE 2: APROBACIONES + PRESUPUESTOS + EMAIL
**Duración:** 4-5 semanas (Feb 16 - Mar 22, 2026)  
**Objetivo:** Workflow de aprobaciones + control presupuestario

## Sprint 2.1 (Semana 7-8: Feb 16-Mar 1)
### 🔨 Desarrollo
**Backend (Yo):**
- Modelo de aprobaciones:
  - Tabla `approval_levels` (1ro, 2do, 3ro nivel)
  - Tabla `approvals` (quién aprobó qué cuándo)
  - Estados nuevos en invoices: "pending_approval_1", "pending_approval_2", etc.
  
- Endpoints:
  - `POST /invoices/:id/approve` - Aprobar
  - `POST /invoices/:id/reject` - Rechazar + razón
  - `GET /invoices/pending-approvals` - Mis pendientes
  
- Email service:
  - Configurar SMTP (SendGrid o similar)
  - Template de notificación
  - Email a siguiente nivel cuando apruebo

**Frontend (Tú):**
- Tabla "Facturas Pendientes de Aprobación"
  - Filtro por mi nivel
  - Mostrar si estoy en nivel 1, 2 o 3
- Modal de aprobación/rechazo
  - Campo de razón (obligatorio para rechazo)
  - Confirmación antes de enviar
- Badge con cantidad de pendientes en navbar

### 📊 Testing
- Crear factura → simular flujo de aprobaciones
- Validar que emails se envían
- Verificar estados transicionen correctamente

### 📦 Entregable
- Workflow de aprobaciones 2-3 niveles
- Notificaciones por email
- Tabla de pendientes

---

## Sprint 2.2 (Semana 9-10: Mar 2-15)
### 🔨 Desarrollo
**Backend (Yo):**
- Tabla `budgets`:
  ```sql
  - id, cost_center_id, period (mes/año), amount, used_amount
  ```
- Lógica:
  - Al crear factura, verificar presupuesto
  - Alertas en 3 niveles: 70%, 90%, 100%
  - Endpoint `GET /cost-centers/:id/budget-status`

- Validación:
  ```
  IF factura.monto + used_amount > budget THEN
    - Si está en rechazo: BLOQUEAR
    - Si está en aprobación: ADVERTENCIA al aprobador
  ```

**Frontend (Tú):**
- Página "Presupuestos por Centro de Costo"
  - Barra de progreso % usado
  - Monto disponible vs. usado
  - Alertas visuales (rojo/amarillo/verde)
  
- En modal crear factura:
  - Mostrar "Presupuesto disponible: $XXX"
  - Advertencia si excede
  
- Reporte: "Presupuesto vs. Gasto Real"

### 📊 Testing
- Crear facturas que superen presupuesto
- Validar bloqueos funcionan
- Ver alertas visuales

### 📦 Entregable
- Sistema de presupuestos funcional
- Control de límites
- Reportes presupuestarios

---

## Sprint 2.3 (Semana 11: Mar 16-22)
### 🔨 Desarrollo
**Backend (Yo):**
- Dashboard aprobador:
  - Endpoint `GET /approvals/dashboard`
  - Estadísticas: cantidad aprobadas, rechazadas, tiempo promedio
- Auditoría de aprobaciones:
  - `GET /approvals/:invoiceId/log` - Quién aprobó cuándo

**Frontend (Tú):**
- Dashboard para aprobadores
  - Gráficos: aprobaciones/mes, tiempo promedio aprobación
  - Tablas de historial de aprobaciones
- Mejoras UX:
  - Drag-drop para cambiar orden de niveles (admin only)
  - Configurar quién es responsable de cada nivel

### 📊 Testing
- Validar flujos complejos (2-3 rechazos → aprobación)
- Performance con muchas aprobaciones

### 📦 Entregable
- Fase 2 completa + auditoría

---

## 📈 Fin Fase 2: KPIs a Validar
- ✅ Emails se envían correctamente
- ✅ Flujos de aprobación no permiten saltarse niveles
- ✅ Presupuestos bloquean facturas excesivas
- ✅ Auditoría registra cada acción

---

# FASE 3: INTEGRACIÓN CONTABLE + PAGOS AUTOMÁTICOS
**Duración:** 4-5 semanas (Mar 23 - Apr 27, 2026)  
**Objetivo:** Conectar con contabilidad + automatizar pagos

## Sprint 3.1 (Semana 12-13: Mar 23 - Apr 5)
### 🔨 Desarrollo
**Backend (Yo):**
- Tabla `accounting_mappings`:
  ```
  - cost_center_id → cuenta contable
  - invoice_type_id → cuenta contable
  - estado → cuenta contable
  ```

- Tabla `journal_entries` (asientos contables)
  - id, invoice_id, account_code, debit, credit, description

- Endpoints:
  - `POST /invoices/:id/generate-journal` - Crear asiento
  - `GET /invoices/:id/journal` - Ver asiento generado
  - `GET /accounting/mappings` - Ver mapeos

- Lógica de asiento:
  ```
  Cuando factura → CONTABILIZADO:
    - Crear asiento débito (Gasto)
    - Crear asiento crédito (Cuentas por pagar)
    - Vincular a invoice
  ```

**Frontend (Tú):**
- Página "Mapeos Contables" (admin only)
  - Tabla con centro de costo → cuenta
  - Editar/agregar mapeos
  - Dropdown de cuentas disponibles

- En modal factura:
  - Tab "Contabilidad"
  - Mostrar asiento generado (si existe)
  - Botón "Ver en sistema contable"

### 📊 Testing
- Crear factura → validar asiento se genera
- Cambiar mapeos → regenerar asiento
- Validar débito = crédito

### 📦 Entregable
- Mapeos contables funcionales
- Generación automática de asientos
- Auditoría contable

---

## Sprint 3.2 (Semana 14-15: Apr 6-19)
### 🔨 Desarrollo
**Backend (Yo):**
- Tabla `payment_orders`:
  ```
  - id, invoice_ids[] (lote), status, total_amount
  - generated_at, scheduled_payment_date
  - bank_reference
  ```

- Automatización:
  - Cron job: Cada día a las 6 AM
  - Buscar facturas en estado "CONTABILIZADO"
  - Agrupar por proveedor/banco
  - Crear órdenes de pago automáticas

- Endpoints:
  - `POST /payment-orders` - Crear manual
  - `GET /payment-orders` - Listar
  - `POST /payment-orders/:id/send-to-bank` - Enviar
  - `PATCH /payment-orders/:id/confirm` - Confirmar pago

**Frontend (Tú):**
- Página "Órdenes de Pago"
  - Listar órdenes (pendiente, enviada, confirmada)
  - Botón "Generar orden de pago manual"
  - Modal con datos del proveedor/banco
  - Ver facturas incluidas en orden

- Vista previa antes de generar
  - Resumen: cantidad facturas, monto total
  - Datos bancarios del proveedor

### 📊 Testing
- Generar orden automática
- Generar orden manual
- Ver datos correcto

### 📦 Entregable
- Sistema de órdenes de pago
- Automatización básica
- Integración banco (mock)

---

## Sprint 3.3 (Semana 16-17: Apr 20 - May 3)
### 🔨 Desarrollo
**Backend (Yo):**
- Remesas bancarias (lotes):
  ```
  - Agrupar múltiples órdenes de pago
  - Generar archivo ACH/SWIFT (formato mock)
  - Endpoint: POST /remittances - crear remesa
  ```

- Confirmación de pagos:
  - Webhook para recibir confirmación de banco
  - Actualizar estado factura → PAGADO
  - Registrar en auditoría
  - Generar comprobante de pago

- OCR básico (opcional pero impactante):
  - Integrar API Google Vision o Tesseract
  - Extraer datos de facturas escaneadas
  - Pre-llenar formulario

**Frontend (Tú):**
- Página "Remesas"
  - Ver remesas por período
  - Descargar archivo ACH
  - Estado de confirmación

- Sistema de carga de facturas:
  - Botón "Subir factura" (PDF/foto)
  - Mostrar datos extraídos por OCR
  - Validar antes de guardar

### 📊 Testing
- Generar remesa con múltiples órdenes
- Validar archivo generado
- Probar OCR con facturas reales
- Confirmar pago → estado cambia

### 📦 Entregable
- Remesas bancarias
- Confirmación de pagos
- OCR básico (si tiempo permite)

---

## 📈 Fin Fase 3: KPIs a Validar
- ✅ Asientos se generan automáticamente
- ✅ Órdenes de pago se crean sin errores
- ✅ Remesas se generan correctamente
- ✅ Estado factura actualiza cuando se paga

---

# FASE 4: MOBILE + ANALYTICS AVANZADO + SEGURIDAD
**Duración:** 4-5 semanas (May 4 - Jun 1, 2026)  
**Objetivo:** App móvil + análitica de proveedores + seguridad

## Sprint 4.1 (Semana 18: May 4-10)
### 🔨 Desarrollo
**Backend (Yo):**
- API endpoints optimizados para móvil:
  - `GET /me/pending-approvals` (lightweight)
  - `GET /invoices?limit=20&offset=0`
  - `POST /auth/token-refresh` - mantener sesión
  - Reducir payload JSON

- Push notifications:
  - Integrar Firebase Cloud Messaging
  - Endpoint: `POST /notifications/subscribe`
  - Enviar push en eventos clave

**Frontend/Mobile (Tú):**
- Inicializar proyecto React Native
- Estructura base + navegación
- Auth screen (login)
- Setup Firebase

### 📦 Entregable
- Proyecto mobile iniciado

---

## Sprint 4.2 (Semana 19-20: May 11-24)
### 🔨 Desarrollo
**Mobile:**
- Pantalla de aprobaciones pendientes
- Detalle de factura (datos clave)
- Botón aprobar/rechazar
- Cámara para capturar recibos
  - Guardar foto localmente
  - Subir a servidor

- Notificaciones:
  - Recibir push de nuevas aprobaciones
  - Listar notificaciones
  - Marcar como leída

### 📊 Testing
- Aprobar factura desde móvil
- Capturar foto de recibo
- Recibir notificación

### 📦 Entregable
- App funcional para aprobaciones
- Captura de fotos
- Notificaciones push

---

## Sprint 4.3 (Semana 21: May 25 - Jun 1)
### 🔨 Desarrollo
**Backend (Yo):**
- Analytics de proveedores:
  ```sql
  - Tabla provider_metrics (calculada diariamente)
  - Campos: total_gasto, cantidad_facturas, 
           promedio_dias_pago, tasa_rechazo, rating
  ```
  
- Recomendaciones:
  - Algoritmo: proveedor con mejor relación 
    precio/velocidad para cada categoría
  - Endpoint: `GET /analytics/top-providers`

- Seguridad:
  - Agregar 2FA (TOTP + SMS)
  - Encriptar datos sensibles (BBAN proveedores)
  - Rate limiting en login

**Frontend (Tú):**
- Página "Análisis de Proveedores"
  - Top 10 por gasto
  - Ranking por velocidad pago
  - Gráfico: tasa rechazo
  - Recomendaciones automáticas

- Settings → Seguridad:
  - Habilitar 2FA (QR code)
  - Listar dispositivos activos
  - Opción logout de todos

### 📊 Testing
- Validar recomendaciones
- Probar 2FA
- Performance queries

### 📦 Entregable
- Analytics completo
- 2FA funcional
- App móvil + web sincronizados

---

## 📈 Fin Fase 4: KPIs a Validar
- ✅ App móvil aprueba facturas
- ✅ Análitica muestra datos correctos
- ✅ 2FA funciona en todos los dispositivos
- ✅ Sincronización móvil/web sin conflictos

---

# 📅 CALENDARIO CONSOLIDADO

```
ENERO 2026
├─ Sem 1-2 (5-18):  SPRINT 1.1 - Dashboard KPIs
├─ Sem 3-4 (19-1F): SPRINT 1.2 - Reportes avanzados
└─ Sem 5-6 (2-15F): SPRINT 1.3 - Búsqueda + Auditoría
   ✅ FASE 1 COMPLETA

FEBRERO 2026
├─ Sem 7-8 (16-1M): SPRINT 2.1 - Aprobaciones + Email
├─ Sem 9-10(2-15M): SPRINT 2.2 - Presupuestos
└─ Sem 11 (16-22M): SPRINT 2.3 - Dashboard aprobador
   ✅ FASE 2 COMPLETA

MARZO-ABRIL 2026
├─ Sem 12-13(23-5A): SPRINT 3.1 - Mapeos contables
├─ Sem 14-15(6-19A): SPRINT 3.2 - Órdenes de pago
└─ Sem 16-17(20-3M): SPRINT 3.3 - Remesas + OCR
   ✅ FASE 3 COMPLETA

MAYO-JUNIO 2026
├─ Sem 18 (4-10): SPRINT 4.1 - Setup móvil
├─ Sem 19-20(11-24): SPRINT 4.2 - App aprobaciones
└─ Sem 21 (25-1J): SPRINT 4.3 - Analytics + 2FA
   ✅ FASE 4 COMPLETA

TOTAL: 21 semanas = 5 meses
```

---

# 📊 CHECKLIST DE CALIDAD POR SPRINT

## Antes de cerrar cada sprint:

**Código:**
- ✅ Code review (2 personas)
- ✅ Tests unitarios pass (>80% cobertura)
- ✅ Linting zero errores
- ✅ Documentación API actualizada

**Funcionalidad:**
- ✅ Feature funciona end-to-end
- ✅ Edge cases manejados
- ✅ Validaciones correctas
- ✅ Performance aceptable

**Testing:**
- ✅ Testing manual completado
- ✅ Cross-browser validado
- ✅ Mobile responsive OK
- ✅ Datos correctos validados

**Documentación:**
- ✅ README actualizado
- ✅ API docs en Swagger
- ✅ User guide si aplica
- ✅ Decision log actualizado

---

# 🔄 PROCESO SEMANAL RECOMENDADO

## Lunes (Planning)
- Revisar tareas de la semana
- Identificar blockers
- Repartir tareas: Backend vs Frontend

## Martes-Jueves (Development)
- Daily standup (10 min): qué hice, qué hago, blockers
- Desarrollo continuo
- PR reviews inline

## Viernes (Demo + Retro)
- Demo de lo completado
- Testing en ambiente similar a producción
- Retro: qué salió bien, qué mejorar
- Plan para próxima semana

---

# 🎯 HITOS PRINCIPALES

| Hito | Fecha | Checklist |
|------|-------|-----------|
| **Fase 1 Live** | Feb 15 | Dashboard + Reportes + Búsqueda |
| **Fase 2 Live** | Mar 22 | Aprobaciones + Presupuestos funcionando |
| **Fase 3 Live** | May 3 | Contabilidad + Pagos automatizados |
| **Fase 4 Live** | Jun 1 | Mobile + Analytics + Seguridad |
| **Sistema Completo** | Jun 1 | Todas las 4 fases productivas |

---

# 📝 DEPENDENCIAS Y RIESGOS

## Dependencias Externas
- 🔴 **Email service** (SendGrid/SMTP) - Necesario desde Sprint 2.1
- 🟡 **Pasarela bancaria** (para Sprint 3.2) - Puede ser mock en inicio
- 🟡 **Google Vision/Tesseract** (Sprint 3.3) - Opcional si OCR

## Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|-----------|
| Cambios en requisitos | ALTA | ALTO | Validar con usuario cada sprint |
| Performance DB crece | MEDIA | ALTO | Índices desde inicio, caché |
| Integración externa fallar | MEDIA | ALTO | Usar mocks, fallback local |
| Scope creep | ALTA | ALTO | Mantener límite estricto por sprint |
| Time tracking deficiente | BAJA | MEDIO | Timesheet simple en Trello/Jira |

---

# 🚀 TECNOLOGÍAS SUGERIDAS

**Backend:**
- Node.js/Express (ya existe)
- MySQL (ya existe)
- Redis (para caché reportes)
- Bull (para cron jobs pagos)
- SendGrid (emails)
- Firebase (push notifications)

**Frontend:**
- Vue 3 (ya existe)
- Chart.js/ApexCharts (reportes)
- Axios (ya existe)

**Mobile:**
- React Native + Expo
- Firebase Cloud Messaging
- React Navigation

**DevOps:**
- Docker (opcional pero recomendado)
- GitHub Actions (CI/CD simple)
- Vercel (frontend) / Railway (backend)

---

# 📊 METRICAS DE ÉXITO

**Por Fase:**
- Fase 1: Dashboard carga < 2s, búsqueda < 1s
- Fase 2: 100% facturas con aprobación documentada
- Fase 3: 100% facturas con asiento contable
- Fase 4: 50%+ de aprobaciones en móvil, 2FA en 100% admins

**Globales:**
- 0 bugs críticos en producción
- > 90% test coverage
- Uptime > 99%
- User satisfaction > 4/5

---

# 💡 TIPS PARA ÉXITO

1. **Automatiza tests** - Ahorra debugging manual
2. **Documenta decisiones** - Future you lo agradecerá
3. **Deploy frecuente** - Cada 2 sprints mínimo
4. **Usuarios en testing** - Feedback real es invaluable
5. **Buffer de 20%** - No prometas 100% de la capacidad
6. **Retrospectivas honestas** - Ajusta velocidad vs tiempo real
7. **Versionamiento DB** - Migrations claras desde inicio

---

**Versión:** 1.0  
**Última actualización:** Diciembre 15, 2025  
**Dueño:** Plan Colaborativo
