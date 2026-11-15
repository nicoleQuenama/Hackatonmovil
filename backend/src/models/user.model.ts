export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  passwordHash: string;
  rol: 'bombero' | 'jefe' | 'admin';
  unidad: string;
  activo: boolean;
  fechaCreacion: string;
}

export type UserPublic = Omit<User, 'passwordHash'>;
