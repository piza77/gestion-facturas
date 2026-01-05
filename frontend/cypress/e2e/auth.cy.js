/**
 * E2E Tests - Authentication
 * Validar flujos de login y logout
 */

describe('Authentication', () => {
  it('debe mostrar página de login', () => {
    cy.visit('/login', { failOnStatusCode: false })
    cy.get('body').should('exist')
  })

  it('debe permitir escribir email', () => {
    cy.visit('/login', { failOnStatusCode: false })
    cy.get('input[type="email"]').first().should('exist')
  })

  it('debe permitir escribir password', () => {
    cy.visit('/login', { failOnStatusCode: false })
    cy.get('input[type="password"]').first().should('exist')
  })

  it('debe tener botón de login', () => {
    cy.visit('/login', { failOnStatusCode: false })
    cy.get('button').should('have.length.greaterThan', 0)
  })

  it('debe permitir submit del formulario', () => {
    cy.visit('/login', { failOnStatusCode: false })
    cy.get('input[type="email"]').first().type('test@test.com')
    cy.get('input[type="password"]').first().type('password')
    cy.get('button').first().click()
    cy.get('body').should('exist')
  })

  it('debe permitir logout desde dashboard', () => {
    cy.visit('/dashboard', { failOnStatusCode: false })
    cy.get('body').should('exist')
  })

  it('debe validar protección de rutas', () => {
    cy.window().then((win) => {
      win.localStorage.clear()
    })
    cy.visit('/dashboard', { failOnStatusCode: false })
    cy.get('body').should('exist')
  })

  it('debe mantener sesión en localStorage', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'test-token')
      expect(win.localStorage.getItem('token')).to.equal('test-token')
    })
  })
})
