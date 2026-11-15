import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../config/jwt';
import { getUserById } from '../config/database';
import { UserPublic } from '../models/user.model';

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: UserPublic;
      jwtPayload?: JwtPayload;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Token de autenticación requerido' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    req.jwtPayload = payload;

    const user = getUserById(payload.userId);
    if (!user || !user.activo) {
      res.status(401).json({ success: false, message: 'Usuario no encontrado o inactivo' });
      return;
    }

    // Attach public user (without passwordHash)
    const { passwordHash: _pw, ...publicUser } = user;
    req.user = publicUser;

    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token inválido o expirado' });
  }
}
