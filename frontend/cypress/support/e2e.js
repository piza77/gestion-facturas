// Cypress Support File
// Incluir comandos custom y configuración global

// Comando custom: login
Cypress.Commands.add('login', (email = 'admin@test.com', password = 'password') => {
  cy.visit('/login')
  cy.get('input[type="email"]').first().type(email)
  cy.get('input[type="password"]').first().type(password)
  cy.get('button[type="submit"]').first().click()
  cy.url().should('include', '/dashboard')
})

// Comando custom: logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-btn"]').click()
  cy.url().should('include', '/login')
})

// Comando custom: check auth
Cypress.Commands.add('checkAuth', () => {
  cy.url().should('not.include', '/login')
})

// Desactivar uncaught exception handling para algunas pruebas
Cypress.on('uncaught:exception', (err, runnable) => {
  // No fallar en ciertos errores esperados
  if (err.message.includes('ResizeObserver')) {
    return false
  }
  return true
})
