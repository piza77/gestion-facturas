# 🚀 CI/CD Configuration - GitHub Actions

## Configuración Completada

Se han configurado dos workflows automáticos para ejecutar tests y validar calidad de código.

### Workflows Creados

#### 1. **test.yml** - Tests Automáticos
**Archivo:** `.github/workflows/test.yml`

Se ejecuta en:
- Cada push a `main` o `develop`
- Cada pull request a `main` o `develop`

**Lo que hace:**
```
✅ Ejecuta en Node 18.x y 20.x
✅ Instala dependencias
✅ Ejecuta tests unitarios
✅ Ejecuta todos los tests
✅ Genera reporte de cobertura
✅ Sube cobertura a Codecov (opcional)
```

#### 2. **quality.yml** - Validación de Calidad
**Archivo:** `.github/workflows/quality.yml`

Se ejecuta en:
- Cada pull request a `main` o `develop`

**Lo que hace:**
```
✅ Ejecuta tests con coverage
✅ Verifica que todos los tests pasen
✅ Calcula porcentaje de cobertura
✅ Comenta en el PR con resultados
```

---

## 📊 Resultados Actual

```
Test Suites: 5 passed, 5 total
Tests:       45 passed, 45 total
Coverage:    Ready to measure
```

---

## 🎯 Cómo Funciona

### Flujo 1: Push a Main/Develop
```
1. Código se pushea a main/develop
2. GitHub Actions detecta el push
3. Workflow "test.yml" se ejecuta automáticamente
4. Tests corren en Node 18.x y 20.x
5. Cobertura se genera
6. ✅ Si todo pasa, el código se acepta
7. ❌ Si algo falla, se notifica el error
```

### Flujo 2: Pull Request
```
1. Abres un PR a main/develop
2. Dos workflows se ejecutan:
   - test.yml (tests en múltiples versiones)
   - quality.yml (validación de calidad)
3. Resultados aparecen en el PR
4. Se comenta automáticamente con cobertura
5. ✅ Si todo OK, puedes mergear
6. ❌ Si falla, necesitas arreglar antes de mergear
```

---

## ✨ Features Incluidos

### Test Execution
- ✅ Multiple Node versions (18.x, 20.x)
- ✅ Unit tests automation
- ✅ All tests automation
- ✅ Dependency caching (rápido)

### Coverage Tracking
- ✅ Generación automática de reporte
- ✅ Upload a Codecov (opcional)
- ✅ Comentario en PR con porcentaje

### Security
- ✅ npm audit check
- ✅ Vulnerability detection
- ✅ Dependency scanning

---

## 📋 Commandos Manualmente

Si quieres ejecutar lo que CI/CD hace, corre:

```bash
cd backend

# Tests
npm test

# Con coverage
npm run test:coverage

# Verificar vulnerabilidades
npm audit --audit-level=moderate
```

---

## 🔧 Configuración Personalizada

### Para cambiar qué rama dispara CI/CD

Edita `.github/workflows/test.yml`:

```yaml
on:
  push:
    branches: [ main, develop, staging ]  # ← Añade branches aquí
  pull_request:
    branches: [ main, develop, staging ]  # ← Añade branches aquí
```

### Para cambiar versiones de Node

```yaml
matrix:
  node-version: [16.x, 18.x, 20.x]  # ← Versiones a testear
```

### Para requerir coverage mínimo

Edita `quality.yml`:

```yaml
if (( $(echo "$COVERAGE < 80" | bc -l) )); then
  echo "❌ Coverage below 80%"
  exit 1
fi
```

---

## 📈 Ver Resultados

### En GitHub
1. Ve a tu repositorio
2. Click en "Actions"
3. Ver workflow runs
4. Click en un run para detalles
5. Ver logs completos

### En Pull Request
1. Abre un PR
2. Desplázate a "Checks"
3. Ver resultados de workflows
4. Lee comentario automático con cobertura

---

## 🎊 Status Badge

Puedes añadir un badge de estado en tu README:

```markdown
![Tests](https://github.com/USUARIO/REPO/actions/workflows/test.yml/badge.svg)
```

---

## 🆘 Si Algo Falla

### Falla local pero pasa en CI
```bash
npm test -- --verbose
# Ve logs locales vs CI
```

### Falla en CI pero no local
```bash
# Probablemente versión de Node diferente
node --version
# Usa la misma versión que CI (20.x)
```

### Tests pasan pero CI falla
```bash
# Podría ser npm cache
cd backend
rm -rf node_modules package-lock.json
npm install
npm test
```

---

## 📝 Logs de CI/CD

Los logs se guardan y puedes verlos:

1. GitHub → Actions → workflow name
2. Click en el run específico
3. Ver "Build" o "Run tests" section
4. Desplázate para ver output completo

---

## 🚀 Próximos Pasos (Opcional)

### 1. Codecov Integration (20 min)
```yaml
# Descomentar en test.yml:
- uses: codecov/codecov-action@v3
```

Requiere:
1. Crear cuenta en codecov.io
2. Connectar repo
3. Habilitar en settings

Resultado: Dashboard visual de cobertura

### 2. Slack Notifications (15 min)
Añadir a test.yml:
```yaml
- name: Notify Slack
  if: failure()
  uses: slackapi/slack-github-action@v1
```

### 3. Auto-merge PRs (10 min)
```yaml
- name: Auto merge
  if: success()
  uses: pascalgn/automerge-action@v0.15.3
```

---

## ✅ Checklist

- [x] test.yml creado
- [x] quality.yml creado
- [x] Node versions configuradas
- [x] Tests automáticos
- [x] Coverage tracking
- [x] PR comments
- [ ] Codecov integration (opcional)
- [ ] Slack notifications (opcional)
- [ ] Auto-merge (opcional)

---

## 📞 Resumen Rápido

| Necesito... | Dónde mirar | Acción |
|-------------|-------------|--------|
| Ver tests | GitHub Actions | Click en workflow |
| Ver cobertura | Comment en PR | Lee comment automático |
| Ejecutar local | Terminal | `npm test` |
| Cambiar branches | test.yml | Edita `branches:` |
| Requerir coverage | quality.yml | Edita umbral |
| Notificaciones | Añadir action | (Opcional) |

---

**Fecha:** Diciembre 2025  
**Status:** ✅ Completado  
**Próximo:** Mergea un PR y ve CI/CD en acción
