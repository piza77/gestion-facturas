# 📚 EJEMPLOS DE USO - SISTEMA DE ITEMS

## 🎯 Casos Reales de Uso

Te muestro cómo usar la nueva funcionalidad en diferentes escenarios.

---

## 📦 CASO 1: Compra de Equipamiento para Logística

### Escenario
Un proyecto requiere equipar una nueva bodega. Necesitas:
- Comprar un vehículo
- Equipamiento
- Seguros

### Pasos

**1. Crear Centro de Costo**
```
Centros de Costo → [Nuevo Centro]
├─ Código: BODA-001
├─ Nombre: Bodega Central
├─ Cliente: Empresa XYZ
├─ Presupuesto: $500,000
└─ Estado: Activo
```

**2. Abrir Seguimiento**
```
En tabla → [📈 Seguimiento]
Se abre modal con categorías
```

**3. Crear Items en Logística**
```
Botón [📋 Items] en Logística

Modal se abre:
┌─ Logística - $500,000 ─────────┐
│ Total Items: 0                  │
│ [➕ Nuevo Item]                 │
└─────────────────────────────────┘

Item 1: Compra de Vehículo
├─ Nombre: Compra de vehículo
├─ Tipo: Compra
├─ Monto: $300,000
└─ Descripción: Toyota Hilux para reparto

Item 2: Equipamiento
├─ Nombre: Equipamiento de bodega
├─ Tipo: Compra
├─ Monto: $150,000
└─ Descripción: Racks, cajas, estanterías

Item 3: Seguros
├─ Nombre: Seguros y mantenimiento
├─ Tipo: Servicio
├─ Monto: $50,000
└─ Descripción: Seguro vehículo + mantenimiento año 1
```

**4. Resultado Final**
```
Logística: $500,000
├── Compra de vehículo        $300,000 [Pendiente]
├── Equipamiento de bodega     $150,000 [Pendiente]
└── Seguros                    $50,000  [Pendiente]

Total registrado: $500,000 ✓ (Coincide con presupuesto)
```

**5. Flujo de Aprobación**
```
Semana 1: Items en [Pendiente]
├─ Gerente revisa
├─ Aprueba vehículo → [Aprobado]
├─ Aprueba equipamiento → [Aprobado]
└─ Pospone seguros → [Pendiente]

Semana 2: Se ejecutan compras
├─ Vehículo comprado → [Ejecutado]
└─ Equipamiento entregado → [Ejecutado]

Semana 3: Se aprueban seguros
└─ Seguros → [Ejecutado]
```

---

## 👥 CASO 2: Contratación de Personal

### Escenario
Proyecto de expansión requiere contratar:
- 1 Gerente
- 2 Especialistas
- 3 Auxiliares
- Capacitación

### Pasos

**1. Centro de Costo**
```
Nombre: Expansión Equipo
Presupuesto RH: $1,500,000
```

**2. Items de RH**
```
RH: $1,500,000

Item 1: Gerente de Operaciones
├─ Tipo: Contratación
├─ Monto: $600,000/año
├─ Estado: [Aprobado]
└─ Descripción: Gerente con 10+ años experiencia

Item 2: 2 Especialistas
├─ Tipo: Contratación
├─ Monto: $800,000/año
├─ Estado: [Pendiente]
└─ Descripción: Especialistas en sistemas

Item 3: 3 Auxiliares
├─ Tipo: Contratación
├─ Monto: $300,000/año
├─ Estado: [Pendiente]
└─ Descripción: Auxiliares administrativos

Item 4: Capacitación
├─ Tipo: Capacitación
├─ Monto: $100,000
├─ Estado: [Aprobado]
└─ Descripción: Cursos SAP y sistemas internos

Item 5: Seguro Médico
├─ Tipo: Servicio
├─ Monto: $200,000
├─ Estado: [Aprobado]
└─ Descripción: Cobertura médica anual
```

**3. Ejecución**
```
Mes 1: Publicar convocatorias
├─ Gerente: Entrevistas en curso
├─ Especialistas: Convocatoria abierta
└─ Auxiliares: Convocatoria abierta

Mes 2: Contrataciones
├─ Gerente contratado → [Ejecutado]
└─ Especialistas: En entrevistas

Mes 3: Especialistas contratados
├─ Especialistas → [Ejecutado]
└─ Auxiliares: Próxima semana

Mes 4: Auxiliares contratados
├─ Auxiliares → [Ejecutado]
└─ Capacitación: Inicia semana que viene

Mes 5: Capacitación
├─ Capacitación → [Ejecutado]
└─ Seguro Médico: Confirmado

Total Ejecutado: $1,500,000 ✓
```

**4. Seguimiento en Tiempo Real**
```
RH: $1,500,000 - Ejecución: 100% ✓

Pendientes: 0 ✓
Aprobados: 3
Ejecutados: 5

Todos los items completados
```

---

## 🏢 CASO 3: Proyecto de Infraestructura

### Escenario
Proyecto de construcción con múltiples rubros

**1. Centro de Costo**
```
Nombre: Ampliación Edificio
Presupuesto Total: $10,000,000
```

**2. Categorías e Items**

### Categoría: Infraestructura ($6,000,000)
```
Item 1: Compra de Terreno
├─ Monto: $3,000,000
├─ Estado: [Ejecutado]
└─ Fecha: 01/12/2025

Item 2: Construcción
├─ Monto: $2,500,000
├─ Estado: [Aprobado]
├─ Descripción: Licititar obra
└─ Proveedores solicitados

Item 3: Permisos y Trámites
├─ Monto: $500,000
├─ Estado: [Pendiente]
└─ Descripción: Permisos municipales
```

### Categoría: Equipamiento ($2,500,000)
```
Item 1: Mobiliario de Oficina
├─ Monto: $800,000
├─ Estado: [Pendiente]

Item 2: Tecnología IT
├─ Monto: $1,000,000
├─ Estado: [Pendiente]

Item 3: Sistemas de Seguridad
├─ Monto: $700,000
├─ Estado: [Aprobado]
```

### Categoría: Licencias y Profesionales ($1,000,000)
```
Item 1: Ingeniero Residente
├─ Monto: $600,000
├─ Estado: [Aprobado]

Item 2: Supervisor de Obra
├─ Monto: $300,000
├─ Estado: [Pendiente]

Item 3: Licencias
├─ Monto: $100,000
├─ Estado: [Aprobado]
```

### Categoría: Contingencias ($500,000)
```
Item 1: Reserva
├─ Monto: $500,000
├─ Estado: [Pendiente]
└─ Descripción: Imprevistos de construcción
```

**3. Dashboard de Proyecto**
```
AMPLIACIÓN EDIFICIO - $10,000,000

Total Presupuestado:  $10,000,000
Total Ejecutado:      $3,000,000 (30%)
Total Disponible:     $7,000,000 (70%)

Desglose:
├─ Infraestructura:       $6,000,000 (60%)
│  └─ Ejecutados: 1 item
├─ Equipamiento:          $2,500,000 (25%)
│  └─ Ejecutados: 0 items
├─ Licencias:             $1,000,000 (10%)
│  └─ Ejecutados: 0 items
└─ Contingencias:         $500,000 (5%)
   └─ Ejecutados: 0 items

Estados:
├─ Ejecutados: 1 items
├─ Aprobados: 4 items
├─ Pendientes: 5 items
└─ Cancelados: 0 items
```

---

## 📊 CASO 4: Marketing y Publicidad

### Escenario
Campaña de marketing con múltiples componentes

**Items de Marketing ($200,000)**
```
Item 1: Campaña Digital
├─ Tipo: Servicio
├─ Monto: $100,000
├─ Estado: [Ejecutado]
├─ Descripción: Google Ads, Facebook Ads, Instagram
└─ Fecha: Completada 15/12/2025

Item 2: Producción de Videos
├─ Tipo: Servicio
├─ Monto: $60,000
├─ Estado: [Aprobado]
└─ Descripción: 3 videos cortos para redes sociales

Item 3: Diseño Gráfico
├─ Tipo: Servicio
├─ Monto: $30,000
├─ Estado: [Aprobado]
└─ Descripción: Banners, infografías, posts

Item 4: Influencers
├─ Tipo: Servicio
├─ Monto: $10,000
├─ Estado: [Pendiente]
└─ Descripción: Alianza con 3 influencers micro
```

**Seguimiento**
```
Marketing: $200,000

Ejecutados: 1  ($100,000 - 50%)
Aprobados:  2  ($90,000 - 45%)
Pendientes: 1  ($10,000 - 5%)

Total Ejecutado: $100,000 / $200,000 (50%)
Disponible: $100,000
```

---

## 🔄 CASO 5: Cambio de Estados y Flujo

### Escenario
Mostrar cómo cambian los estados a lo largo del tiempo

**Logística: $500,000**

**Día 1 - Creación**
```
├── Vehículo        $300,000 [PENDIENTE] 🟡
├── Equipamiento    $150,000 [PENDIENTE] 🟡
└── Seguros         $50,000  [PENDIENTE] 🟡
```

**Día 3 - Aprobación Parcial**
```
├── Vehículo        $300,000 [APROBADO] 🔵
├── Equipamiento    $150,000 [APROBADO] 🔵
└── Seguros         $50,000  [PENDIENTE] 🟡
```

**Día 7 - Inicio Ejecución**
```
├── Vehículo        $300,000 [EJECUTADO] 🟢 (Entregado 07/01)
├── Equipamiento    $150,000 [APROBADO] 🔵
└── Seguros         $50,000  [PENDIENTE] 🟡
```

**Día 14 - Más Avances**
```
├── Vehículo        $300,000 [EJECUTADO] 🟢
├── Equipamiento    $150,000 [EJECUTADO] 🟢 (Entregado 14/01)
└── Seguros         $50,000  [APROBADO] 🔵
```

**Día 30 - Completado**
```
├── Vehículo        $300,000 [EJECUTADO] 🟢
├── Equipamiento    $150,000 [EJECUTADO] 🟢
└── Seguros         $50,000  [EJECUTADO] 🟢

Logística: 100% COMPLETADA ✓
```

---

## 💰 CASO 6: Control de Sobregiro

### Escenario
Item que se sobrepasa del presupuesto

**Presupuesto Original**
```
Logística: $500,000
├── Vehículo        $300,000
├── Equipamiento    $150,000
└── Seguros         $50,000
```

**Problema Detectado**
```
Al registrar gastos:
├── Vehículo gasto real:     $320,000 (Sobregiro +$20,000)
├── Equipamiento gasto real: $150,000 (OK)
└── Seguros gasto real:      $45,000  (Bajo presupuesto)

Estado de items:
├── Vehículo: ⚠️ SOBREGIRO (+4%)
├── Equipamiento: ✓ OK
└── Seguros: ✓ OK

Total Logística:
├── Presupuestado: $500,000
├── Gastado Real: $515,000
└── ⚠️ SOBREGIRO TOTAL: +$15,000 (3%)
```

**Acciones**

1. **Editar Item**
   ```
   Click [✏️] en Vehículo
   ├─ Nombre: Compra de vehículo
   ├─ Monto anterior: $300,000
   ├─ Monto nuevo: $320,000
   └─ Guarda cambio
   ```

2. **Registrar Gasto**
   ```
   Click [💰 Gasto]
   ├─ Item: Vehículo
   ├─ Monto: $320,000
   └─ [Registrar]
   ```

3. **Email de Alerta**
   ```
   Asunto: ⚠️ Sobregiro en Logística - Vehículo

   Categoría: Logística
   Item: Compra de vehículo
   Presupuesto: $300,000
   Gastado: $320,000
   Sobregiro: $20,000 (6.7%)

   Acción recomendada: Revisar con gerente
   ```

---

## 📧 CASO 7: Email de Reporte

### Escenario
Recibir email automático con resumen de items

**Email Recibido:**
```
Asunto: 📊 Reporte de Presupuesto - Bodega Central

Hola,

A continuación tu resumen de presupuesto:

═══════════════════════════════════════════════════
BODEGA CENTRAL - $500,000
═══════════════════════════════════════════════════

RESUMEN GENERAL
├─ Presupuesto Total:    $500,000
├─ Ejecutado:            $450,000 (90%)
├─ Disponible:           $50,000  (10%)
└─ Estado: ⚠️ Próximo a límite

DESGLOSE POR CATEGORÍA

📦 LOGÍSTICA ($500,000) - 90%
├─ Compra Vehículo      $300,000 [EJECUTADO] ✓
├─ Equipamiento         $150,000 [EJECUTADO] ✓
└─ Seguros              $50,000  [PENDIENTE] 🟡

ITEMS PENDIENTES
└─ Seguros ($50,000) - Aprobación pendiente

ALERTAS IMPORTANTES
⚠️ Logística con 90% de ejecución
💡 Recomendación: Aprobar item de seguros

Próximas acciones:
1. Aprobar seguros esta semana
2. Ejecutar compra de póliza
3. Revisar si hay sobregiros

═══════════════════════════════════════════════════
Reportado por: Sistema de Gestión de Presupuestos
Fecha: 05/01/2026
═══════════════════════════════════════════════════

Para más detalles, ingresa a tu sistema.
```

---

## ✅ Tips Finales

1. **Nombra items claramente**
   - ✓ "Compra de vehículo Toyota Hilux"
   - ✗ "Vehículo"

2. **Usa descripciones**
   - Especifica marca, modelo, características
   - Incluye propósito del gasto

3. **Agrupa logicamente**
   - Items del mismo tipo juntos
   - Facilita auditoría

4. **Revisa totales**
   - Suma de items = Total categoría
   - Valida que cuadren

5. **Cambia estados regularmente**
   - Mantén información actualizada
   - Facilita seguimiento

6. **Aprovecha los reportes**
   - Revisa emails periódicamente
   - Toma decisiones con datos

---

**¡Ahora estás listo para usar items en tu sistema de presupuestos! 🎉**