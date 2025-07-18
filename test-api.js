// Script para probar la API REST de Holded
import dotenv from 'dotenv';
dotenv.config();

// Para este test, usaremos un servidor simple
import express from 'express';
import axios from 'axios';

const app = express();

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Servidor API de Holded ejecutándose en http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   GET  /health - Estado del servidor`);
  console.log(`   GET  /api/contacts - Obtener contactos`);
  console.log(`   POST /api/contacts - Crear contacto`);
  console.log(`   GET  /api/services - Obtener servicios`);
  console.log(`   GET  /api/appointments - Obtener citas`);
  console.log(`   POST /api/appointments - Crear cita`);
});
