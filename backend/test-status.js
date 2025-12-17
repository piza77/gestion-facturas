#!/usr/bin/env node

/**
 * Script de prueba para cambiar estado de factura
 * Uso: node test-status.js <invoice-id>
 */

const axios = require('axios');

const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3OThhZjAwZS04MzlmLTQxOTItYjljOS05YTlhMGMxNzQ3NmEiLCJpYXQiOjE3MzIwMDAwMDB9.test'; // Reemplazar con token válido
const BASE_URL = 'http://localhost:3000/api';

async function testStatusChange() {
  try {
    // 1. Obtener lista de facturas
    console.log('📋 Obteniendo lista de facturas...');
    const listResponse = await axios.get(`${BASE_URL}/invoices`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
      params: { limit: 5 }
    });

    if (listResponse.data.invoices.length === 0) {
      console.error('❌ No hay facturas para probar');
      return;
    }

    const invoice = listResponse.data.invoices[0];
    console.log(`✅ Factura encontrada: ${invoice.invoice_number} (Estado: ${invoice.status})`);

    // 2. Intentar cambiar de estado
    console.log('\n🔄 Intentando cambiar de estado...');
    try {
      const statusResponse = await axios.patch(
        `${BASE_URL}/invoices/${invoice.id}/status`,
        { status: 'filed' },
        { headers: { Authorization: `Bearer ${TOKEN}` } }
      );
      console.log('✅ Estado cambiado exitosamente!');
      console.log(`   Nuevo estado: ${statusResponse.data.invoice.status}`);
      console.log(`   Radicado en: ${statusResponse.data.invoice.filed_at}`);
    } catch (error) {
      console.error('❌ Error al cambiar estado:');
      console.error(`   Status: ${error.response?.status}`);
      console.error(`   Mensaje: ${error.response?.data?.error}`);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testStatusChange();
