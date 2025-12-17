# 🔄 Flujo de Estados y Transiciones de Documentos

## Descripción General

El sistema implementa un flujo de trabajo (workflow) completo para documentos/facturas con rastreo automático de quién hizo cada cambio y cuándo.

## Estados del Documento

### Diagrama de Flujo

```
┌──────────┐      ┌──────────┐      ┌────────────────┐      ┌────────┐
│ PENDIENTE│ ---> │ RADICADO │ ---> │ CONTABILIZADO  │ ---> │ PAGADO │
└──────────┘      └──────────┘      └────────────────┘      └────────┘
   (Inicio)      (Radicar ante   (Registro en          (Finalizado)
                 autoridades)     sistema contable)
```

### Detalle de Cada Estado

#### 1️⃣ PENDIENTE
- **Descripción**: Estado inicial cuando se crea la factura
- **Acciones permitidas**:
  - Editar cualquier campo de la factura
  - Agregar información
  - Cambiar a → RADICADO
- **Datos registrados**: 
  - Fecha de creación
  - Usuario que creó

#### 2️⃣ RADICADO
- **Descripción**: La factura ha sido radicada ante las autoridades
- **Transición automática**: Se registran
  ```
  filed_at: DATETIME (fecha actual)
  filed_by: UUID (usuario que radica)
  ```
- **Acciones permitidas**:
  - Editar datos de Registro Contable
  - Cambiar a → CONTABILIZADO
- **No permitido**: Volver a PENDIENTE

#### 3️⃣ CONTABILIZADO
- **Descripción**: La factura ha sido registrada en el sistema contable
- **Transición automática**: Se registran
  ```
  accounted_at: DATETIME (fecha actual)
  accounted_by: UUID (usuario que contabiliza)
  ```
- **Acciones permitidas**:
  - Editar datos de Análisis Contable
  - Cambiar a → PAGADO
- **No permitido**: Volver a estados anteriores

#### 4️⃣ PAGADO
- **Descripción**: El pago ha sido procesado completamente
- **Transición automática**: Se registran
  ```
  paid_at: DATETIME (fecha actual)
  paid_by: UUID (usuario que procesa pago)
  ```
- **Acciones permitidas**:
  - Editar datos de Control de Pago
  - Ver historial completo
- **No permitido**: Cambiar de estado (es final)

## Cómo Cambiar de Estado

### Método 1: Desde la Tabla de Facturas

```
1. Localiza la factura en la tabla
2. En la columna "Estado" verás el estado actual
3. Si hay siguiente estado, aparecerá un botón "→"
4. Haz clic en el botón
5. El estado cambia automáticamente
6. Se registran automáticamente fecha y usuario
```

### Método 2: Desde el Modal de Edición

```
1. Haz clic en "Ver" en la fila de la factura
2. Se abre el modal con toda la información
3. Busca la sección "HISTORIAL DE ESTADOS Y TRANSICIONES"
4. Verás un timeline visual con los cambios realizados
5. Haz clic en el botón "Cambiar a [siguiente estado]"
6. Se actualiza automáticamente
```

### Método 3: API REST

```bash
# Cambiar de estado vía API
PUT /api/invoices/:id/status
Content-Type: application/json

{
  "status": "filed"  // filed, accounted, paid
}

# Respuesta
{
  "message": "Estado actualizado exitosamente",
  "invoice": { ... }
}
```

## Rastreo de Cambios

Cada transición de estado registra automáticamente:

### Para RADICACIÓN (Pendiente → Radicado)
```javascript
{
  filed_at: "2025-12-15T14:30:45.000Z",
  filed_by: "uuid-del-usuario-que-radico"
}
```

### Para CONTABILIZACIÓN (Radicado → Contabilizado)
```javascript
{
  accounted_at: "2025-12-15T15:45:30.000Z",
  accounted_by: "uuid-del-usuario-que-contabilizo"
}
```

### Para PAGO (Contabilizado → Pagado)
```javascript
{
  paid_at: "2025-12-15T16:20:15.000Z",
  paid_by: "uuid-del-usuario-que-proceso-pago"
}
```

## Timeline Visual en el Modal

Cuando abres una factura, ves automáticamente:

```
✓ Pendiente
  Estado inicial de la factura
  
✓ Radicado
  ✅ 15/12/2025 (fecha en que se radicó)
  
○ Contabilizado
  Pendiente de contabilizar
  
○ Pagado
  Pendiente de pagar
```

Donde:
- ✓ = Completado (círculo verde)
- ○ = Pendiente (círculo gris)

## Validaciones del Sistema

El sistema valida automáticamente:

### ✅ Transiciones Válidas
```
pending    → filed      ✓
filed      → accounted  ✓
accounted  → paid       ✓
paid       → (ninguno)  X
```

### ✅ No se permite
```
- Saltar estados (pendiente → contabilizado)
- Volver atrás (paid → accounted)
- Cambiar un documento pagado
```

## Campos Automáticos por Transición

La siguiente tabla muestra qué campos se asignan automáticamente:

| Transición | Campo | Valor |
|-----------|-------|-------|
| → Radicado | `filed_at` | Fecha/Hora actual |
| → Radicado | `filed_by` | UUID Usuario |
| → Contabilizado | `accounted_at` | Fecha/Hora actual |
| → Contabilizado | `accounted_by` | UUID Usuario |
| → Pagado | `paid_at` | Fecha/Hora actual |
| → Pagado | `paid_by` | UUID Usuario |

## Filtros por Estado

Puedes filtrar las facturas por estado en la tabla:

```
Todos los estados     (sin filtro)
Pendiente            (no radicadas)
Radicado             (radicadas, sin contabilizar)
Contabilizado        (contabilizadas, sin pagar)
Pagado               (completadas)
Cancelado            (canceladas)
```

## Casos de Uso

### Caso 1: Factura Nueva
```
1. Se crea factura → Estado: PENDIENTE
2. Se revisan datos
3. Se radica → Estado: RADICADO
4. Se contabiliza → Estado: CONTABILIZADO
5. Se procesa pago → Estado: PAGADO
```

### Caso 2: Retrasos en Pago
```
1. Factura en CONTABILIZADO
2. Esperar confirmación de pago
3. Una vez confirmado → PAGADO
4. El sistema registra quién pagó y cuándo
```

### Caso 3: Auditoría
```
1. Abrir cualquier factura
2. Ver sección "Historial de Estados"
3. Saber exactamente:
   - Cuándo se radicó
   - Quién lo radicó
   - Cuándo se contabilizó
   - Quién lo contabilizó
   - Cuándo se pagó
   - Quién procesó el pago
```

## Integración con Secciones del Modal

Cada sección del modal está vinculada a un estado:

| Sección | Estados Relevantes |
|---------|-------------------|
| Información Básica | Todos |
| Montos y Fechas | Todos |
| Autorizaciones | Pending, Filed |
| Registro Contable | Filed, Accounted, Paid |
| Análisis Contable | Accounted, Paid |
| Control de Pago | Accounted, Paid |
| Historial de Estados | Todos (solo lectura) |

## Próximas Funcionalidades

Consideradas para futuras versiones:

- [ ] Reversión de estados con autorización
- [ ] Notificaciones automáticas en cambios de estado
- [ ] Reportes por período de estados
- [ ] Búsqueda por rango de fechas de transición
- [ ] Bloqueo de edición en ciertos estados
- [ ] Workflows personalizables por usuario

---

**Última actualización**: 15 de Diciembre de 2025
**Versión**: 2.0 - Sistema de Estados Completo
