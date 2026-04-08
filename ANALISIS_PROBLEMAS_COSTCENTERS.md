# 🐛 ANÁLISIS DE PROBLEMAS - CENTROS DE COSTO

## Problema 1: Campo "Budget" se incrementa sin digitar

**Ubicación:** `frontend/src/views/CostCenters.vue`

**Causa Raíz:** La función `formatCurrency()` está causando inconsistencias en los handlers de input.

```javascript
// Línea ~765: función updateBudgetValue
const updateBudgetValue = (event) => {
  const value = event.target.value.replace(/[^\d]/g, '')
  const numValue = parseInt(value) || 0
  form.value.budget = numValue
  budgetFormatted.value = formatCurrency(numValue)
  
  // Actualizar montos de categorías si está abierto el modal de distribución
  if (showBudgetModal.value) {
    budgetCategories.value.forEach(cat => updateCategoryAmount(cat))
  }
}
```

**Problemas:**
1. El input tiene `v-model="budgetFormatted"` y también `@input="updateBudgetValue"`
2. Esto causa un doble-binding: cuando `budgetFormatted` cambia, Vue actualiza el DOM
3. `@input` se dispara a cada cambio, incluso sin interacción del usuario
4. `formatCurrency()` añade separadores de miles, causando que el `event.target.value` tenga comas/puntos
5. El `replace(/[^\d]/g, '')` extrae solo dígitos, pero puede dejar valores inesperados

**Síntoma observado:** El presupuesto se incrementa porque:
- Se carga con valor X (ej: 2000000)
- Se formatea a "2.000.000" (separadores colombianos)
- Si hay click/focus, `@input` se dispara
- Se extrae "2000000" nuevamente
- Se recalcula y se guarda (debería ser igual, pero hay pérdida de precisión)

---

## Problema 2: Campo "Estado" no visualiza activo/inactivo

**Ubicación:** `frontend/src/views/CostCenters.vue`, línea ~286

**Causa Raíz:** Type mismatch - el backend retorna números (0/1) pero el select espera booleanos (true/false).

```javascript
// Línea ~788
const openModal = (center = null) => {
  // ...
  form.value = {
    // ...
    isActive: center.is_active  // 👈 Viene como 0 o 1 (número) de la BD
    //           ^^^^^^^^^^^^^^
  }
}

// HTML (línea ~286)
<select v-model="form.isActive">
  <option :value="true">Activo</option>    <!-- Espera Boolean -->
  <option :value="false">Inactivo</option> <!-- Espera Boolean -->
</select>
```

**Problema:**
- `center.is_active` es `0` o `1` (número MySQL)
- Select espera `true` o `false`
- Comparación: `0 !== true` y `1 !== false` → No coincide nada
- El select aparece vacío sin selección visible

---

## Soluciones a Implementar

### Solución 1: Separar v-model y @input para el Budget

**Cambio en HTML:**
```vue
<!-- ANTES -->
<input v-model="budgetFormatted" @input="updateBudgetValue" type="text" />

<!-- DESPUÉS -->
<input :value="budgetFormatted" @input="updateBudgetValue" type="text" />
```

**Cambio en Script:**
```javascript
// NUEVA función mejorada
const updateBudgetValue = (event) => {
  // Extraer solo dígitos
  const value = event.target.value.replace(/[^\d]/g, '')
  const numValue = parseInt(value, 10) || 0
  
  // Actualizar el valor numérico
  form.value.budget = numValue
  
  // Formatear para mostrar
  if (numValue > 0) {
    budgetFormatted.value = new Intl.NumberFormat('es-CO', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numValue)
  } else {
    budgetFormatted.value = ''
  }
  
  // Actualizar distribución si está abierta
  if (showBudgetModal.value) {
    budgetCategories.value.forEach(cat => updateCategoryAmount(cat))
  }
}
```

---

### Solución 2: Convertir is_active a Boolean

**Cambio en openModal (línea ~788):**
```javascript
const openModal = (center = null) => {
  resetForm()
  if (center) {
    editingCenter.value = center
    form.value = {
      code: center.code,
      name: center.name,
      description: center.description,
      budget: center.budget,
      clientId: center.client_id || '',
      clientNit: center.client_nit || '',
      contractNumber: center.contract_number || '',
      isActive: Boolean(center.is_active)  // 👈 CONVERTIR a Boolean
    }
    budgetFormatted.value = formatCurrency(center.budget)
  } else {
    editingCenter.value = null
  }
  showModal.value = true
}
```

**También en resetForm (línea ~775):**
```javascript
const resetForm = () => {
  form.value = {
    code: '',
    name: '',
    description: '',
    budget: 0,
    clientId: '',
    clientNit: '',
    contractNumber: '',
    isActive: true  // Asegurarse que es Boolean
  }
  budgetFormatted.value = ''
}
```

---

### Solución 3: Mejorar formatCurrency

**Cambio en función formatCurrency (línea ~734):**
```javascript
// ANTES
const formatCurrency = (value) => {
  const num = parseFloat(value.toString().replace(/[^\d]/g, '')) || 0
  return new Intl.NumberFormat('es-CO').format(num)
}

// DESPUÉS
const formatCurrency = (value) => {
  const num = parseFloat(value) || 0
  return new Intl.NumberFormat('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num)
}
```

---

## Resumen de Cambios

| Archivo | Línea | Cambio |
|---------|-------|--------|
| `CostCenters.vue` | ~244 | Cambiar `v-model` a `:value` en input budget |
| `CostCenters.vue` | ~734-738 | Mejorar función `formatCurrency` |
| `CostCenters.vue` | ~765-777 | Reescribir función `updateBudgetValue` |
| `CostCenters.vue` | ~775-787 | Asegurar `isActive: true` en `resetForm` |
| `CostCenters.vue` | ~800 | Agregar `Boolean()` en `isActive: center.is_active` |

---

## Testing

Después de los cambios, verificar:

✅ Crear nuevo centro con presupuesto (ej: 5000000)
  - Debe mostrar "5.000.000" sin incrementar

✅ Editar centro existente con presupuesto
  - Debe cargar el valor correcto sin decrementar
  - Editar presupuesto debe mantener valor exacto

✅ Seleccionar Estado
  - Nuevo: debe mostrar "Activo"
  - Editar Activo: debe mostrar "Activo" en select
  - Editar Inactivo: debe mostrar "Inactivo" en select

✅ Guardar cambios
  - Budget debe ser exactamente lo que se digitó
  - Estado debe ser exactamente lo que se seleccionó
