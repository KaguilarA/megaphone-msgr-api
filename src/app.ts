import express from 'express';
import path from 'node:path';
import { connectDB } from './config/database.ts';
import { corsMiddleware } from './config/cors.ts';
import apiRouter from './routes/api.routes.ts';
import ViewRouter from './routes/view.routes.ts';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(corsMiddleware);
app.use(express.json());

app.set('view engine', 'pug');
app.set('views', path.join(process.cwd(), 'src/views'));

app.use('/js/vendor/alpine', express.static(path.join(process.cwd(), 'node_modules/alpinejs/dist')));
app.use('/js/vendor/reactive-values', express.static(path.join(process.cwd(), 'node_modules/reactive-values/dist')));
app.use(express.static(path.join(process.cwd(), 'public')));

app.use('', ViewRouter);
app.use('/api', apiRouter);

app.listen(PORT, () => {
  connectDB();
  console.log(`⚡️ Servidor ejecutándose en http://localhost:${PORT}`);
});