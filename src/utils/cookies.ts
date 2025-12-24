import { Response, Request, CookieOptions } from 'express';

export const cookies = {
  getOptions: (): CookieOptions => ({
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    maxAge: 15 * 60 * 1000, // 15 minutes
  }),

  set: (
    res: Response,
    name: string,
    value: string,
    options: CookieOptions = {}
  ) => {
    res.cookie(name, value, { ...cookies.getOptions(), ...options });
  },

  clear: (res: Response, name: string, options: CookieOptions = {}) => {
    const clearOptions = cookies.getOptions();
    delete clearOptions.maxAge;
    res.clearCookie(name, { ...clearOptions, ...options });
  },

  get: (req: Request, name: string): string | undefined => {
    return req.cookies?.[name];
  },
};
