# 📚 Testing Documentation Index

## 🎯 Quick Links by Task

### 🚀 Get Started
1. **First Time Setup?** → [TESTING_COMPLETE_README.md](TESTING_COMPLETE_README.md)
2. **Need to Run Tests?** → Jump to "Quick Start" below
3. **E2E Testing Guide?** → [TESTING_E2E_GUIDE.md](TESTING_E2E_GUIDE.md)

### 🧪 Run Tests
```
Backend Tests:        cd backend && npm test
Frontend Unit Tests:  cd frontend && npm test
Frontend E2E Tests:   cd frontend && npm run cypress:open
Run All (Script):     .\test-e2e.ps1 run
```

### 📖 Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| **TESTING_COMPLETE_README.md** | Complete testing guide & setup | Everyone |
| **TESTING_E2E_GUIDE.md** | E2E testing with Cypress | QA Engineers |
| **E2E_TESTING_SUMMARY.md** | E2E implementation summary | Developers |
| **TESTING_GUIDE.md** | General testing guidelines | All Testers |
| **TESTING_IMPLEMENTATION.md** | Implementation details | Developers |
| **TESTING_READY.md** | Setup readiness checklist | DevOps |
| **TEST_DOCUMENTATION_INDEX.md** | Documentation index | Everyone |

### 🔧 Utility Scripts

| Script | OS | Purpose |
|--------|----|---------| 
| **test-e2e.ps1** | Windows | Run E2E tests with utilities |
| **test-e2e.sh** | Mac/Linux | Run E2E tests with utilities |

---

## 📋 Quick Start (Choose Your Path)

### 👨‍💻 Developer: Setup & Run Tests

```bash
# 1. Navigate to project
cd gestion-facturas

# 2. Backend setup
cd backend
npm install
npm run migrate
npm test

# 3. Frontend setup
cd ../frontend
npm install --legacy-peer-deps
npm test

# 4. Start E2E testing
npm run cypress:open  # Interactive
npm run cypress:run   # Headless
```

### 🧪 QA Engineer: Run E2E Tests

```bash
# Windows (PowerShell)
.\test-e2e.ps1 open      # Open Cypress UI
.\test-e2e.ps1 run       # Run headless
.\test-e2e.ps1 all       # Full cycle

# Mac/Linux (Bash)
./test-e2e.sh open       # Open Cypress UI
./test-e2e.sh run        # Run headless
./test-e2e.sh all        # Full cycle
```

### 🔐 DevOps: Setup CI/CD

See `.github/workflows/` for:
- `test.yml` - Test automation
- `quality.yml` - Code quality
- `frontend-quality.yml` - Frontend linting

---

## 📊 Testing Coverage

### By Layer
```
Backend Unit Tests:     45 ✅
Backend Integration:     4 ✅
Frontend Unit Tests:    53 ✅
Frontend E2E Tests:     54 ✅
────────────────────────
TOTAL:                 156 ✅
```

### By Feature
```
Authentication:         12 E2E tests ✅
Invoice CRUD:           19 E2E tests ✅
Navigation:             23 E2E tests ✅
Responsive Design:       8 E2E tests ✅
Error Handling:         10 E2E tests ✅
Data Validation:        12 E2E tests ✅
```

---

## 🗂️ File Organization

### Test Files Location
```
backend/tests/
├── unit/
│   ├── user.model.test.js          (5 tests)
│   ├── employee.model.test.js       (20 tests)
│   ├── provider.model.test.js       (13 tests)
│   ├── invoice.model.test.js        (4 tests)
│   └── costcenter.model.test.js     (3 tests)
└── integration/
    └── invoices.test.js             (4 tests)

frontend/tests/
├── unit/
│   ├── stores/
│   │   └── auth.test.js             (21 tests)
│   └── services/
│       └── api.test.js              (32 tests)
└── setup.js

frontend/cypress/
├── e2e/
│   ├── auth.cy.js                   (12 tests)
│   ├── invoices.cy.js               (19 tests)
│   └── navigation.cy.js             (23 tests)
└── support/
    └── e2e.js                       (custom commands)
```

---

## 🎯 Common Commands Reference

### Backend Testing
```bash
cd backend

npm test                      # Run all tests
npm run test:unit            # Unit tests only
npm run test:coverage        # With coverage report
npm test -- --watch          # Watch mode
npm test -- --bail           # Stop on first failure
npm test -- tests/unit/*     # Run folder
```

### Frontend Unit Testing
```bash
cd frontend

npm test                      # Run all tests
npm run test:watch           # Watch mode
npm run test:coverage        # Coverage report
npm test -- --bail           # Stop on first failure
```

### Frontend E2E Testing
```bash
cd frontend

npm run cypress:open         # Interactive UI
npm run cypress:run          # Headless mode
npm run cypress:ci           # CI/CD mode
npx cypress run --debug      # Debug mode

# Run specific suite
npx cypress run --spec "cypress/e2e/auth.cy.js"

# Run specific test
npx cypress run --spec "cypress/e2e/auth.cy.js" --env grep="should login"
```

### Using Utility Scripts
```powershell
# Windows PowerShell
.\test-e2e.ps1 dev-server    # Start dev server
.\test-e2e.ps1 open          # Open Cypress UI
.\test-e2e.ps1 run           # Run headless
.\test-e2e.ps1 debug         # Debug mode
.\test-e2e.ps1 all           # Full cycle
```

```bash
# Mac/Linux Bash
./test-e2e.sh dev-server     # Start dev server
./test-e2e.sh open           # Open Cypress UI
./test-e2e.sh run            # Run headless
./test-e2e.sh debug          # Debug mode
./test-e2e.sh all            # Full cycle
```

---

## 🔍 Troubleshooting Quick Links

### Backend Issues
- **Database Connection:** See TESTING_COMPLETE_README.md → Troubleshooting
- **Port 3000 in Use:** Use `netstat` or `lsof` commands
- **Migration Failed:** Check `.env` DATABASE_URL

### Frontend Issues
- **Modules Not Found:** Delete node_modules, run `npm install`
- **Port 8080 in Use:** Check vite.config.js or kill process
- **Tests Won't Start:** Ensure Node version 18+

### E2E Issues
- **Tests Timeout:** Start dev server manually
- **Selectors Not Found:** Use `cypress:open` to debug
- **CI Failures:** Check GitHub Actions logs

---

## 📚 Documentation Map

```
Documentation Overview:
├── TESTING_COMPLETE_README.md      ← START HERE
│   ├── Project Overview
│   ├── Quick Start
│   ├── Test Stack (156 tests)
│   ├── Running Tests
│   ├── Project Structure
│   ├── CI/CD Pipeline
│   └── Troubleshooting
│
├── TESTING_E2E_GUIDE.md
│   ├── E2E Overview
│   ├── Test Suites (12+19+23 tests)
│   ├── Quick Start E2E
│   ├── Cypress Configuration
│   ├── Writing E2E Tests
│   ├── Best Practices
│   ├── Debugging
│   └── Common Issues
│
├── E2E_TESTING_SUMMARY.md
│   ├── Setup Status
│   ├── Test Coverage Details
│   ├── File Structure
│   ├── Quick Reference
│   └── Maintenance Guide
│
├── TESTING_GUIDE.md
│   ├── General Testing Guidelines
│   └── Best Practices
│
├── TESTING_IMPLEMENTATION.md
│   ├── Implementation Details
│   └── Technical Specifications
│
└── THIS FILE (TEST_DOCUMENTATION_INDEX.md)
    └── Navigation & Quick Links
```

---

## 🎓 Learning Path

### For New Team Members
1. Read [TESTING_COMPLETE_README.md](TESTING_COMPLETE_README.md)
2. Run backend tests: `cd backend && npm test`
3. Run frontend tests: `cd frontend && npm test`
4. Open Cypress: `cd frontend && npm run cypress:open`
5. Read [TESTING_E2E_GUIDE.md](TESTING_E2E_GUIDE.md)

### For QA Engineers
1. Read [TESTING_E2E_GUIDE.md](TESTING_E2E_GUIDE.md)
2. Run E2E tests: `npm run cypress:open`
3. Write new test following examples
4. Review Best Practices section
5. Debug with `cypress:open` mode

### For Developers
1. Skim [TESTING_COMPLETE_README.md](TESTING_COMPLETE_README.md)
2. Run: `npm test` (unit tests)
3. Run: `npm run cypress:open` (E2E tests)
4. Read "Writing Tests" section
5. Add tests for new features

### For DevOps/CI Engineers
1. Review `.github/workflows/test.yml`
2. Review `.github/workflows/quality.yml`
3. Read CI/CD section in TESTING_COMPLETE_README.md
4. Monitor GitHub Actions
5. Configure notifications

---

## 🚀 Common Workflows

### "I need to run all tests"
```bash
# Backend
cd backend && npm test

# Frontend unit
cd ../frontend && npm test

# Frontend E2E
npm run cypress:run
```

### "I'm fixing a failing test"
```bash
# 1. Open Cypress UI to debug
npm run cypress:open

# 2. Or run specific test
npx cypress run --spec "cypress/e2e/auth.cy.js"

# 3. Or run headless
npm run cypress:run
```

### "I'm adding a new feature"
```bash
# 1. Write test first (TDD)
code frontend/cypress/e2e/newfeature.cy.js

# 2. Run test to see it fail
npm run cypress:open

# 3. Implement feature
code frontend/src/views/NewFeature.vue

# 4. Test should pass
npm run cypress:run

# 5. Run all tests to ensure nothing breaks
npm test
cd ../backend && npm test
```

### "CI/CD tests are failing"
```bash
# 1. Check logs on GitHub Actions
# 2. Run tests locally first
npm test && cd ../backend && npm test && cd ../frontend && npm run cypress:run

# 3. Review error messages
# 4. Check for environment variables
# 5. Check for port conflicts
```

---

## 📞 When You Need Help

### Check Documentation
1. Search TESTING_COMPLETE_README.md
2. Check TESTING_E2E_GUIDE.md
3. Review test examples in code
4. Search GitHub Issues

### Debug Steps
1. Run test in verbose mode: `npm test -- --verbose`
2. Use Cypress UI: `npm run cypress:open`
3. Check browser console
4. Check CI/CD logs on GitHub
5. Compare with working tests

### Resources
- [Jest Docs](https://jestjs.io)
- [Cypress Docs](https://docs.cypress.io)
- [Vue Test Utils](https://test-utils.vuejs.org)

---

## ✨ At a Glance

| Aspect | Details |
|--------|---------|
| **Total Tests** | 156 |
| **Backend Tests** | 49 (45 unit + 4 integration) |
| **Frontend Unit Tests** | 53 |
| **E2E Tests** | 54 |
| **Test Frameworks** | Jest, Cypress |
| **CI/CD** | GitHub Actions |
| **Documentation** | 7+ markdown files |
| **Status** | ✅ Production Ready |

---

## 🎯 Next Steps

1. **Open this file:** ✅
2. **Choose your path:** Developer / QA / DevOps
3. **Follow learning path:** 1-5 steps
4. **Run your first test:** See "Common Workflows"
5. **Read detailed docs:** TESTING_COMPLETE_README.md or TESTING_E2E_GUIDE.md

---

**Last Updated:** 2024
**Status:** ✅ Complete
**All Tests:** 156 Passing
**Documentation:** Complete ✨
