# E2E Testing Guide - Cypress

## 📋 Overview

Comprehensive E2E testing suite using Cypress for validating complete user workflows in the invoice management system.

**Total E2E Tests:** 54 test cases across 3 test suites

## 🗂️ Test Suites

### 1. Authentication Tests (`cypress/e2e/auth.cy.js`)
- **Test Count:** 12 tests
- **Purpose:** Login, register, and authentication flow validation

**Test Cases:**
- ✅ Redirect to login when not authenticated
- ✅ Login form display
- ✅ Invalid email/password handling
- ✅ Valid credentials authentication
- ✅ Navigation to register from login
- ✅ Register form display
- ✅ Form field validation
- ✅ Navbar visibility when authenticated
- ✅ Section navigation
- ✅ Connection error handling
- ✅ Email format validation
- ✅ Password field security

### 2. Invoice CRUD Tests (`cypress/e2e/invoices.cy.js`)
- **Test Count:** 19 tests
- **Purpose:** Create, Read, Update, Delete operations for invoices

**Test Cases:**
- ✅ Display invoice list
- ✅ Create button presence
- ✅ Search/filter functionality
- ✅ Form opening for new invoice
- ✅ Field validation (required fields)
- ✅ Provider selection dropdown
- ✅ Amount entry with decimal precision
- ✅ Edit invoice functionality
- ✅ Prepopulate form with existing data
- ✅ Delete invoice with confirmation
- ✅ Status filtering (pending, approved, rejected)
- ✅ Empty state display
- ✅ Pagination controls
- ✅ Page navigation
- ✅ Results per page selection
- ✅ Data persistence after refresh
- ✅ Validation error messages
- ✅ Success notifications
- ✅ Form reset after submission

### 3. Navigation Tests (`cypress/e2e/navigation.cy.js`)
- **Test Count:** 23 tests
- **Purpose:** Application navigation, menu visibility, and responsive design

**Test Cases:**
- ✅ Sidebar/navbar visibility
- ✅ Dashboard navigation
- ✅ Invoices section access
- ✅ Employees section access
- ✅ Providers section access
- ✅ Users section access
- ✅ Cost Centers section access
- ✅ User menu display
- ✅ Logout functionality
- ✅ Breadcrumb display
- ✅ Back button functionality
- ✅ Mobile hamburger menu
- ✅ Sidebar collapse/expand on mobile
- ✅ Active route highlighting
- ✅ State persistence on navigation
- ✅ Desktop viewport (1280x720)
- ✅ Tablet viewport (iPad-2)
- ✅ Mobile viewport (iPhone-X)
- ✅ Responsive button visibility
- ✅ Menu accessibility
- ✅ Touch interactions on mobile
- ✅ Scroll behavior
- ✅ Page load performance

## 🚀 Quick Start

### Run Cypress Tests Locally

**Interactive Mode (Cypress UI):**
```bash
cd frontend
npm run cypress:open
```

**Headless Mode (CLI):**
```bash
cd frontend
npm run cypress:run
```

**CI/CD Mode:**
```bash
cd frontend
npm run cypress:ci
```

### Run Specific Test Suite

```bash
cd frontend
npx cypress run --spec "cypress/e2e/auth.cy.js"
npx cypress run --spec "cypress/e2e/invoices.cy.js"
npx cypress run --spec "cypress/e2e/navigation.cy.js"
```

## 🛠️ Configuration

### `cypress.config.js`

Key configuration settings:

```javascript
{
  baseUrl: 'http://localhost:8080',
  viewportWidth: 1280,
  viewportHeight: 720,
  defaultCommandTimeout: 10000,
  e2e: {
    specPattern: 'cypress/e2e/**/*.cy.js',
    supportFile: 'cypress/support/e2e.js'
  }
}
```

### Custom Commands

Located in `cypress/support/e2e.js`:

**Login Command:**
```javascript
cy.login(email, password)
// Example: cy.login('admin@test.com', 'password')
```

**Logout Command:**
```javascript
cy.logout()
```

**Check Auth Status:**
```javascript
cy.checkAuth()
```

## 📝 Writing E2E Tests

### Test Template

```javascript
describe('Feature Name', () => {
  beforeEach(() => {
    // Setup before each test
    cy.login('test@test.com', 'password')
    cy.visit('/feature-page')
  })

  it('should perform action X', () => {
    cy.get('button[data-test="action"]').click()
    cy.get('[data-test="result"]').should('contain', 'Expected text')
  })

  it('should validate form field', () => {
    cy.get('input[name="field"]').type('invalid')
    cy.get('[data-test="error"]').should('be.visible')
  })
})
```

### Best Practices

1. **Use Data Attributes:** Prefer `data-test` attributes over CSS selectors
   ```html
   <button data-test="submit-btn">Submit</button>
   ```

2. **Wait for Elements:** Use implicit waits
   ```javascript
   cy.get('[data-test="loader"]').should('not.exist')
   cy.get('[data-test="content"]').should('be.visible')
   ```

3. **Test User Workflows:** Focus on complete user journeys
   ```javascript
   cy.login()
   cy.visit('/invoices')
   cy.get('[data-test="create-btn"]').click()
   cy.get('input[name="amount"]').type('1000')
   cy.get('[data-test="submit"]').click()
   cy.get('[data-test="success-message"]').should('exist')
   ```

4. **Handle Async Operations:**
   ```javascript
   cy.intercept('POST', '/api/invoices', { 
     statusCode: 201, 
     body: { id: 1 } 
   }).as('createInvoice')
   
   cy.get('[data-test="submit"]').click()
   cy.wait('@createInvoice')
   cy.url().should('include', '/invoices/1')
   ```

5. **Test Error States:**
   ```javascript
   cy.intercept('GET', '/api/invoices', { 
     statusCode: 500 
   })
   cy.visit('/invoices')
   cy.get('[data-test="error-message"]').should('be.visible')
   ```

## 🔄 CI/CD Integration

E2E tests automatically run in GitHub Actions pipeline:

1. **Trigger:** On push to main/develop or PR
2. **Node Versions:** 18.x and 20.x
3. **Environment:** Ubuntu Latest
4. **Timeout:** 30 seconds for server startup
5. **Failure Handling:** Marked as soft fail (continue-on-error)

### Workflow Stages

1. ✅ Backend Tests Complete
2. ✅ Frontend Unit Tests Complete
3. 🔄 Frontend Dev Server Starts
4. 🔄 E2E Tests Run
5. ✅ Lint & Audit

## 📊 Test Coverage

| Layer | Tests | Coverage |
|-------|-------|----------|
| Backend | 45 | Unit + Integration |
| Frontend Unit | 53 | Stores, Services |
| Frontend E2E | 54 | User Workflows |
| **Total** | **152** | **Complete** |

## 🐛 Debugging

### Debug Single Test
```bash
cd frontend
npx cypress run --spec "cypress/e2e/auth.cy.js" --debug
```

### Interactive Debug
```bash
cd frontend
npx cypress open
# Select test suite and run with browser console open
```

### View Test Logs
```bash
# Cypress creates videos and screenshots in videos/ and screenshots/
cd frontend/cypress/videos
cd frontend/cypress/screenshots
```

## 🚨 Common Issues

### Issue: Tests timeout waiting for server
**Solution:** Ensure frontend dev server is running on port 8080
```bash
cd frontend
npm run serve
```

### Issue: Form fields not found
**Solution:** Check that `data-test` attributes match in tests
```bash
# In browser console, verify element exists:
document.querySelector('[data-test="email-field"]')
```

### Issue: Login not persisting
**Solution:** Tests use localStorage for auth state, check Support file
```javascript
// cypress/support/e2e.js ensures proper auth handling
```

### Issue: Tests fail in CI but pass locally
**Solution:** May need to adjust baseUrl or server startup timing
- Check cypress.config.js baseUrl
- Increase wait-on timeout in workflow
- Ensure no port conflicts

## 📚 Resources

- [Cypress Documentation](https://docs.cypress.io)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress Assertions](https://docs.cypress.io/guides/references/assertions)
- [Cypress Commands](https://docs.cypress.io/api/commands/get)

## 🎯 Next Steps

1. **Run Tests Locally:**
   ```bash
   npm run cypress:open
   ```

2. **Add Data Test Attributes** to Vue components:
   ```vue
   <button data-test="submit-btn" @click="submit">Submit</button>
   ```

3. **Monitor CI/CD Pipeline** for E2E test results

4. **Expand Test Coverage** with additional scenarios

5. **Create Page Objects** for complex pages (optional)
   ```javascript
   // cypress/support/page-objects/invoices.js
   export class InvoicesPage {
     getCreateBtn() { return cy.get('[data-test="create-btn"]') }
     submitForm() { return cy.get('[data-test="submit"]').click() }
   }
   ```

## 📞 Support

For issues or questions:
1. Check Cypress documentation
2. Review test files for similar patterns
3. Debug with `cypress:open` mode
4. Check CI/CD workflow logs on GitHub Actions
