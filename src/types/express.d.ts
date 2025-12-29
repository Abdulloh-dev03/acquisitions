import { JwtUser } from '#types/index.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtUser;
    }
  }
}
