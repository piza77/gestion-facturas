// Frontend Tests Setup
// Configuración global para todos los tests

// Mock de localStorage
const localStorageMock = {
  data: {},
  getItem: function(key) { return this.data[key] || null },
  setItem: function(key, value) { this.data[key] = value },
  removeItem: function(key) { delete this.data[key] },
  clear: function() { this.data = {} }
}
global.localStorage = localStorageMock

// Mock de sessionStorage
const sessionStorageMock = {
  data: {},
  getItem: function(key) { return this.data[key] || null },
  setItem: function(key, value) { this.data[key] = value },
  removeItem: function(key) { delete this.data[key] },
  clear: function() { this.data = {} }
}
global.sessionStorage = sessionStorageMock

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Reset antes de cada test
beforeEach(() => {
  jest.clearAllMocks()
  localStorageMock.clear()
  sessionStorageMock.clear()
})
