import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { Alert } from '../models/alert.model';

let io: SocketIOServer | null = null;

export function setupSocketIO(server: HttpServer): SocketIOServer {
  io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket.io] Cliente conectado: ${socket.id}`);

    socket.on('join_zone', (zona: string) => {
      socket.join(`zona_${zona}`);
      console.log(`[Socket.io] ${socket.id} unido a zona: ${zona}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.io] Cliente desconectado: ${socket.id}`);
    });
  });

  return io;
}

export function emitNuevaAlerta(alert: Alert): void {
  if (!io) return;
  io.emit('nueva_alerta', alert);
  io.to(`zona_${alert.zona}`).emit('nueva_alerta_zona', alert);
  console.log(`[Socket.io] Emitido nueva_alerta: ${alert.id} en ${alert.zona}`);
}

export function emitAlertaActualizada(alert: Alert): void {
  if (!io) return;
  io.emit('alerta_actualizada', alert);
  io.to(`zona_${alert.zona}`).emit('alerta_actualizada_zona', alert);
  console.log(`[Socket.io] Emitido alerta_actualizada: ${alert.id}`);
}

export function getSocketIO(): SocketIOServer | null {
  return io;
}
