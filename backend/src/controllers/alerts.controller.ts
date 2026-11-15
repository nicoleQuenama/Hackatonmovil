import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { body } from 'express-validator';
import {
  getAllAlerts,
  getAlertById,
  saveAlert,
  getActiveAlerts,
  getAlertsByZone,
  getAlertsByStatus,
} from '../config/database';
import { Alert, AlertCreateInput, AlertStatusUpdate } from '../models/alert.model';
import { emitNuevaAlerta, emitAlertaActualizada } from '../services/socket.service';

export const createAlertValidators = [
  body('tipo').notEmpty().withMessage('Tipo de alerta requerido'),
  body('severidad').isIn(['baja', 'media', 'alta', 'critica']).withMessage('Severidad inválida'),
  body('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitud inválida'),
  body('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitud inválida'),
  body('zona').notEmpty().withMessage('Zona requerida'),
  body('descripcion').notEmpty().withMessage('Descripción requerida'),
  body('origen').isIn(['movis', 'viir', 'modelo_ia']).withMessage('Origen inválido'),
];

export const updateStatusValidators = [
  body('estado').isIn(['activa', 'atendida', 'cerrada']).withMessage('Estado inválido'),
];

export function getAlerts(req: Request, res: Response): void {
  const { zona, estado } = req.query as { zona?: string; estado?: string };

  let alerts = getAllAlerts();

  if (zona) {
    alerts = getAlertsByZone(zona);
  }
  if (estado) {
    alerts = estado ? alerts.filter((a) => a.estado === estado) : alerts;
  }

  alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  res.json({ success: true, data: { alerts, total: alerts.length } });
}

export function getActiveAlertsHandler(req: Request, res: Response): void {
  const alerts = getActiveAlerts().sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  res.json({ success: true, data: { alerts, total: alerts.length } });
}

export function getAlertByIdHandler(req: Request, res: Response): void {
  const alert = getAlertById(req.params.id);
  if (!alert) {
    res.status(404).json({ success: false, message: 'Alerta no encontrada' });
    return;
  }
  res.json({ success: true, data: { alert } });
}

export function createAlert(req: Request, res: Response): void {
  const input = req.body as AlertCreateInput;

  const newAlert: Alert = {
    id: uuidv4(),
    tipo: input.tipo,
    severidad: input.severidad,
    lat: input.lat,
    lng: input.lng,
    zona: input.zona,
    descripcion: input.descripcion,
    vientoVelocidad: input.vientoVelocidad ?? 15,
    vientoDireccion: input.vientoDireccion ?? 210,
    temperatura: input.temperatura ?? 30,
    humedad: input.humedad ?? 30,
    estado: 'activa',
    origen: input.origen,
    timestamp: new Date().toISOString(),
    bomberosAsignados: [],
  };

  saveAlert(newAlert);
  emitNuevaAlerta(newAlert);

  res.status(201).json({
    success: true,
    message: 'Alerta creada y notificación enviada',
    data: { alert: newAlert },
  });
}

export function updateAlertStatus(req: Request, res: Response): void {
  const alert = getAlertById(req.params.id);
  if (!alert) {
    res.status(404).json({ success: false, message: 'Alerta no encontrada' });
    return;
  }

  const { estado, bomberosAsignados } = req.body as AlertStatusUpdate;
  alert.estado = estado;
  if (bomberosAsignados) {
    alert.bomberosAsignados = bomberosAsignados;
  }

  saveAlert(alert);
  emitAlertaActualizada(alert);

  res.json({
    success: true,
    message: 'Estado de alerta actualizado',
    data: { alert },
  });
}
