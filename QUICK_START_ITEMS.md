# ⚡ QUICK START - SISTEMA DE ITEMS

## 🎯 En 30 Segundos

Tu nueva capacidad: **Desglose detallado de categorías de presupuesto en items específicos**

**Ejemplo:**
```
Logística ($500,000)
├── 📦 Compra de vehículo ($300,000) - Pendiente
├── 🔧 Equipamiento bodega ($150,000) - Ejecutado
└── 🛡️ Seguros ($50,000) - Aprobado
```

## 📍 Cómo Usar

### Paso 1: Abre Centro de Costo
```
Menú → Centros de Costo → Selecciona tu centro
```

### Paso 2: Click en "📈 Seguimiento"
```
En la tabla, botón verde "📈 Seguimiento"
```

### Paso 3: Click en "📋 Items" (NUEVO)
```
Junto al botón "💰 Gasto" en cada categoría
```

### Paso 4: Manage Items
```
[Nuevo Item] → Completa formulario → [Guardar]

O

[✏️ Editar] / [🗑️ Eliminar] items existentes
```

## 🏷️ Tipos de Items

| Tipo | Ejemplo |
|------|---------|
| **Contratación** | Contratar gerente, auxiliar, profesional |
| **Compra** | Vehículos, equipos, herramientas |
| **Servicio** | Seguros, mantenimiento, consultoría |
| **Viaje** | Pasajes, hospedaje, viáticos |
| **Capacitación** | Cursos, seminarios, entrenamientos |
| **Otro** | Gastos varios |

## 📋 Modal de Items - Qué Ves

```
┌─ Logística ($500,000) ─────────┐
│                                 │
│ Total Items: 3                  │
│ Monto Total: $500,000           │
│ Ejecutados: 2                   │
│                                 │
│ [➕ Nuevo Item]                 │
│                                 │
│ Items Registrados:              │
│ • Vehículo        $300,000 ✏️🗑️ │
│ • Equipamiento    $150,000 ✏️🗑️ │
│ • Seguros         $50,000  ✏️🗑️ │
│                                 │
└─────────────────────────────────┘
```

## ✨ Campos al Crear Item

```
┌─ Nuevo Item ───────────────────┐
│                                │
│ Nombre del Item *              │
│ [Compra de herramientas]       │
│                                │
│ Tipo de Item *                 │
│ [Compra ▼]                     │
│                                │
│ Monto *                        │
│ [$50,000]                      │
│                                │
│ Descripción                    │
│ [Herramientas para logística]  │
│                                │
│ [💾 Guardar] [Cancelar]        │
│                                │
└────────────────────────────────┘
```

## 🎨 Estados del Item

- **🟡 Pendiente**: Creado, esperando aprobación
- **🔵 Aprobado**: Aprobado, listo para ejecutar  
- **🟢 Ejecutado**: Completado/Pagado
- **🔴 Cancelado**: Cancelado o rechazado

## 💡 Tips Prácticos

✅ **Nomina Items Claramente**
```
✓ "Compra de herramientas" 
✗ "Herramientas"
```

✅ **Usa Descripciones**
```
Ejemplo: "Herramientas básicas para equipo de logística"
```

✅ **Agrupa por Tipo**
```
Logística:
├── Compras: Vehículo, Equipamiento
├── Servicios: Seguros
└── Viajes: Gasolina, peajes
```

✅ **Revisa Totales**
```
Suma de items = Total presupuesto categoría
Ejemplo: $300k + $150k + $50k = $500k ✓
```

## ❌ Errores Comunes

| Error | Solución |
|-------|----------|
| "Monto debe ser mayor a 0" | Ingresa un monto positivo |
| "Nombre es requerido" | Dale un nombre descriptivo |
| "Tipo de Item es requerido" | Selecciona un tipo |
| No puedo guardar | Valida que todos campos * están llenos |

## 📊 Caso de Uso Real

**Proyecto: Ampliación Bodega**
```
Centro: Proyecto Bodega Central
Presupuesto: $500,000

📋 LOGÍSTICA
├── 📦 Compra vehículos       $250,000  [Ejecutado]
├── 🔧 Equipamiento            $150,000  [Aprobado]
└── 🛡️ Seguros                 $100,000  [Pendiente]
```

**Pasos:**
1. Abre "Seguimiento"
2. Click en "Items" de Logística
3. Ves los 3 items
4. Puedes editar montos o cambiar estados
5. Ver resumen: $500,000 total

## 🔗 Relación con Otras Funciones

```
Items (Plan)          → Gastos (Realidad)
├─ Item Planeado        └─ Gasto Registrado
│  $100,000             $85,000 ✓ Bajo control
│                       
├─ Item Aprobado        
│  $50,000              $50,000 ✓ Exacto
│                       
└─ Item Pendiente       
   $200,000             $250,000 ❌ SOBREGIRO
```

## 📧 Reportes con Items

El email que recibes ahora incluye:
- ✅ Resumen de items por categoría
- ✅ Estados (Pendiente/Aprobado/Ejecutado)
- ✅ Comparativa: Presupuesto vs Gasto Real
- ✅ Alertas de items en sobregiro

## 🎓 Aprende Más

Para documentación completa:
- [BUDGET_ITEMS_IMPLEMENTATION.md](./BUDGET_ITEMS_IMPLEMENTATION.md)
- [PRESUPUESTOS_SISTEMA_COMPLETO.md](./PRESUPUESTOS_SISTEMA_COMPLETO.md)

## 🚀 Próximos Pasos Sugeridos

1. **Crea los primeros items** en tu categoría
2. **Revisa los states** (pendiente → aprobado → ejecutado)
3. **Registra gastos** contra los items
4. **Recibe reportes** por email con desglose
5. **Ajusta presupuestos** según necesidad

## 📞 Soporte Rápido

**¿Cómo cambio el estado de un item?**
- Click derecho en el item y selecciona nuevo estado
- O edita el item y cambia su status

**¿Puedo duplicar un item?**
- Copia los datos manualmente creando uno nuevo
- Funcionalidad de duplicar en roadmap

**¿Qué pasa si elimino un item?**
- Se elimina del plan pero NO de los gastos registrados
- Puedes recuperarlo desde el historial

---

**¡Ya estás listo para usar items! 🎉**