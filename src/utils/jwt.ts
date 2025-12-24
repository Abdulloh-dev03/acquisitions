import logger from '#config/logger.js';
import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-please-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export const jwttoken = {
  sign: (payload: string | object | Buffer) => {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn'],
      });
    } catch (error) {
      logger.error('Failed to sign token', error);
      throw new Error('Failed to sign token');
    }
  },
  verify: (token: string) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      logger.error('Failed to verify token', error);
      throw new Error('Failed to authenticate token');
    }
  },
};
