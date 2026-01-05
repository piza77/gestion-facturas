# 🧪 Ejemplos de Pruebas - Módulo de Presupuestos

## Variables de Entorno

```bash
# Reemplazar con valores reales
TOKEN="tu-token-jwt-aqui"
COST_CENTER_ID="uuid-del-centro"
CATEGORY_ID="uuid-de-categoria"
SUBCATEGORY_ID="uuid-de-subcategoria"
BASE_URL="http://localhost:8080/api"
```

---

# 📌 Ejemplos cURL

## 1. Crear Centro de Costo con Información de Cliente

```bash
curl -X POST http://localhost:8080/api/cost-centers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "CC-001",
    "name": "Centro Principal",
    "budget": 100000,
    "clientId": "CLI-001",
    "contractNumber": "CONT-2026-001",
    "clientNit": "123456789-1"
  }'
```

## 2. Asignar Presupuesto Desde Plantilla

```bash
curl -X POST http://localhost:8080/api/budget/assign-template/uuid-del-centro \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "budgetAmount": 100000
  }'
```

## 3. Obtener Categorías

```bash
curl -X GET "http://localhost:8080/api/budget/categories?costCenterId=uuid-del-centro" \
  -H "Authorization: Bearer $TOKEN"
```

## 4. Obtener Categoría Específica

```bash
curl -X GET http://localhost:8080/api/budget/categories/uuid-categoria \
  -H "Authorization: Bearer $TOKEN"
```

## 5. Crear Subcategoría

```bash
curl -X POST http://localhost:8080/api/budget/subcategories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "budgetCategoryId": "uuid-categoria",
    "name": "Salarios Base",
    "amount": 35000,
    "description": "Nómina mensual del equipo",
    "order": 1
  }'
```

## 6. Obtener Subcategorías

```bash
curl -X GET "http://localhost:8080/api/budget/subcategories?budgetCategoryId=uuid-categoria" \
  -H "Authorization: Bearer $TOKEN"
```

## 7. Actualizar Categoría

```bash
curl -X PUT http://localhost:8080/api/budget/categories/uuid-categoria \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 55000,
    "percentage": 55
  }'
```

## 8. Actualizar Subcategoría

```bash
curl -X PUT http://localhost:8080/api/budget/subcategories/uuid-subcategoria \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 32000,
    "name": "Salarios Actualizados"
  }'
```

## 9. Obtener Resumen de Presupuesto

```bash
curl -X GET "http://localhost:8080/api/budget/summary?costCenterId=uuid-del-centro" \
  -H "Authorization: Bearer $TOKEN"
```

## 10. Obtener Plantilla por Defecto

```bash
curl -X GET http://localhost:8080/api/budget/template/default \
  -H "Authorization: Bearer $TOKEN"
```

## 11. Eliminar Categoría

```bash
curl -X DELETE http://localhost:8080/api/budget/categories/uuid-categoria \
  -H "Authorization: Bearer $TOKEN"
```

## 12. Eliminar Subcategoría

```bash
curl -X DELETE http://localhost:8080/api/budget/subcategories/uuid-subcategoria \
  -H "Authorization: Bearer $TOKEN"
```

---

# 🟨 Ejemplos JavaScript/Fetch

## 1. Crear Centro de Costo

```javascript
async function createCostCenter() {
  try {
    const response = await fetch('http://localhost:8080/api/cost-centers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        code: 'CC-001',
        name: 'Centro Principal',
        budget: 100000,
        clientId: 'CLI-001',
        contractNumber: 'CONT-2026-001',
        clientNit: '123456789'
      })
    });

    const data = await response.json();
    console.log('Centro creado:', data.center.id);
    return data.center.id;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 2. Asignar Presupuesto

```javascript
async function assignBudget(costCenterId, budgetAmount) {
  try {
    const response = await fetch(
      `http://localhost:8080/api/budget/assign-template/${costCenterId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ budgetAmount })
      }
    );

    const data = await response.json();
    console.log('Presupuesto asignado:', data.total);
    console.log('Categorías creadas:', data.categories.length);
    return data.categories;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 3. Obtener Categorías

```javascript
async function getCategories(costCenterId) {
  try {
    const response = await fetch(
      `http://localhost:8080/api/budget/categories?costCenterId=${costCenterId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();
    console.log('Categorías:', data.categories);
    console.log('Total presupuesto:', data.total);
    return data.categories;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 4. Crear Subcategoría

```javascript
async function createSubcategory(categoryId, name, amount) {
  try {
    const response = await fetch('http://localhost:8080/api/budget/subcategories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        budgetCategoryId: categoryId,
        name,
        amount,
        description: `${name} para presupuesto`
      })
    });

    const data = await response.json();
    console.log('Subcategoría creada:', data.subcategory.id);
    return data.subcategory;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 5. Obtener Resumen

```javascript
async function getBudgetSummary(costCenterId) {
  try {
    const response = await fetch(
      `http://localhost:8080/api/budget/summary?costCenterId=${costCenterId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const data = await response.json();
    
    console.log('Centro de costo:', data.costCenter.name);
    console.log('Presupuesto total:', data.budget.total);
    console.log('Presupuesto asignado:', data.budget.allocated);
    console.log('Presupuesto disponible:', data.budget.remaining);
    console.log('Utilización:', data.budget.utilisationPercentage + '%');

    data.categories.forEach(category => {
      console.log(`\n${category.name}:`);
      console.log(`  Asignado: $${category.allocated}`);
      console.log(`  Gastado: $${category.spent}`);
      console.log(`  Disponible: $${category.remaining}`);
      console.log(`  Utilización: ${category.percentage}%`);
    });

    return data;
  } catch (error) {
    console.error('Error:', error);
  }
}
```

## 6. Flujo Completo

```javascript
async function completeBudgetFlow() {
  try {
    // 1. Crear centro de costo
    console.log('1. Creando centro de costo...');
    const costCenterId = await createCostCenter();

    // 2. Asignar presupuesto desde plantilla
    console.log('\n2. Asignando presupuesto...');
    const categories = await assignBudget(costCenterId, 100000);

    // 3. Obtener categorías
    console.log('\n3. Obteniendo categorías...');
    const allCategories = await getCategories(costCenterId);

    // 4. Crear subcategorías para primera categoría
    if (allCategories.length > 0) {
      console.log('\n4. Creando subcategorías...');
      const firstCategory = allCategories[0];
      
      await createSubcategory(firstCategory.id, 'Item 1', 15000);
      await createSubcategory(firstCategory.id, 'Item 2', 10000);
    }

    // 5. Obtener resumen final
    console.log('\n5. Obteniendo resumen final...');
    await getBudgetSummary(costCenterId);

  } catch (error) {
    console.error('Error en flujo completo:', error);
  }
}

// Ejecutar flujo completo
completeBudgetFlow();
```

---

# 📊 Ejemplo en Vue.js (Composable)

```javascript
// composables/useBudget.js

import { ref, computed } from 'vue'

export function useBudget() {
  const token = localStorage.getItem('token')
  const baseUrl = 'http://localhost:8080/api/budget'

  // Estado
  const categories = ref([])
  const subcategories = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Headers
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }

  // Funciones
  async function fetchCategories(costCenterId) {
    loading.value = true
    try {
      const response = await fetch(
        `${baseUrl}/categories?costCenterId=${costCenterId}`,
        { headers }
      )
      categories.value = (await response.json()).categories
      error.value = null
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function createCategory(costCenterId, name, amount) {
    loading.value = true
    try {
      const response = await fetch(`${baseUrl}/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          costCenterId,
          name,
          amount
        })
      })
      const data = await response.json()
      categories.value.push(data.category)
      return data.category
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function createSubcategory(categoryId, name, amount) {
    loading.value = true
    try {
      const response = await fetch(`${baseUrl}/subcategories`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          budgetCategoryId: categoryId,
          name,
          amount
        })
      })
      const data = await response.json()
      return data.subcategory
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  async function getBudgetSummary(costCenterId) {
    loading.value = true
    try {
      const response = await fetch(
        `${baseUrl}/summary?costCenterId=${costCenterId}`,
        { headers }
      )
      const data = await response.json()
      return data
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    subcategories,
    loading,
    error,
    fetchCategories,
    createCategory,
    createSubcategory,
    getBudgetSummary
  }
}
```

## Uso en Componente

```vue
<template>
  <div class="budget">
    <button @click="assignBudget" :disabled="loading">
      {{ loading ? 'Cargando...' : 'Asignar Presupuesto' }}
    </button>

    <div v-if="error" class="error">{{ error }}</div>

    <div class="categories">
      <div v-for="category in categories" :key="category.id" class="category">
        <h3>{{ category.name }}</h3>
        <p>Presupuesto: ${{ category.amount }}</p>
        <p>Asignado: ${{ category.subtotal }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useBudget } from '@/composables/useBudget'

const { categories, loading, error, fetchCategories, createCategory, getBudgetSummary } = useBudget()

const costCenterId = 'uuid-del-centro'

async function assignBudget() {
  await createCategory(costCenterId, 'Recursos Humanos', 50000)
  await createCategory(costCenterId, 'Logística', 20000)
  await fetchCategories(costCenterId)
}

onMounted(() => {
  fetchCategories(costCenterId)
})
</script>
```

---

**Versión:** 1.0.0  
**Última actualización:** 2026-01-05
