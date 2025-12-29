import { NextFunction, Request, Response } from 'express';
import logger from '#config/logger.js';
import { jwttoken } from '#utils/jwt.js';
import { JwtUser } from '#types/index.js';

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies.token as string | undefined;

    if (!token) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'No access token provided',
      });
    }

    const decoded = jwttoken.verify(token) as JwtUser;
    req.user = decoded;

    logger.info(`User authenticated: ${decoded.email} (${decoded.role})`);
    return next();
  } catch (e) {
    logger.error('Authentication error:', e);

    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid or expired token',
    });
  }
};

export const requireRole = (allowedRoles: JwtUser['role'][]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'User not authenticated',
      });
    }

    const { role, email } = req.user;

    if (!allowedRoles.includes(role)) {
      logger.warn(
        `Access denied for ${email} with role ${role}. Required: ${allowedRoles.join(', ')}`
      );
      return res.status(403).json({
        error: 'Access denied',
        message: 'Insufficient permissions',
      });
    }

    return next();
  };
};
