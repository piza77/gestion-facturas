## 🔄 API de Cambio de Estados - Ejemplos

### Endpoint: Cambiar Estado de Factura

```
PATCH /api/invoices/:id/status
```

### Autenticación
Requiere Bearer Token en header:
```
Authorization: Bearer <JWT_TOKEN>
```

---

## Ejemplos por Estado

### 1️⃣ Cambiar a RADICADO

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/invoices/123e4567-e89b-12d3-a456-426614174000/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "filed"
  }'
```

**Response (200 OK):**
```json
{
  "message": "Estado actualizado exitosamente",
  "invoice": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "invoice_number": "INV-2025-001",
    "status": "filed",
    "filed_at": "2025-12-15T14:30:45.000Z",
    "filed_by": "user-uuid-12345",
    "provider_name": "Proveedor XYZ",
    "total": 1500000
  }
}
```

---

### 2️⃣ Cambiar a CONTABILIZADO

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/invoices/123e4567-e89b-12d3-a456-426614174000/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accounted"
  }'
```

**Response (200 OK):**
```json
{
  "message": "Estado actualizado exitosamente",
  "invoice": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "invoice_number": "INV-2025-001",
    "status": "accounted",
    "filed_at": "2025-12-15T14:30:45.000Z",
    "filed_by": "user-uuid-12345",
    "accounted_at": "2025-12-15T15:45:30.000Z",
    "accounted_by": "user-uuid-67890",
    "accounting_municipality": "Bogotá",
    "accounting_registration_date": "2025-12-15"
  }
}
```

---

### 3️⃣ Cambiar a PAGADO

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/invoices/123e4567-e89b-12d3-a456-426614174000/status \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "status": "paid"
  }'
```

**Response (200 OK):**
```json
{
  "message": "Estado actualizado exitosamente",
  "invoice": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "invoice_number": "INV-2025-001",
    "status": "paid",
    "filed_at": "2025-12-15T14:30:45.000Z",
    "filed_by": "user-uuid-12345",
    "accounted_at": "2025-12-15T15:45:30.000Z",
    "accounted_by": "user-uuid-67890",
    "paid_at": "2025-12-15T16:20:15.000Z",
    "paid_by": "user-uuid-11111",
    "payment_amount": 1500000,
    "payment_date": "2025-12-15"
  }
}
```

---

## ❌ Errores y Respuestas

### Error: Transición Inválida

**Request:**
```bash
# Intentar ir de PENDIENTE directamente a CONTABILIZADO (saltando RADICADO)
curl -X PATCH http://localhost:3000/api/invoices/123e4567-e89b-12d3-a456-426614174000/status \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accounted"
  }'
```

**Response (400 Bad Request):**
```json
{
  "error": "No se puede cambiar de pending a accounted"
}
```

---

### Error: Factura No Encontrada

**Request:**
```bash
curl -X PATCH http://localhost:3000/api/invoices/invalid-id/status \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "filed"
  }'
```

**Response (404 Not Found):**
```json
{
  "error": "Factura no encontrada"
}
```

---

### Error: Cambiar Documento Finalizado

**Request:**
```bash
# Intentar cambiar estado de una factura que ya está PAGADA
curl -X PATCH http://localhost:3000/api/invoices/123e4567-e89b-12d3-a456-426614174000/status \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "accounted"
  }'
```

**Response (400 Bad Request):**
```json
{
  "error": "No se puede cambiar de paid a accounted"
}
```

---

### Error: Sin Autenticación

**Response (401 Unauthorized):**
```json
{
  "error": "Token inválido o no proporcionado"
}
```

---

## 📊 Campos que se Actualizan Automáticamente

### Al cambiar a RADICADO

```javascript
{
  status: "filed",
  filed_at: "2025-12-15T14:30:45.123Z",  // Automático
  filed_by: "user-uuid-actual"            // Automático
}
```

### Al cambiar a CONTABILIZADO

```javascript
{
  status: "accounted",
  accounted_at: "2025-12-15T15:45:30.456Z",  // Automático
  accounted_by: "user-uuid-actual"           // Automático
}
```

### Al cambiar a PAGADO

```javascript
{
  status: "paid",
  paid_at: "2025-12-15T16:20:15.789Z",  // Automático
  paid_by: "user-uuid-actual"            // Automático
}
```

---

## 🔍 Obtener Información de Factura con Estados

### Endpoint: GET

```bash
GET /api/invoices/:id
```

**Response (Ejemplo):**
```json
{
  "invoice": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "invoice_number": "INV-2025-001",
    "status": "paid",
    "provider_name": "Proveedor XYZ",
    "total": 1500000,
    
    // Timeline completa
    "filed_at": "2025-12-15T14:30:45.000Z",
    "filed_by": "user-uuid-12345",
    "accounted_at": "2025-12-15T15:45:30.000Z",
    "accounted_by": "user-uuid-67890",
    "paid_at": "2025-12-15T16:20:15.000Z",
    "paid_by": "user-uuid-11111",
    
    // Información completa
    "issue_date": "2025-12-15",
    "description": "Factura de servicios",
    "created_at": "2025-12-15T13:00:00.000Z"
  }
}
```

---

## 📋 Filtrar por Estado

### Endpoint: GET con parámetros

```bash
GET /api/invoices?status=filed&limit=20&offset=0
```

**Parámetros:**
- `status`: pending, filed, accounted, paid, cancelled
- `limit`: Cantidad de resultados (default: 20)
- `offset`: Número de registros a saltar

**Response:**
```json
{
  "invoices": [
    {
      "id": "123e...",
      "invoice_number": "INV-2025-001",
      "status": "filed",
      "filed_at": "2025-12-15T14:30:45.000Z",
      ...
    },
    {
      "id": "456e...",
      "invoice_number": "INV-2025-002",
      "status": "filed",
      "filed_at": "2025-12-15T10:15:00.000Z",
      ...
    }
  ],
  "pagination": {
    "total": 45,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

---

## 🧪 Script de Prueba (Node.js)

```javascript
const axios = require('axios');

const API_URL = 'http://localhost:3000/api';
const TOKEN = 'your-jwt-token-here';

async function testStateTransition() {
  try {
    // 1. Obtener una factura
    const getResponse = await axios.get(
      `${API_URL}/invoices/123e4567-e89b-12d3-a456-426614174000`,
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    
    const invoice = getResponse.data.invoice;
    console.log('Estado actual:', invoice.status);
    
    // 2. Cambiar a RADICADO
    if (invoice.status === 'pending') {
      const filedResponse = await axios.put(
        `${API_URL}/invoices/${invoice.id}/status`,
        { status: 'filed' },
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      console.log('✓ Radicada:', filedResponse.data.invoice.filed_at);
    }
    
    // 3. Cambiar a CONTABILIZADO
    const accountedResponse = await axios.put(
      `${API_URL}/invoices/${invoice.id}/status`,
      { status: 'accounted' },
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    console.log('✓ Contabilizada:', accountedResponse.data.invoice.accounted_at);
    
    // 4. Cambiar a PAGADO
    const paidResponse = await axios.put(
      `${API_URL}/invoices/${invoice.id}/status`,
      { status: 'paid' },
      { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    console.log('✓ Pagada:', paidResponse.data.invoice.paid_at);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testStateTransition();
```

---

## 📝 Notas Importantes

1. **IDs de UUID**: Los UUIDs se generan automáticamente en la BD
2. **Fechas ISO 8601**: Todas las fechas vienen en formato ISO
3. **Usuario Actual**: El `filed_by`, `accounted_by`, `paid_by` se obtienen del token JWT
4. **Sin Reversión**: Los estados no se pueden cambiar hacia atrás
5. **Idempotencia**: Cambiar a un estado que no es el siguiente retorna error

---

**Versión de API**: 1.0
**Última actualización**: 15 de Diciembre de 2025
