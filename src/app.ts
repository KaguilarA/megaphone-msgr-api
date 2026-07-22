import express from 'express';
import { connectDB } from './config/database.ts';

const app = express();
const PORT = process.env.PORT || 3000;



app.listen(PORT, () => {
  // Conectar a MongoDB
  connectDB();
  console.log(`⚡️ Servidor ejecutándose en http://localhost:${PORT}`);
});