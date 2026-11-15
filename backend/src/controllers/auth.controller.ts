import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { body } from 'express-validator';
import { getUserByEmail } from '../config/database';
import { signToken } from '../config/jwt';

export const loginValidators = [
  body('email').isEmail().withMessage('Email inválido').normalizeEmail(),
  body('password').notEmpty().withMessage('Contraseña requerida'),
];

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };

  const user = getUserByEmail(email);
  if (!user) {
    res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    return;
  }

  if (!user.activo) {
    res.status(401).json({ success: false, message: 'Usuario inactivo' });
    return;
  }

  const passwordMatch = await bcrypt.compare(password, user.passwordHash);
  if (!passwordMatch) {
    res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    return;
  }

  const token = signToken({ userId: user.id, email: user.email, rol: user.rol });

  const { passwordHash: _pw, ...publicUser } = user;

  res.json({
    success: true,
    message: 'Inicio de sesión exitoso',
    data: {
      token,
      user: publicUser,
    },
  });
}

export function me(req: Request, res: Response): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'No autenticado' });
    return;
  }
  res.json({ success: true, data: { user: req.user } });
}
