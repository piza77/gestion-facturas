// Script para probar la funcionalidad de seguimiento de gastos
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Función para hacer login y obtener token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'admin@admin.com',
      password: 'admin123'
    });
    return response.data.token;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    return null;
  }
}

// Función para probar el endpoint de seguimiento de gastos
async function testExpenseTracking() {
  console.log('🚀 Iniciando pruebas de seguimiento de gastos...\n');
  
  const token = await login();
  if (!token) {
    console.log('❌ No se pudo obtener el token. Pruebas canceladas.');
    return;
  }
  
  const headers = { Authorization: `Bearer ${token}` };
  
  try {
    console.log('1. 📊 Probando estadísticas de ejecución...');
    const statsResponse = await axios.get(`${BASE_URL}/budget/execution/1`, { headers });
    console.log('✅ Estadísticas obtenidas:', JSON.stringify(statsResponse.data, null, 2));
    
    console.log('\n2. 💰 Agregando gasto de prueba...');
    const expenseData = {
      amount: 50000,
      description: 'Gasto de prueba para seguimiento'
    };
    const expenseResponse = await axios.post(`${BASE_URL}/budget/categories/1/expenses`, expenseData, { headers });
    console.log('✅ Gasto agregado:', expenseResponse.data);
    
    console.log('\n3. 📈 Obteniendo estadísticas actualizadas...');
    const updatedStatsResponse = await axios.get(`${BASE_URL}/budget/execution/1`, { headers });
    console.log('✅ Estadísticas actualizadas:', JSON.stringify(updatedStatsResponse.data, null, 2));
    
    console.log('\n4. 📋 Generando reporte...');
    const reportResponse = await axios.get(`${BASE_URL}/budget/report/1`, { headers });
    console.log('✅ Reporte generado:', JSON.stringify(reportResponse.data, null, 2));
    
    console.log('\n5. 📧 Enviando notificación por email...');
    const emailResponse = await axios.post(`${BASE_URL}/budget/notification/1`, {}, { headers });
    console.log('✅ Notificación enviada:', emailResponse.data);
    
  } catch (error) {
    console.error('❌ Error en las pruebas:', error.response?.data || error.message);
  }
}

// Ejecutar las pruebas
testExpenseTracking().then(() => {
  console.log('\n🎉 Pruebas completadas!');
  process.exit(0);
}).catch(error => {
  console.error('💥 Error general:', error);
  process.exit(1);
});