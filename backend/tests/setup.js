// Variables de ambiente de test
process.env.NODE_ENV = 'test';
process.env.DB_HOST = 'localhost';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = '';
process.env.DB_NAME = 'gestion_facturas_test';
process.env.JWT_SECRET = 'test-secret-key-12345';
process.env.JWT_EXPIRES_IN = '7d';
process.env.PORT = 3001;

// Timeout global para tests
jest.setTimeout(10000);

// Suppress logs durante tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  // error: jest.fn(), // Mantener errores visibles
};
