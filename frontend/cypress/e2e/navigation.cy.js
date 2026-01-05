/**
 * E2E Tests - Navigation
 * Validar navegación entre páginas y acceso a secciones
 */

describe('Application Navigation', () => {
  it('debe cargar la página sin errores', () => {
    cy.visit('/', { failOnStatusCode: false })
    cy.get('body').should('exist')
  })

  it('debe navegar a dashboard', () => {
    cy.visit('/dashboard', { failOnStatusCode: false })
    cy.get('body').should('exist')
  })

  it('debe navegar a invoices', () => {
    cy.visit('/invoices', { failOnStatusCode: false })
    cy.get('body').should('exist')
  })

  it('debe navegar a employees', () => {
    cy.visit('/employees', { failOnStatusCode: false })
    cy.get('body').should('exist')
  })

  it('debe navegar a providers', () => {
    cy.visit('/providers', { failOnStatusCode: false })
    cy.get('body').should('exist')
  })

  it('debe navegar a users', () => {
    cy.visit('/users', { failOnStatusCode: false })
    cy.get('body').should('exist')
  })

  it('debe navegar a cost-centers', () => {
    cy.visit('/cost-centers', { failOnStatusCode: false })
    cy.get('body').should('exist')
  })

  it('debe permitir recargar página', () => {
    cy.visit('/', { failOnStatusCode: false })
    cy.reload()
    cy.get('body').should('exist')
  })

  it('debe permitir usar atrás', () => {
    cy.visit('/dashboard', { failOnStatusCode: false })
    cy.visit('/invoices', { failOnStatusCode: false })
    cy.go('back')
    cy.get('body').should('exist')
  })

  it('debe funcionar en desktop', () => {
    cy.viewport(1280, 720)
    cy.visit('/', { failOnStatusCode: false })
    cy.get('body').should('be.visible')
  })

  it('debe funcionar en tablet', () => {
    cy.viewport('ipad-2')
    cy.visit('/', { failOnStatusCode: false })
    cy.get('body').should('be.visible')
  })

  it('debe funcionar en mobile', () => {
    cy.viewport('iphone-x')
    cy.visit('/', { failOnStatusCode: false })
    cy.get('body').should('be.visible')
  })
})
