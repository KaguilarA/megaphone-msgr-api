import express from 'express';
import path from 'node:path';
import { connectDB } from './config/database.ts';
import { corsMiddleware } from './config/cors.ts'
import apiRouter from './routes/routes.ts';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(corsMiddleware);
app.use(express.json());

app.set('view engine', 'pug');
app.set('views', path.join(process.cwd(), 'src/views'));

app.use('/api', apiRouter);

app.listen(PORT, () => {
  connectDB();
  console.log(`⚡️ Servidor ejecutándose en http://localhost:${PORT}`);
});