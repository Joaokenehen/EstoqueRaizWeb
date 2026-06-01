import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { warn } from '../utils/logger';

export const authMiddleware = (cargosPermitidos: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      warn('authMiddleware - token não fornecido para rota', req.originalUrl);
      return res.status(401).json({ message: 'Token não fornecido. Acesso não autorizado.' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      (req as any).usuario = decoded;

      if (cargosPermitidos.length > 0 && !cargosPermitidos.includes(decoded.cargo)) {
        warn('authMiddleware - acesso negado. cargo:', decoded.cargo, 'rota:', req.originalUrl);
        return res.status(403).json({ message: 'Acesso negado para o seu cargo.' });
      }

      next();
    } catch (error) {
      warn('authMiddleware - token inválido/expirado para rota', req.originalUrl, 'erro:', (error as any)?.message);
      return res.status(401).json({ message: 'Token inválido ou expirado.' });
    }
  };
};