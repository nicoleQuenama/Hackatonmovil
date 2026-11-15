import 'dotenv/config';
import http from 'http';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import alertsRoutes from './routes/alerts.routes';
import weatherRoutes from './routes/weather.routes';
import { setupSocketIO } from './services/socket.service';

const app = express();

// ── Security & Middleware ────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'FireGuard Cochabamba API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/weather', weatherRoutes);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// ── HTTP server + Socket.io ───────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT ?? '3000', 10);
const server = http.createServer(app);

setupSocketIO(server);

server.listen(PORT, () => {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   🔥 FireGuard Cochabamba — Backend API      ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  HTTP   → http://localhost:${PORT}             ║`);
  console.log(`║  Socket → ws://localhost:${PORT}               ║`);
  console.log(`║  ENV    → ${process.env.NODE_ENV ?? 'development'}                    ║`);
  console.log('╚══════════════════════════════════════════════╝');
});

export default app;
