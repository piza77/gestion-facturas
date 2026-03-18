# MANUAL DE USUARIO
## Sistema de Gestión de Facturas v1.3.0

---

## **TABLA DE CONTENIDOS**

1. [Introducción y Alcance](#introducción-y-alcance)
2. [Requisitos de Conocimiento](#requisitos-de-conocimiento)
3. [Descripción General del Sistema](#descripción-general-del-sistema)
4. [Procedimientos de Acceso](#procedimientos-de-acceso)
5. [Gestión de Facturas](#gestión-de-facturas)
6. [Gestión de Presupuestos](#gestión-de-presupuestos)
7. [Reportes y Análisis](#reportes-y-análisis)
8. [Administración de Usuarios](#administración-de-usuarios)
9. [Configuración y Parámetros](#configuración-y-parámetros)
10. [Políticas de Seguridad](#políticas-de-seguridad)
11. [Información de Soporte](#información-de-soporte)
12. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## **INTRODUCCIÓN Y ALCANCE**

### Propósito del Sistema

El **Sistema de Gestión de Facturas (SGF)** es una aplicación empresarial integral diseñada para:

- ✓ Registrar y gestionar facturas proveedoras
- ✓ Controlar presupuestos y gastos por departamento
- ✓ Generar reportes analíticos y financieros
- ✓ Mantener auditoría completa de operaciones
- ✓ Facilitar la toma de decisiones financieras
- ✓ Asegurar cumplimiento normativo (SAT, contabilidad)

### Alcance

#### Incluido en el Sistema:

```
✓ Gestión de 5,000+ facturas anuales
✓ Seguimiento de 150+ proveedores
✓ Control de presupuestos por 12 centros de costo
✓ Cálculo automático de impuestos (IVA)
✓ Reportes mensuales, trimestrales y anuales
✓ Exportación a Excel, PDF y CSV
✓ Auditoría de todos los cambios
✓ Gestión de usuarios y permisos
✓ Búsqueda y filtrado avanzado
✓ Gráficos de análisis y tendencias
```

#### No Incluido en el Sistema:

```
✗ Integración contable (SAT) - En desarrollo
✗ Pagos electrónicos - Versión 2.0
✗ Facturación electrónica - En desarrollo
✗ Integraciones con proveedores - Futuro
```

### Características Principales

| Característica | Descripción | Beneficio |
|---|---|---|
| **Dashboard interactivo** | Vista general de KPIs en tiempo real | Toma de decisiones rápida |
| **Cálculo automático de IVA** | Sistema ajusta tasa según fecha | Reducción de errores |
| **Presupuestos inteligentes** | Alertas cuando se alcanza límite | Control de gastos |
| **Reportes customizables** | Crear reportes según necesidad | Análisis específico |
| **Auditoría completa** | Registro de quién, qué, cuándo | Cumplimiento normativo |
| **Interfaz intuitiva** | Diseño simple y clara | Reducción de capacitación |

---

## **REQUISITOS DE CONOCIMIENTO**

### 1. Conocimientos Mínimos Requeridos

#### Para Usuarios Básicos (Registradores):

```
✓ Manejo básico de computadora
✓ Uso de navegador web (Chrome, Firefox)
✓ Conocimiento de conceptos contables básicos
  - Factura
  - Proveedor
  - Monto
  - IVA/Impuestos
✓ Capacidad de usar tablas y formularios
✓ Lectura y comprensión en español
✓ Velocidad de escritura mínima: 30 palabras por minuto
```

#### Para Supervisores:

```
✓ Todo lo anterior +
✓ Conocimiento de presupuestos
✓ Conocimiento de centros de costo
✓ Capacidad de análisis de datos
✓ Experiencia supervisando equipos
✓ Entendimiento de reportes financieros
```

#### Para Administradores:

```
✓ Todo lo anterior +
✓ Conocimiento de administración de usuarios
✓ Entendimiento de permisos y roles
✓ Experiencia con sistemas informáticos
✓ Capacidad de solucionar problemas
✓ Conocimiento de backup y recuperación
```

### 2. Preparación Previa Recomendada

Antes de usar el sistema, asegúrese de:

```
☐ Completar la capacitación inicial (4 horas)
☐ Revisar este manual (30 minutos)
☐ Completar los ejercicios prácticos (2 horas)
☐ Realizar pruebas en ambiente de desarrollo
☐ Conocer su rol y permisos específicos
☐ Tener sus datos de acceso seguros
☐ Entender la política de seguridad
```

### 3. Nivel de Acceso según Rol

#### Tabla de Permisos

| Acción | Usuario | Supervisor | Contador | Admin |
|--------|---------|-----------|----------|-------|
| Crear factura | ✓ | ✓ | ✓ | ✓ |
| Editar factura (propia) | ✓ | ✓ | ✓ | ✓ |
| Editar factura (otros) | ✗ | ✓ | ✓ | ✓ |
| Eliminar factura | ✗ | ✗ | ✓ | ✓ |
| Aprobar factura | ✗ | ✓ | ✓ | ✓ |
| Ver reportes | ✓ | ✓ | ✓ | ✓ |
| Crear presupuesto | ✗ | ✓ | ✓ | ✓ |
| Gestionar usuarios | ✗ | ✗ | ✗ | ✓ |
| Ver auditoría | ✗ | ✗ | ✓ | ✓ |
| Hacer respaldos | ✗ | ✗ | ✗ | ✓ |
| Cambiar configuración | ✗ | ✗ | ✗ | ✓ |

---

## **DESCRIPCIÓN GENERAL DEL SISTEMA**

### Interfaz Principal

```
┌─────────────────────────────────────────────────────────┐
│ SISTEMA DE GESTIÓN DE FACTURAS v1.3.0                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MENÚ LATERAL                    CONTENIDO PRINCIPAL   │
│                                                         │
│  🏠 Dashboard          │  DASHBOARD                    │
│                        │                               │
│  📄 Facturas          │  ┌─────────────────────────┐  │
│                        │  │ KPIs PRINCIPALES:       │  │
│  💰 Presupuestos      │  │ • Facturas este mes: 45 │  │
│                        │  │ • Monto total: $125,450│  │
│  📊 Reportes          │  │ • Presupuesto usado: 73%│  │
│                        │  │ • Pendientes: 12        │  │
│  👥 Administración    │  └─────────────────────────┘  │
│                        │                               │
│  ⚙️  Configuración     │  [Gráficos y análisis]      │
│                        │                               │
│  ❓ Ayuda              │                               │
│                        │                               │
│  🚪 Logout             │                               │
│                        │                               │
└─────────────────────────────────────────────────────────┘

En la esquina superior derecha:
┌──────────────────────────────┐
│ 👤 Juan Pérez      🔔 🔧 🚪│
│ Admin de Sistema             │
└──────────────────────────────┘
```

### Módulos Principales

#### 1. Dashboard
- **Vista rápida**: Métricas clave de la empresa
- **Gráficos**: Tendencias y distribuciones
- **Alertas**: Presupuestos cercanos al límite
- **Acceso rápido**: Recientes y más utilizados

#### 2. Facturas
- **Crear**: Registrar nuevas facturas
- **Buscar**: Localizar facturas existentes
- **Editar**: Modificar facturas no aprobadas
- **Aprobar**: Cambiar estado de facturas
- **Exportar**: Descargar en Excel/PDF

#### 3. Presupuestos
- **Crear**: Establecer presupuestos nuevos
- **Asignar**: Distribuir por ítems
- **Monitorear**: Ver consumo en tiempo real
- **Alertar**: Avisos de sobregiro

#### 4. Reportes
- **Mensuales**: Resumen del mes
- **Analíticos**: Análisis por categoría
- **Comparativos**: Año a año
- **Personalizados**: Crear reportes propios

#### 5. Administración
- **Usuarios**: Crear y gestionar usuarios
- **Permisos**: Asignar roles
- **Auditoría**: Ver historial de cambios
- **Configuración**: Parámetros del sistema

---

## **PROCEDIMIENTOS DE ACCESO**

### 1. Primer Acceso

#### Paso 1: Obtener Credenciales
```
• Su administrador le entregará:
  - Email: juan.perez@empresa.com
  - Contraseña temporal: TempPass123!
```

#### Paso 2: Acceder al Sistema
```
1. Abra navegador web (Chrome, Firefox, Edge recomendado)
2. Ingrese URL: https://gestion-facturas.com
3. Verá pantalla de Login
```

#### Paso 3: Login Inicial
```
┌──────────────────────────────────────┐
│    SISTEMA DE GESTIÓN FACTURAS       │
│                                      │
│  Email:     [juan.perez@empresa]    │
│  Contraseña:[TempPass123!        ]   │
│                                      │
│  ☐ Recuérdame                       │
│                                      │
│         [ INGRESAR ]                │
│                                      │
│    ¿Olvidó su contraseña?           │
│    ¿Primera vez aquí?               │
└──────────────────────────────────────┘

Presione [ INGRESAR ]
```

#### Paso 4: Cambiar Contraseña
```
En el primer acceso, DEBE cambiar contraseña:

┌─────────────────────────────────────┐
│ CAMBIAR CONTRASEÑA                  │
│                                     │
│ Contraseña temporal:                │
│ [TempPass123!                    ]  │
│                                     │
│ Contraseña nueva:                   │
│ [•••••••••••••••              ]  │
│ (Mínimo 8 caracteres, 1 mayúscula, │
│  1 número, 1 símbolo)              │
│                                     │
│ Confirmar contraseña:               │
│ [•••••••••••••••              ]  │
│                                     │
│  [ ACTUALIZAR ]  [ CANCELAR ]       │
└─────────────────────────────────────┘

REQUISITOS DE CONTRASEÑA:
✓ Mínimo 8 caracteres
✓ Al menos 1 mayúscula (A-Z)
✓ Al menos 1 número (0-9)
✓ Al menos 1 símbolo (!@#$%^&*)
✓ No usar nombre de usuario
✓ No usar palabras comunes

EJEMPLO VÁLIDO: MyPass@123

```

### 2. Acceso Posterior

#### Opción 1: Ingreso Directo
```
1. URL: https://gestion-facturas.com
2. Email: su_email@empresa.com
3. Contraseña: su contraseña personal
4. Click [ INGRESAR ]
5. ¡Sistema abierto!
```

#### Opción 2: Recordar Credenciales
```
☑ Marque "Recuérdame" si es en equipo personal
  (No lo haga en computadora compartida)
→ Próximo acceso será más rápido
```

#### Opción 3: Recuperar Contraseña
```
Si olvidó su contraseña:

1. Click "¿Olvidó su contraseña?" en login
2. Ingrese su email: juan.perez@empresa.com
3. Revise su email (puede tomar 5 minutos)
4. Click en el enlace de recuperación
5. Establezca nueva contraseña
6. Intente login nuevamente
```

### 3. Cerrar Sesión (Logout)

#### Método 1: Menú Superior
```
1. Haga click en su nombre en esquina superior derecha
2. Verá menú desplegable:
   - Perfil
   - Configuración
   - Cambiar Contraseña
   - Logout ← Click aquí
3. Sistema le desconecta
```

#### Método 2: Automático
```
• La sesión expira automáticamente después de:
  - 30 minutos de inactividad
  - 4 horas desde login (aunque use el sistema)
• Será redirigido a login automáticamente
• Sus datos están seguros
```

### 4. Cambiar Contraseña

#### Cambio Planificado
```
1. Click en su nombre → Cambiar Contraseña
2. Ingrese contraseña actual: [•••••••]
3. Ingrese contraseña nueva: [•••••••]
   (Debe cumplir requisitos)
4. Confirme: [•••••••]
5. Click [ ACTUALIZAR ]
```

#### Cambio Forzado
```
Si el sistema le solicita:
- El administrador puede requerir cambio
- Se le notificará en el dashboard
- Podrá continuar después de cambiar
```

---

## **GESTIÓN DE FACTURAS**

### 1. Crear Nueva Factura

#### Acceso al Formulario

```
MÉTODO 1: Desde menú
┌─ Menú lateral izquierdo
│  └─ 📄 Facturas
│     └─ Botón [ + Nueva Factura ]

MÉTODO 2: Desde dashboard
┌─ Botón flotante azul (esquina inferior derecha)
│  └─ [ Nueva Factura ]

MÉTODO 3: Usar atajo de teclado
└─ Presione: Ctrl + N
```

#### Formulario de Creación

```
┌─────────────────────────────────────────────────┐
│ CREAR NUEVA FACTURA                             │
├─────────────────────────────────────────────────┤
│                                                 │
│ Número de Factura: *                           │
│ [INV-2026-00123                             ] │
│ (Generado automáticamente, puede editar)      │
│                                                 │
│ Proveedor: * ⓘ                                 │
│ [🔍 Seleccione o escriba nombre            ] │
│  └─ Lista con 150+ proveedores existe        │
│  └─ O click [ + Crear Proveedor Nuevo ]     │
│                                                 │
│ Monto: * ⓘ                                     │
│ [         1,250.00                          ] │
│ Ej: No incluir símbolos, solo números       │
│                                                 │
│ Fecha de Factura: *                           │
│ [📅 seleccionar fecha                       ] │
│ (La fecha actual pro defecto)                 │
│                                                 │
│ Vencimiento (opcional): ⓘ                     │
│ [📅 seleccionar fecha                       ] │
│                                                 │
│ Centro de Costo:                              │
│ [🔽 Seleccionar centro                      ] │
│  - Administración                             │
│  - Ventas                                     │
│  - Operaciones                                │
│                                                 │
│ Descripción:                                   │
│ [                                            ] │
│ [    Facturas de servicios profesionales    ] │
│ [    (máximo 500 caracteres)               ] │
│                                                 │
│ ──────────────────────────────────────────────│
│                                                 │
│ CÁLCULOS AUTOMÁTICOS:                        │
│ ┌────────────────────────────────────────────┐ │
│ │ Monto:              $1,250.00              │ │
│ │ Tasa IVA (16%):     $   200.00             │ │
│ │ TOTAL:              $1,450.00              │ │
│ └────────────────────────────────────────────┘ │
│                                                 │
│  [ 🟢 GUARDAR ]  [ ❌ CANCELAR ]              │
│                                                 │
└─────────────────────────────────────────────────┘

Leyenda:
* = Campo obligatorio
ⓘ = Información adicional (hover para ver)
🔍 = Búsqueda / autocompletado
🔽 = Desplegable selección
```

#### Paso a Paso: Crear Factura

```
PASO 1: Seleccionar Proveedor (1-2 minutos)
───────────────────────────────────────────
1. Click en campo "Proveedor"
2. Empiece a escribir nombre (ej: "Servi")
3. Sistema filtra automáticamente
4. Vea opciones:
   - ✓ Servicios ABC S.A.
   - ✓ ServiExpress Ltda.
   - (+) Crear proveedor nuevo
5. Click en la opción correcta

⚠️ Si el proveedor no existe:
   1. Click en [ + Crear Proveedor Nuevo ]
   2. Ingrese:
      - Nombre: Nuevo Proveedor
      - RFC: XXXXX123456ABC
      - Email: contacto@proveedor.com (opcional)
      - Teléfono: (opcional)
   3. Click [ Guardar ]
   4. Sistema lo agrega y selecciona


PASO 2: Ingresar Monto (1 minuto)
───────────────────────────────┐
1. Click en campo "Monto"
2. Escriba solo números: 1250
3. Sistema formatea automáticamente: 1,250.00
4. Observe que calcula IVA en tiempo real

⚠️ Errores comunes:
   ✗ Escribir: $1,250.00  → Escribe: 1250
   ✗ Escribir: 1.250,00  → Escribe: 1250


PASO 3: Seleccionar Fecha (1 minuto)
─────────────────────────────────────
1. Click en calendario "Fecha de Factura"
2. Aparece selector de fecha:
   
   ◀ Marzo 2026 ▶
   
   Do  Lu  Ma  Mi  Ju  Vi  Sa
    1   2   3   4   5   6   7
    8   9  10  11  12  13  14 ← Hoy (14-03)
   15  16  17  18  19  20  21
   22  23  24  25  26  27  28
   29  30  31

3. Haga click en día deseado
4. Si necesita otro mes: ◀ o ▶

⚠️ Importante:
   - Fecha debe ser ≤ hoy
   - Si es futuro: no se puede


PASO 4: Llenar Datos Opcionales (1-2 minutos)
──────────────────────────────────────────────
1. Centro de Costo: 
   - Obligatorio si su empresa usa
   - Ejemplos: Administración, Ventas, IT
   
2. Vencimiento:
   - El sistema sugiere 30 días por defecto
   - Puede cambiar si es diferente
   
3. Descripción:
   - Opcional pero RECOMENDADO
   - Ayuda para futuras búsquedas
   - Ej: "Auditoría externa Q1 2026"


PASO 5: Validar Cálculos (30 segundos)
───────────────────────────────────────
Antes de guardar, verifique:

✓ Monto correcto
✓ Proveedor correcto
✓ Fecha correcta (no Future)
✓ Cálculo de IVA correcto

Si todo está bien → [ 🟢 GUARDAR ]

RESULTADO ESPERADO:
┌────────────────────────────────┐
│ ✓ Factura guardada             │
│ Número: INV-2026-00123         │
│ ID: #789456                     │
│ Estado: BORRADOR               │
│                                │
│ Próximos pasos:                │
│ [ Ver Factura ] [ Aprobar ]   │
│ [ Exportar ] [ Cerrar ]       │
└────────────────────────────────┘
```

### 2. Buscar y Filtrar Facturas

#### Acceso a Búsqueda

```
Opción 1: Desde Menú
└─ 📄 Facturas → Pestaña "Búsqueda"

Opción 2: Más rápido
└─ Presione Ctrl + F
```

#### Interfaz de Búsqueda

```
┌─────────────────────────────────────────────────┐
│ BUSCAR FACTURAS                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ Búsqueda rápida:                               │
│ [🔍 Número, proveedor o monto...           ] │
│                                                 │
│ FILTROS AVANZADOS:                            │
│                                                 │
│ Estado: ☐ BORRADOR  ☐ PENDIENTE              │
│         ☐ APROBADA  ☐ CANCELADA              │
│                                                 │
│ Rango de Fechas:                              │
│ Desde [📅 01-01-2026]  Hasta [📅 14-03-2026]│
│                                                 │
│ Proveedor:                                     │
│ [🔽 Todos los proveedores                   ] │
│                                                 │
│ Centro de Costo:                              │
│ [🔽 Administración                          ] │
│                                                 │
│ Rango de Montos:                              │
│ Desde [     0.00]  Hasta [999,999.00]        │
│                                                 │
│ [ 🔍 BUSCAR ]  [ ↺ LIMPIAR ]                │
│                                                 │
└─────────────────────────────────────────────────┘

RESULTADOS:
┌──────────────────────────────────────────────────┐
│ Se encontraron 47 facturas                      │
│                                                  │
│ Número │ Proveedor     │ Monto    │ Estado  │... │
│─────────────────────────────────────────────────│
│INV-001 │ Servicios ABC │1,250.00 │Aprobada │   │
│INV-002 │ ServiExpress  │  850.50 │Pendiente│   │
│INV-003 │ Suministros   │2,500.00 │Borrador │   │
│        │               │         │        │   │
│ [1 de 5 páginas]  << < 1 2 3 > >>           │
└──────────────────────────────────────────────────┘
```

#### Ejemplos de Búsqueda Comun

```
BÚSQUEDA 1: Facturas de Marzo "Servicios ABC"
───────────────────────────────────────────────
1. Filtro: Rango Fechas: 01-03-2026 a 31-03-2026
2. Filtro: Proveedor = "Servicios ABC"
3. Click [ 🔍 BUSCAR ]
→ Resultado: 8 facturas

BÚSQUEDA 2: Facturas PENDIENTES de aprobación
──────────────────────────────────────────────
1. Filtro: Estado = ☑ PENDIENTE
2. Click [ 🔍 BUSCAR ]
→ Resultado: 12 facturas sin aprobar

BÚSQUEDA 3: Facturas > $5,000
──────────────────────────────
1. Filtro: Rango de Montos
2. Desde: 5,000.00
3. Hasta: 999,999.00
4. Click [ 🔍 BUSCAR ]
→ Resultado: 34 facturas

BÚSQUEDA 4: Facturas de HOY
──────────────────────────
1. Filtro: Rango Fechas
2. Desde: 14-03-2026
3. Hasta: 14-03-2026
4. Click [ 🔍 BUSCAR ]
→ Resultado: 5 facturas

ATAJO RÁPIDO: Escriba en búsqueda rápida
───────────────────────────────────────
"INV-2026"  → Busca por número
"Servicios" → Busca por proveedor
"1250"      → Busca por monto
```

### 3. Editar Factura

#### Limitaciones de Edición

```
ESTADO          ✓ EDITABLE    ✗ NO EDITABLE
─────────────────────────────────────────────
BORRADOR        ✓ Sí          Puede cambiar todo
PENDIENTE       ✓ Limitado     Solo descripción
APROBADA        ✗ No          Bloqueada para editar
CANCELADA       ✗ No          Bloqueada para editar

REGLA: Solo contador/admin puede desbloquear
```

#### Proceso de Edición

```
1. Busque la factura (ver sección anterior)
2. Haga click en la fila o en botón [ ✏️ EDITAR ]
3. Se abre formulario de edición

   ┌──────────────────────────┐
   │ EDITAR FACTURA INV-001   │
   │                          │
   │ Número: INV-001          │
   │ [No se puede cambiar]   │
   │                          │
   │ Proveedor: Servicios ABC │
   │ [Puede editar]          │
   │ Monto: [1,250.00]       │
   │ [Puede editar]          │
   │ Fecha: 01-03-2026       │
   │ [Puede editar]          │
   │                          │
   │ Descripción: (editable) │
   │ [..........]             │
   │                          │
   │ [💾 GUARDAR] [❌ CANCEL]│
   └──────────────────────────┘

4. Realice cambios necesarios
5. Click [ 💾 GUARDAR ]
6. Se registra en auditoría:
   - Quién editó
   - Qué cambió
   - Cuándo fue
```

### 4. Aprobar Factura

#### Quién Puede Aprobar

```
✓ Contador (rol Contador)
✓ Supervisor de compras
✓ Administrador
✗ Usuario regular NO puede
```

#### Proceso de Aprobación

```
DESDE LA LISTA:
1. Búsqueda rápida de facturas estado PENDIENTE
2. Marque ☑ fila de factura
3. Botón [ ✓ APROBAR ] aparece
4. Click en [ ✓ APROBAR ]
5. Sistema pide confirmación:

   ┌─────────────────────────────┐
   │ ¿Está seguro?              │
   │                             │
   │ Factura: INV-001           │
   │ Monto: $1,250.00           │
   │ Proveedor: Servicios ABC   │
   │                             │
   │ [ ✓ CONFIRMAR ]  [❌ CANCEL]│
   └─────────────────────────────┘

6. Click [ ✓ CONFIRMAR ]
7. Factura cambia a estado APROBADA:

   ┌──────────────────────┐
   │ ✓ Aprobación exitosa │
   │ Factura: INV-001     │
   │ Nuevo estado: APROBADA│
   └──────────────────────┘

DESDE EL DETALLE:
1. Click en factura para verla en detalle
2. Botón [ ✓ APROBAR ] en panel derecho
3. Siga mismo proceso anterior
```

#### Auditoría de Aprobación

```
Cada aprobación registra:
├─ Usuario que aprobó: juan.perez@empresa.com
├─ Hora de aprobación: 14-03-2026 10:32:15
├─ IP del usuario: 192.168.1.100
├─ Navegador usado: Chrome 120
├─ Cambios realizados: Estado PENDIENTE → APROBADA
└─ Disponible en pestaña "Historial"

PARA VER AUDITORÍA:
1. Abra factura en detalle
2. Pestaña "Historial de Cambios"
3. Vea todos los cambios realizados
```

### 5. Exportar Factura

#### Formatos Disponibles

```
┌────────────────────────────────────┐
│ EXPORTAR FACTURA                   │
│ Seleccione formato:                │
├────────────────────────────────────┤
│ [📊] Excel (.xlsx)                 │
│     └─ Ideal para análisis en        │
│        cálculos adicionales        │
│                                    │
│ [📄] PDF (.pdf)                    │
│     └─ Ideal para imprimir o        │
│        enviar por email            │
│                                    │
│ [📋] CSV (.csv)                    │
│     └─ Para importar en otros       │
│        sistemas                    │
│                                    │
│  [ DESCARGAR ]                     │
└────────────────────────────────────┘
```

#### Características por Formato

```
EXCEL (.xlsx):
├─ Incluye: Factura + cálculos
├─ Fórmulas dinámicas si edita
├─ Puedo añadir datos personales
├─ Profesional para análisis
└─ Tamaño: ~50 KB

PDF (.pdf):
├─ Incluye: Logo empresa, número folio
├─ Formato listo para imprimir
├─ Protegido contra cambios
├─ Profesional para compartir
└─ Tamaño: ~200 KB

CSV (.csv):
├─ Datos puros sin formato
├─ Compatible con Excel, Google Sheets
├─ Ideal para análisis de datos
├─ Mínimo peso: ~5 KB
└─ Sin gráficos ni fórmulas
```

#### Exportar Múltiples

```
EXPORTAR MUCHAS FACTURAS A LA VEZ:

1. Vaya a → 📄 Facturas
2. Realice búsqueda con filtros
   (Ej: Mes de marzo, Proveedor ABC)
3. Click botón [ ⬇️ EXPORTAR LOTE ]
4. Seleccione formato (Excel recomendado)
5. Sistema genera archivo con:
   - Todas las facturas encontradas
   - Con subtotales por proveedor
   - Con totales generales
   - Listo para reportes

Tamaño máximo de lote: 5,000 facturas
Tiempo de procesamiento: 5-30 segundos
```

---

## **GESTIÓN DE PRESUPUESTOS**

### 1. Entender los Presupuestos

#### Conceptos Básicos

```
PRESUPUESTO = Cantidad de dinero asignada
│             para un período específico
│
├─ Período: 1 mes, 1 trimestre o 1 año
├─ Monto total: Dinero disponible
├─ Status: Activo o Vencido
└─ Alertas: Cuando se alcanza 80% de uso

ÍTEMS DEL PRESUPUESTO = Subcategorías dentro
│                        del presupuesto
│
├─ Ejemplo: Presupuesto "Administración" con ítems:
│   - Servicios profesionales: $5,000
│   - Arriendo oficina: $10,000
│   - Servicios básicos: $2,000
│   - Total Presupuesto: $17,000
│
└─ Permite control granular por categoría

CONSUMO = Facturas asignadas al presupuesto

DISPONIBLE = Presupuesto - Consumo
             Lo que queda por gastar

ALERTA = Aviso cuando consumo > 80%
         Impide crear facturas si alcanza 100%
```

#### Ejemplo Visual

```
Presupuesto Administración 2026: $50,000

Ítems: ┌─────────────────────────────────────┐
       │ Servicios:           $15,000         │
       │ ████████████░░░░░░░░░░░░░░░░░░░░░░ │
       │ Consumido: $12,000   Disponible: $3K│
       │ Avance: 80% ⚠️ ALERT             │
       │                                     │
       │ Suministros:          $20,000        │
       │ ███████░░░░░░░░░░░░░░░░░░░░░░░░░░ │
       │ Consumido: $ 7,000   Disponible: $13K
       │ Avance: 35%                         │
       │                                     │
       │ Viáticos:            $15,000        │
       │ ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
       │ Consumido: $     0   Disponible: $15K
       │ Avance: 0%                          │
       └─────────────────────────────────────┘

Total: $50,000
Consumo Total: $19,000 (38%)
Disponible: $31,000
```

### 2. Crear Presupuesto (Solo Administrador/Contador)

```
1. Menú → 💰 Presupuestos
2. Click [ + Nuevo Presupuesto ]

┌────────────────────────────────────┐
│ CREAR PRESUPUESTO                  │
├────────────────────────────────────┤
│                                    │
│ Nombre: *                          │
│ [Administración 2026 Q2         ] │
│                                    │
│ Monto Total: *                     │
│ [        50,000.00              ] │
│                                    │
│ Período:                           │
│ ☑ Mensual   ☐ Trimestral ☐ Anual  │
│                                    │
│ Centro de Costo: *                │
│ [Administración                  ] │
│                                    │
│ Inicio: [📅 01-04-2026]           │
│ Fin:    [📅 30-06-2026]           │
│                                    │
│ Alerta en: [_80_%] de consumo     │
│                                    │
│ [ + AGREGAR ÍTEM ]               │
│                                    │
│ [ 💾 GUARDAR ]  [ ❌ CANCELAR ]   │
└────────────────────────────────────┘

3. Rellene los datos
4. Click [ + AGREGAR ÍTEM ] para cada categoría
```

### 3. Asignar Ítems a Presupuesto

```
Después de llenar datos principales:

[ + AGREGAR ÍTEM ]
        ↓
┌───────────────────────────────────┐
│ ÍTEM DEL PRESUPUESTO              │
├───────────────────────────────────┤
│                                   │
│ Nombre del Ítem: *                │
│ [Servicios profesionales       ] │
│                                   │
│ Monto asignado: *                │
│ [     5,000.00               ] │
│ (Parte del presupuesto total)    │
│                                   │
│ ☐ Opcional: Permitir sobregiro   │
│   (Si marca, puede gastar más)   │
│                                   │
│ [ ✓ AÑADIR ]  [ ❌ CANCELAR ]    │
└───────────────────────────────────┘

Resultado:
┌───────────────────────────────────┐
│ Servicios profesionales:  $5,000  │
│ Suministros:              $20,000 │
│ Viáticos:                 $15,000│
│ Arriendo:                 $10,000 │
│ ────────────────────────────────  │
│ TOTAL PRESUPUESTO:        $50,000 │
└───────────────────────────────────┘

Nombre y cantidad se pueden editar
Botón [X] en cada línea para eliminar
```

### 4. Monitorear Presupuestos

#### Dashboard de Presupuestos

```
Vaya a: 💰 Presupuestos → Pestaña "Monitor"

┌─────────────────────────────────────────┐
│ MONITOR DE PRESUPUESTOS                 │
├─────────────────────────────────────────┤
│                                         │
│ Presupuesto: "Administración 2026 Q2"  │
│ Período: 01-04-2026 a 30-06-2026       │
│ Estado: 🟢 ACTIVO (Faltan 43 días)     │
│                                         │
│ ┌─────────────────────────────────────┐│
│ │ AVANCE GENERAL: 38% ████████░░░░░░ ││
│ │ Consumido: $ 19,000 / $50,000       ││
│ │ Disponible: $ 31,000                ││
│ └─────────────────────────────────────┘│
│                                         │
│ ÍTEMS DETALLADOS:                      │
│                                         │
│ ① Servicios (80% ⚠️)                  │
│    ████████░░░░░░░░░░░░░░░░░░░░░░  │
│    $12K / $15K | Disponible: $3K    │
│    → Acciones: [ ⚠️ ADVERTENCIA ]   │
│                                         │
│ ② Suministros (35%)                    │
│    ███████░░░░░░░░░░░░░░░░░░░░░░░░  │
│    $7K / $20K | Disponible: $13K     │
│    → Estado: OK                        │
│                                         │
│ ③ Viáticos (0%)                        │
│    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  │
│    $0 / $15K | Disponible: $15K      │
│    → Estado: Sin usar                  │
│                                         │
│ ④ Arriendo (100% ✗)                    │
│    ████████████████████████████████  │
│    $10K / $10K | Disponible: $0K      │
│    → Acciones: [ SOBREGIRO ]         │
│                                         │
│ Si más de un ítem en riesgo, acción   │
│ [ ⚠️ REVISAR PRESUPUESTOS ]            │
│                                         │
└─────────────────────────────────────────┘
```

#### Alertas Automáticas

```
ALERTA EN 80% DE CONSUMO:
─────────────────────────
• Aparece ⚠️ en el ítem
• Notificación en dashboard
• Email al administrador
• Aún PUEDE crear facturas

ALERTA EN 100% DE CONSUMO:
──────────────────────────
• Aparece ✗ en el ítem
• Bloquea crear nueva factura para ese ítem
• Solo admin puede desbloquear
• O esperar siguiente período

NOTIFICACIONES:
└─ Email: Automático a supervisores
└─ Sistema: Popup en dashboard
└─ Frecuencia: Cuando cambia estado
```

---

## **REPORTES Y ANÁLISIS**

### 1. Acceso a Reportes

```
Opción 1: Menú
└─ 📊 Reportes

Opción 2: Dashboard
└─ Botón [ 📊 VER REPORTES ]

Opción 3: Atajos
└─ Presione: Ctrl + R
```

### 2. Tipos de Reportes

#### Reporte Mensual

```
┌──────────────────────────────────┐
│ REPORTE MENSUAL                  │
└──────────────────────────────────┘

Seleccione mes y año:
[Marzo ♦] [2026 ♦]

RESUMEN:
├─ Total facturas: 45
├─ Monto total: $125,450.00
├─ IVA calculado: $20,072.00
├─ Promedio por factura: $2,788.00
└─ Facturas pendientes: 12

DESEMPEÑO:
├─ Presupuesto ejecutado: 75%
├─ Variación vs mes anterior: +12%
└─ Proveedor principal: Servicios ABC

[ DESCARGAR EXCEL ] [ VER PDF ]
```

#### Reporte por Proveedor

```
Análisis de gastos por cada proveedor:

RANKING DE PROVEEDORES:
1. Servicios ABC          $45,000  (36%)
2. ServiExpress Ltda.     $28,500  (23%)
3. Suministros General    $18,900  (15%)
4. Consultoría XYZ        $12,000  (9%)
4. Otros                  $21,050  (17%)

DETALLES PROVEEDOR (Servicios ABC):
├─ Facturas: 8
├─ Promedio: $5,625/factura
├─ Pago puntual: 100%
├─ Próximo vencimiento: 20-03-2026
└─ Histórico: Aumentó 15% vs 2025

[ DESCARGAR EXCEL ] [ VER GRÁFICO ]
```

#### Reporte Comparativo (Año a Año)

```
GASTO MARZO 2025 vs MARZO 2026:

                Marzo 2025   Marzo 2026   Variación
    Total      $108,900     $125,450     +15.2%
    Servicios  $ 45,000     $ 52,800     +17.3%
    Suministro $ 28,900     $35,150      +21.6%
    Otros      $ 35,000     $37,500      +7.1%

ANÁLISIS:
✓ Aumento controlado en gastos
✓ Servicios subieron más (+17.3%)
⚠️ Monitorear suministros (+21.6%)

GRÁFICO DE LÍNEA:
$130K │                        ╱
$120K │                   ╱╱
$110K │              ╱╱
$100K │          ╱╱
      └──────────────────────────
       M A M J J A S O N D E F M
       2025            2026
       ← Marzo 2025   Marzo 2026→

[ DESCARGAR EXCEL ] [ COMPARAR CON OTRO MES ]
```

### 3. Crear Reporte Personalizado

```
1. Menú → 📊 Reportes → [ + Nuevo Reporte ]

┌────────────────────────────────────┐
│ CREAR REPORTE PERSONALIZADO        │
├────────────────────────────────────┤
│                                    │
│ Nombre del Reporte: *              │
│ [Mi análisis de gastos Q1        ] │
│                                    │
│ Tipo de Reporte:                  │
│ ☐ Resumen  ☐ Detallado  ☐ Análisis│
│                                    │
│ Período:                           │
│ ☑ Mensual ☐ Trimestral ☐ Anual   │
│                                    │
│ Fecha inicio: [01-01-2026      ] │
│ Fecha fin:    [31-03-2026      ] │
│                                    │
│ FILTROS:                          │
│ ☑ Por Proveedor:                 │
│    [Servicios ABC               ] │
│ ☐ Por Centro Costo:             │
│    [Sin seleccionar            ] │
│ ☐ Por Rango de Monto:           │
│    Desde [         ] Hasta [ ] │
│                                    │
│ CAMPOS A INCLUIR:                 │
│ ☑ Número de factura              │
│ ☑ Monto                          │
│ ☑ IVA                            │
│ ☑ Proveedor                      │
│ ☑ Fecha                          │
│ ☐ Centro Costo                   │
│ ☑ Estado                         │
│                                    │
│ VISUALIZACIÓN:                    │
│ ☑ Tabla  ☑ Gráfico  ☑ Resumen   │
│                                    │
│ [ 💾 GUARDAR REPORTE ]           │
│ [ ⬇️ DESCARGAR AHORA ]            │
│ [ ❌ CANCELAR ]                   │
└────────────────────────────────────┘

2. Complete filtros según necesidad
3. Click [ 💾 GUARDAR REPORTE ]
4. Queda guardado con ese nombre
5. Pueda regenerarse mensualmente
```

### 4. Descargar Reportes

```
FORMATOS DISPONIBLES:

[ 📊 EXCEL ]
├─ Mejor para: Análisis adicionales
├─ Incluye: Fórmulas, gráficos
├─ Tamaño: Según datos
├─ Tiempo: 5-30 segundos
└─ Recomendado para datos grandes

[ 📄 PDF ]
├─ Mejor para: Imprimir, compartir
├─ Incluye: Formato profesional
├─ Tamaño: Comprimido
├─ Protegido contra cambios
└─ Tiempo: 10-20 segundos

[ 📋 CSV ]
├─ Mejor para: Bases de datos
├─ Peso: Mínimo
├─ Compatible: Todos los sistemas
└─ Tiempo: Instantáneo

PROCESO:
1. Vea reporte en pantalla
2. Click [ ⬇️ DESCARGAR ]
3. Seleccione formato
4. Guarde en su computadora
5. Abra con programa compatible
```

---

## **ADMINISTRACIÓN DE USUARIOS**

### Nota: Solo disponible para Administradores

```
👮 ACCESO RESTRINGIDO
════════════════════════════════════════
Este módulo solo está disponible para:
✓ Administrador del Sistema
✓ Administrador de Seguridad

Si no ve este módulo en el menú,
contacte al administrador.
```

---

## **CONFIGURACIÓN Y PARÁMETROS**

### Cambios Disponibles por Usuario

```
1. Acceder a Configuración:
   └─ Menú → ⚙️ Configuración

2. Opciones disponibles:
   ├─ ✓ Cambiar Contraseña
   ├─ ✓ Editar Perfil (nombre, email, foto)
   ├─ ✓ Preferencias de Notificaciones
   ├─ ✓ Tema (Claro/Oscuro)
   └─ ✗ Cambiar rol/permisos (solo admin)
```

### Cambios Disponibles para Admin

```
Menú → ⚙️ Configuración → Pestaña "Sistema"

├─ Tasas Impositivas
│  ├─ IVA Estándar: 16%
│  ├─ IVA Especial: 7% (alimentos)
│  └─ Retención: 10%
│
├─ Parámetros de Presupuesto
│  ├─ Nivel de alerta: 80% (editable)
│  ├─ Período por defecto: Mensual
│  └─ Permitir sobregiro: No (editable)
│
├─ Días de Pago Estándar
│  ├─ Pagos normales: 30 días
│  ├─ Pagos prioritarios: 15 días
│  └─ Crédito especial: 60 días
│
└─ Retención de Datos
   ├─ Mantener registros: 7 años
   ├─ Backup automático: Diario
   └─ Restauración automática: Habilitada

[ 💾 GUARDAR CAMBIOS ]
```

---

## **POLÍTICAS DE SEGURIDAD**

### 1. Contraseña

#### Requisitos Obligatorios

```
TODA CONTRASEÑA DEBE CUMPLIR:

Longitud:
├─ Mínimo: 8 caracteres
├─ Máximo: 128 caracteres
└─ Recomendado: 12+ caracteres

Complejidad:
├─ Al menos 1 MAYÚSCULA (A-Z)
├─ Al menos 1 número (0-9)
├─ Al menos 1 símbolo (!@#$%^&*)
└─ Al menos 1 minúscula (a-z)

NO está permitido:
├─ Su nombre de usuario
├─ Nombre de la empresa
├─ Palabras en diccionario común
├─ Secuencias obvias (123456, abcdef, etc)
├─ Números consecutivos
└─ Contraseña anterior (últimas 5)

EJEMPLOS:
✓ ValidoSecur@123     (correcto)
✓ MiPass!2026Empresa  (correcto)
✗ 12345678            (solo números)
✗ Abcdefgh            (sin números)
✗ Juan123             (nombre de usuario)
```

#### Cambio de Contraseña

```
PLAZO OBLIGATORIO:
├─ Primer acceso: INMEDIATO
├─ Cambio planificado: Cada 90 días
├─ Cambio forzado: Lo indica el sistema
└─ Cambio por sospecha: INMEDIATAMENTE

PROCEDIMIENTO:
1. Menú → ⚙️ Configuración
2. [ Cambiar Contraseña ]
3. Ingrese contraseña actual
4. Ingrese contraseña nueva (cumple requisitos)
5. Confirme contraseña nueva
6. Click [ ACTUALIZAR ]

DESPUÉS DEL CAMBIO:
├─ Ya NO se puede usar contraseña anterior
├─ Próximo cambio: En 90 días
├─ El sistema registra el cambio en auditoría
└─ Notificación confirmando cambio
```

### 2. Acceso y Sesión

#### Acceso Físico

```
REGLAS DE COMPUTADORA:

✓ SI PUEDE:
├─ Usar computadora personal (su escritorio)
├─ Usar pantalla con bloqueo de pantalla
├─ Dejar desatendida si está bloqueada (Ctrl+Alt+Delete)
├─ Compartir escritorio si otro admin está presente
└─ Usar computadora de capacitación

✗ NO PUEDE:
├─ Dejar computadora desbloqueada desatendida
├─ Compartir contraseña con más personas
├─ Permitir que otra persona ingrese con su usuario
├─ Usar computadora compartida(café, sala común)
├─ Guardar contraseña en notas/post-its
└─ Escribir contraseña en el escritorio
```

#### Sesión Automática

```
SU SESIÓN SE CIERRA AUTOMÁTICAMENTE:

Caso 1: Inactividad de 30 minutos
├─ Usted deja de trabajar
├─ Sistema detecta inactividad
├─ Aviso: "Sesión vencerá en 5 minutos"
├─ Pueda hacer click para continuar
└─ Si no hace nada → Se cierra sesión

Caso 2: 4 horas desde login
├─ Aunque siga usando sistema
├─ Debe loguearse nuevamente
└─ Es medida de seguridad

CUANDO SE CIERRA SESIÓN:
├─ Se pierden datos no guardados
├─ Debe volver a ingresar credenciales
├─ Historial de cambios se mantiene
└─ Facturas se recuperan en estado anterior
```

### 3. Manejo de Datos

#### Responsabilidad del Usuario

```
USTED ES RESPONSABLE DE:

✓ Mantener confidencial su contraseña
✓ No compartir sus credenciales
✓ Alertar si cree que alguien más usa su usuario
✓ No escribir datos confidenciales fuera del sistema
✓ Cerrar sesión al salir de la computadora
✓ Reportar acceso sospechoso
✓ No navegar información fuera de su necesidad
✓ No descargar datos a unidades USB sin permiso
✓ No tomar pantallazos de datos sensibles
✓ Cumplir con política de retención

SI SOSPECHA ACCESO NO AUTORIZADO:
└─ Contacte inmediatamente a [ Mesa de Ayuda ]
   ├─ Email: soporte@empresa.com
   ├─ Teléfono: +34-900-XXXX-XXXX
   ├─ Chat: https://soporte.empresa.com
   └─ Centro: Piso 3, Oficina 305
```

#### Datos Descargables

```
PERMITIDO DESCARGAR:
✓ Reportes en PDF/Excel
✓ Facturas aprobadas
✓ Datos de su centro de costo
✓ Reportes que genera el sistema
✓ Información pública

NO PERMITIDO DESCARGAR:
✗ Datos de otros centros (sin permiso)
✗ BBDD completa
✗ Información de otros usuarios
✗ A unidades USB (salvo autorizados)
✗ Sin encriptación en dispositivos móviles
✗ Datos sensibles a internet

PROCEDIMIENTO PARA CASOS ESPECIALES:
1. Solicite permiso por escrito a su supervisor
2. Supervisor autoriza (o niega)
3. Si aprueba: Se registra en auditoría
4. Descarga permitida por 24 horas
5. Acceso automáctico después
```

### 4. Auditoría y Monitoreo

```
SISTEMA REGISTRA AUTOMÁTICAMENTE:

✓ Quién: Usuario que realizó acción
✓ Qué: Descripción exacta de acción
  ├─ Crear factura
  ├─ Editar factura
  ├─ Aprobar factura
  ├─ Cambiar contraseña
  ├─ Descargar reporte
  └─ Etc.
✓ Cuándo: Fecha y hora exacta (precisión segundos)
✓ Dónde: Dirección IP de computadora
✓ Resultado: Éxito o error

DATOS REGISTRADOS NO SE PUEDEN BORRAR:
├─ Almacenamiento seguro (encriptado)
├─ Retención: 7 años
├─ Acceso: Solo admin y auditor interno
├─ Consulta: Si cree hay error, solicite sin demora
└─ Cambio: Si detecta error crítico, avisar

PARA VER SU AUDITORÍA:
1. Menú → 📊 Reportes
2. [ Auditoría Personal ]
3. Ve todas SUS acciones registradas
4. Puede descargar en PDF

EJEMPLO REGISTRO:
═════════════════════════════════════════
Acción: FACTURA APROBADA
Usuario: juan.perez@empresa.com
Hora: 14-03-2026 10:32:45
IP: 192.168.1.100
Navegador: Chrome 120 en Windows 11
Factura: INV-2026-00123
Monto: $1,250.00
Estado anterior: PENDIENTE
Estado nuevo: APROBADA
═════════════════════════════════════════
```

### 5. Cumplimiento Normativo

```
ESTÁNDARES QUE CUMPLIMOS:

SAT (Servicio de Administración Tributaria):
├─ Retención de registro fiscal: 7 años
├─ Cálculo de IVA correcto
└─ Reportes tributarios disponibles

GESTIONADOR DE PERSONA (Protección de datos):
├─ Encriptación de datos personales
├─ Consentimiento de uso de datos
├─ Derecho al olvido (si aplica)
└─ Auditoría de acceso

ISO 27001 (Seguridad de la Información):
├─ Acceso basado en roles
├─ Controles de acceso
├─ Cifrado de datos en tránsito
└─ Backup y recuperación

POLÍTICA DE PRIVACIDAD:
└─ Disponible en: https://empresa.com/privacidad
```

---

## **INFORMACIÓN DE SOPORTE**

### 1. Mesa de Ayuda - Canales de Contacto

#### Opción 1: Chat en Vivo

```
DISPONIBLE: Lunes a Viernes, 8:00 a 18:00

1. Haga click en el ícono de chat (esquina inferior derecha)
2. Salude: "Hola, tengo un problema con..."
3. Técnico responde típicamente en 2 minutos
4. Resuelva el problema en línea o agende llamada

✓ MEJOR PARA: Problemas simples, preguntas rápidas
✓ TIEMPO: 2-15 minutos
✗ NO DISPONIBLE: Fines de semana, feriados
```

#### Opción 2: Email

```
DIRECCIÓN: soporte@empresa.com

PROCESO:
1. Envíe email con asunto claro
2. Incluya:
   - Descripción del problema
   - Pasos que realizó
   - Pantallazos si es posible
   - Su nombre y usuario
   - Número de factura (si aplica)

EJEMPLO DE EMAIL:
═════════════════════════════════════════
Asunto: No puedo descargar reporte en Excel

Hola,

No puedo descargar facturas de marzo en 
formato Excel. El sistema dice "Error 500".

Pasos que hice:
1. Fui a Reportes
2. Traté de descargar en Excel
3. Salió pantalla gris con error

Intenté en Chrome y Firefox, sin suerte.

Datos de usuario:
Usuario: juan.perez@empresa.com
Computadora: PC-123
SO: Windows 11

Gracias,
Juan Pérez
═════════════════════════════════════════

✓ MEJOR PARA: Problemas complejos, consultas
✓ TIEMPO: Respuesta en 2-4 horas
✓ DISPONIBLE: 24/7 (respuesta 24 horas)
```

#### Opción 3: Teléfono

```
NÚMERO: +34-900-XXXX-XXXX
DISPONIBLE: Lunes a Viernes, 9:00 a 17:00

EXTENSIONES:
├─ Opción 1: Problemas de acceso
├─ Opción 2: Problemas de datos
├─ Opción 3: Problemas de reportes
├─ Opción 4: Otras preguntas
└─ Opción 0: Hablar con operador

✓ MEJOR PARA: Emergencias, problemas críticos
✓ TIEMPO: Inmediato
✗ NO DISPONIBLE: Fines de semana
```

#### Opción 4: Portal de Soporte

```
SITIO WEB: https://soporte.empresa.com

FUNCIONES:
├─ Enviar ticket de soporte
├─ Ver estado de sus tickets
├─ Base de Conocimiento (FAQ)
├─ Videos de ayuda
├─ Agendar video llamada
└─ Ver histórico de soporte

CREAR TICKET:
1. Click [ + Crear Ticket ]
2. Categoría: Seleccione tipo problema
3. Prioridad:
   - 🔴 CRÍTICA: Sistema no funciona
   - 🟠 ALTA: No puedo trabajar
   - 🟡 MEDIA: Funciona pero con problemas
   - 🟢 BAJA: Pregunta o mejora
4. Descripción: Explique problema
5. Adjuntos: Suba pantallazos si aplica
6. Click [ ENVIAR ]
```

### 2. Niveles de Soporte

```
NIVEL 1: Soporte Técnico de Primer Nivel
╔═════════════════════════════════════════╗
║ ESPECIAL EN:                            ║
║ • Acceso y login                        ║
║ • Olvido de contraseña                  ║
║ • Navegación básica                     ║
║ • Preguntas frecuentes                  ║
║                                          ║
║ RESPUESTA: 15-30 minutos                ║
║ DISPONIBLE: Lunes-Viernes 8-18          ║
╚═════════════════════════════════════════╝

NIVEL 2: Soporte Técnico Especializado
╔═════════════════════════════════════════╗
║ ESPECIAL EN:                            ║
║ • Problemas de datos                    ║
║ • Errores en cálculos                   ║
║ • Reportes complejos                    ║
║ • Problemas de desempeño                ║
║                                          ║
║ RESPUESTA: 1-2 horas                    ║
║ DISPONIBLE: Lunes-Viernes 9-17          ║
╚═════════════════════════════════════════╝

NIVEL 3: Ingeniero de Sistemas
╔═════════════════════════════════════════╗
║ ESPECIAL EN:                            ║
║ • Caídas del sistema                    ║
║ • Problemas de base de datos            ║
║ • Recuperación de datos                 ║
║ • Cambios de configuración              ║
║                                          ║
║ RESPUESTA: Inmediata                    ║
║ DISPONIBLE: 24/7 en emergencias         ║
╚═════════════════════════════════════════╝
```

### 3. Proceso de Escalada

```
PROBLEMA COMÚN:
     ↓
┌─────────────────┐
│ Contacta L1     │
│ Soporte         │ → Intenta resolver
└─────────────────┘ → Si no puede...
     ↓
┌─────────────────┐
│ Escala a L2     │
│ Especialista    │ → Analiza el tema
└─────────────────┘ → Si no puede...
     ↓
┌─────────────────┐
│ Escala a L3     │
│ Ingeniero       │ → Intervención técnica
└─────────────────┘ → Resolver ✓ o...
     ↓
┌─────────────────┐
│ Escala a CEO    │
│ Decisión        │ → Cambio de política
│ Ejecutiva       │    o recurso extra
└─────────────────┘
```

### 4. Horarios de Soporte

```
┌──────────────────────────────────────┐
│ HORARIOS DE SOPORTE POR CANAL        │
├──────────────────────────────────────┤
│                                      │
│ Chat en Vivo:                       │
│ Lunes-Viernes: 8:00-18:00 COL       │
│ Weekends: NO disponible             │
│                                      │
│ Email:                              │
│ Todos los días: 24/7                │
│ Primera respuesta: < 4 horas        │
│                                      │
│ Teléfono:                           │
│ Lunes-Viernes: 9:00-17:00 COL       │
│ Saturados después las 16:00         │
│                                      │
│ Emergencias (24/7):                 │
│ Disponible senior contact:          │
│ +34-900-XXXX-XXXX ext. 999          │
│                                      │
│ Feriados Nacionales:                │
│ Soporte limitado                    │
│ Solo emergencias críticas           │
│                                      │
└──────────────────────────────────────┘

ZONAS HORARIAS:
├─ Colombia (COL): UTC-5
├─ México (MEX): UTC-6 (o UTC-5 en CDT)
├─ España (CET): UTC+1 (UTC+2 en verano)
└─ Convertidor: https://time.is/
```

### 5. Tiempos de Respuesta

```
PRIORIDAD        URGENCIA        RESPUESTA
════════════════════════════════════════════

🔴 CRÍTICA      Sistema caído    15 minutos
                No se puede
                trabajar

🟠 ALTA         Funciona con     1 hora
                problemas,
                datos incorrectos

🟡 MEDIA        Pequeños          4 horas
                problemas,
                preguntas

🟢 BAJA         Mejoras,          48 horas
                sugerencias,
                dudas

SLA MENSUAL (Acuerdo de Nivel de Servicio):
├─ Disponibilidad: 99.5% uptime
├─ Resolución: 90% en plazo
├─ Satisfacción: >85% usuarios
└─ Si no se cumple: Crédito en próxima factura
```

---

## **PREGUNTAS FRECUENTES**

### Acceso y Seguridad

#### P1: ¿Olvidé mi contraseña, qué hago?

**R:** En la pantalla de login:
1. Click "¿Olvidó su contraseña?"
2. Ingrese su email: juan.perez@empresa.com
3. Revise su email (tardará 5 minutos máximo)
4. Click en el enlace enviado
5. Establezca nueva contraseña
Si no recibe email, contacte [ Mesa de Ayuda ]

#### P2: ¿Puedo cambiar mi email de usuario?

**R:** No directamente. Si necesita cambiar email:
1. Contacte al administrador
2. Admin lo valida (verifica identidad)
3. Admin realiza cambio en sistema
4. Se deactivará email anterior
⚠️ Tarda 1-2 horas, inténtelo fuera de horario laboral

#### P3: ¿Por qué mi sesión se cierra de repente?

**R:** Hay dos razones:
1. **Inactividad 30+ min:** Sistema se cierra por seguridad
2. **4 horas de sesión:** Debe volver a loguearse
Es normal y seguro. Vuelva a ingresar.

#### P4: ¿Puedo usar mi contraseña en otro sistemas?

**R:** **NUNCA.** Cada sistema debe tener contraseña única.
Si usa misma contraseña en todos lados:
- Si piratea 1 sitio, piratean todos
- Viola política de empresa
Cree contraseñas DIFERENTES para cada sistema.

### Facturas

#### P5: ¿Puedo editar una factura ya APROBADA?

**R:** No. Una vez aprobada, se bloquea para evitar cambios.
Si necesita cambiar:
1. Contacte seu supervisor
2. Supervisor la "desaprueba"
3. Usted la edita
4. Supervisor vuelve a aprobar
⚠️ Esto se registra en auditoría

#### P6: ¿El sistema calcula automáticamente el IVA?

**R:** Sí. Cuando ingresa monto, el sistema automáticamente:
1. Busca la tasa de IVA según la fecha
2. Calcula IVA = monto × tasa
3. Muestra total = monto + IVA

Ejemplo:
```
Monto: $1,000
Tasa IVA (hoy): 16%
IVA calculado: $160
Total: $1,160
```

#### P7: ¿Qué pasa si cambio la tasa de IVA?

**R:** **Afecta SOLO futuras facturas.**
- Facturas ya creadas: **NO** cambian
- Nuevas facturas: Usan nueva tasa
- Históricas: No se modifican

Ejemplo:
```
Cambian tasa de 16% a 18% el 15-04
├─ Facturas antes: 16%
├─ Facturas desde 15-04: 18%
└─ Facturas ya creadas: No cambian
```

#### P8: ¿Cómo sé quién creó una factura?

**R:** Ver en el "Historial de Cambios":
1. Abre la factura
2. Pestaña "Historial"
3. Ve usuario creador y fecha/hora
4. También ve quién la editó y cuándo

#### P9: ¿Puedo borrar una factura?

**R:** Depende del estado:
```
BORRADOR: ✓ Sí (usted mismo)
PENDIENTE: ✓ Sí (solo contador)
APROBADA: ✗ No (bloqueado)
CANCELADA: ✗ No (histórico)
```

Si necesita borrar aprobada: Contacte admin

### Presupuestos

#### P10: ¿Qué pasa si me paso del presupuesto?

**R:** Depende de la configuración:
- Si está permitido: Puede crear facturas (y queda en rojo)
- Si NO está permitido: Sistema bloquea nuevas facturas
- Alerta en 80%: Se notifica a supervisores
- Administrador: Puede desbloquear temporalmente

#### P11: ¿Puedo crear presupuesto para el mes siguiente?

**R:** Generalmente **sí**, pero:
- Solo si está autorizado
- Típicamente hace el contador o admin
- Debe aprobarse antes de que inicie el período
- Contacte a su supervisor para solicitarlo

#### P12: ¿Los presupuestos se reinician cada mes?

**R:** Depende del tipo:
```
Mensual:     Se reinicia el 1° del mes
Trimestral:  Se reinicia cada 3 meses
Anual:       Se reinicia el 1° de enero

Consumo anterior: NO se transfiere
Cada período: empieza desde $0
```

### Reportes

#### P13: ¿Por qué el reporte tarda mucho tiempo?

**R:** Depende de cantidad de datos:
```
Pequeño (< 1000 facturas):  2-5 segundos
Mediano (1000-5000):        10-20 segundos
Grande (5000+):             30-60 segundos

Si tarda más: Puede haber:
├─ Sistema ocupado
├─ Conexión lenta
└─ Reporte muy complejo
Intente después de las 18:00
```

#### P14: ¿Cómo comparo datos de diferentes meses?

**R:** Use reporte COMPARATIVO:
1. Menú → 📊 Reportes
2. Tipo: "Comparativo"
3. Mes1: Marzo 2025
4. Mes2: Marzo 2026
5. Click [ Generar ]
→ Ve lado a lado con variaciones

#### P15: ¿Dónde están mis reportes guardados?

**R:** Hay dos opciones:
1. **En el sistema:** Menú → Reportes guardados
2. **En mi computadora:** Carpeta Descargas

Si quiere que repita reporte:
1. Genera nuevamente con mismos filtros
2. O siesta guardado, haga click [ Regenerar ]

### Problemas Técnicos

#### P16: El sistema dice "Error 500", ¿qué hago?

**R:** Es un error del servidor. Pasos:
1. Espere 2-3 minutos
2. Recargue la página (F5 o Ctrl+R)
3. Intente de nuevo
4. Si persiste: Contacte [ Mesa de Ayuda ]

**NO intente** múltiples veces, llena el servidor.

#### P17: La página está lenta, ¿cómo acelero?

**R:** Intente esto:
1. Cierre tabs que no use
2. Revise conexión Wi-Fi (4+ Mbps)
3. Actualización navegador (Chrome, Firefox)
4. Borrar caché: Ctrl+Shift+Delete
5. Usar computadora con especificaciones mínimas ✓

Si sigue lento: Contacte soporte

#### P18: No veo el botón [ Nueva Factura ], ¿por qué?

**R:** Posibles razones:
1. **Sin permisos:** Rol no lo permite
   → Contacte administrador
2. **Sesión expiró:** Vuelva a loguearse
3. **Navegador incompatible:** Use Chrome/Firefox
4. **JavaScript desactivado:** Habilitar en navegador

#### P19: ¿Por qué no puedo descargar en PDF?

**R:** Verificar:
1. Plugin PDF está instalado
2. Espacio en disco suficiente (>500MB)
3. Pop-ups no bloqueados
4. Navegador actualizado

Si el problema persiste: Usar descarga Excel

### Datos y Auditoría

#### P20: ¿Quién ve que hicaté una factura?

**R:** Pueden ver su actividad:
- Administrador: TODO
- Su supervisor: Facturas su departamento
- Você: Solo sus propias acciones
- Auditor externo: En auditorías

Otros usuários: NO ven su información (privacidad)

#### P21: ¿Puedo recuperar una factura eliminada?

**R:** Depende:
- Eliminada hace <24 horas: **SÍ** (contacte admin)
- Eliminada hace >24 horas: **Generalmente NO**
- Sistema hace backup diario
- Admin puede restaurar desde backup
→ Contacte [ Mesa de Ayuda ] INMEDIATAMENTE

#### P22: ¿Cuánto tiempo se guardan los datos?

**R:** Política de retención:
```
Facturas: 7 años
Presupuestos: 7 años
Reportes: 3 años
Logs de auditoría: 7 años
Emails: 1 año

DESPUÉS: Se archivan (no se borran)
Si necesita datos viejos: Contacte admin
```

### Entrenamiento

#### P23: ¿Dónde consigo capacitación?

**R:** Opciones:
1. **Capacitación formal:** 4 horas, Sala 301
2. **Videos en línea:** https://empresa.com/videos
3. **Este manual:** Lea secciones relevantes
4. **Soporte 1-a-1:** Solicite a training@empresa.com

#### P24: ¿Hay certificación de uso?

**R:** Sí. Después de completar:
1. Capacitación formal
2. Ejercicios prácticos
3. Prueba de conocimiento (80% aprobación)
→ Recibe certificado digital

Válido por 2 años, luego debe renovar.

---

## **CONCLUSIÓN**

Este manual le proporciona toda la información necesaria para:

✓ Acceder y navegar el sistema seguramente
✓ Crear y gestionar facturas eficientemente
✓ Usar presupuestos para control de gastos
✓ Generar reportes y análisis útiles
✓ Seguir políticas de seguridad
✓ Solicitar apoyo cuando lo necesite

### Siguientes Pasos Recomendados:

1. **Hoy:** Lea secciones 1-3 (30 minutos)
2. **Este mes:** Complete capacitación oficial (4 horas)
3. **Próximas 2 semanas:** Cree 5 facturas de práctica
4. **Después:** Use normalmente, contacte soporte si necesita

### Contactos Importantes:

```
🆘 EMERGENCIA (Sistema caído):
+34-900-XXXX-XXXX ext. 999

📧 EMAIL GENERAL:
soporte@empresa.com

💬 CHAT EN VIVO:
https://soporte.empresa.com/chat
(Lunes-Viernes 8-18)

🌐 PORTAL SOPORTE:
https://soporte.empresa.com

🎥 VIDEOS AYUDA:
https://empresa.com/videos

📚 DOCUMENTACIÓN:
https://empresa.com/doc

👤 ADMINISTRADOR LOCAL:
[Su Supervisor]
```

---

**Versión:** 1.3.0
**Fecha:** 14 de Marzo de 2026
**Autor:** Equipo de Documentación del Sistema
**Aprobado:** Administración
**Próxima Revisión:** 14 de Septiembre de 2026

---

## **APÉNDICE: Glosario de Términos**

```
AUDITORÍA: Registro de quién hace qué, cuándo y dónde
CENTRO DE COSTO: Departamento o área para asignación presupuestaria
FACTURAS: Documentos que registran compras a proveedores
IVA: Impuesto al Valor Agregado (impuesto sobre ventas)
JWT: Token de seguridad para mantener sesión activa
PRESUPUESTO: Cantidad de dinero asignada para gastar en período
PROVEEDOR: Empresa o persona que vende servicios/productos
ROM: Acrónico: Request on Modification (solicitud de cambio)
SESIÓN: Período de tiempo desde que entra hasta que sale del sistema
SLA: Acuerdo de Nivel de Servicio (qué promete soporte)
TASA: Porcentaje (ej: 16% de IVA)
TOKEN: Código de seguridad que valida que es usted
```

