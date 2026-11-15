import { User } from '../models/user.model';
import { Alert } from '../models/alert.model';
import { mockUsers, mockAlerts } from '../utils/mock-data';

// In-memory store – acts as the "database" for this demo
let users: User[] = [...mockUsers];
let alerts: Alert[] = [...mockAlerts];

// ── Users ────────────────────────────────────────────────────────────────────

export function getAllUsers(): User[] {
  return users;
}

export function getUserById(id: string): User | undefined {
  return users.find((u) => u.id === id);
}

export function getUserByEmail(email: string): User | undefined {
  return users.find((u) => u.email === email);
}

export function saveUser(user: User): User {
  const idx = users.findIndex((u) => u.id === user.id);
  if (idx >= 0) {
    users[idx] = user;
  } else {
    users.push(user);
  }
  return user;
}

// ── Alerts ───────────────────────────────────────────────────────────────────

export function getAllAlerts(): Alert[] {
  return alerts;
}

export function getAlertById(id: string): Alert | undefined {
  return alerts.find((a) => a.id === id);
}

export function saveAlert(alert: Alert): Alert {
  const idx = alerts.findIndex((a) => a.id === alert.id);
  if (idx >= 0) {
    alerts[idx] = alert;
  } else {
    alerts.push(alert);
  }
  return alert;
}

export function getActiveAlerts(): Alert[] {
  return alerts.filter((a) => a.estado === 'activa');
}

export function getAlertsByZone(zona: string): Alert[] {
  return alerts.filter((a) => a.zona.toLowerCase() === zona.toLowerCase());
}

export function getAlertsByStatus(estado: string): Alert[] {
  return alerts.filter((a) => a.estado === estado);
}
