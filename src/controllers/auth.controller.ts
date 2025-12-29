import logger from '#config/logger.js';
import { authenticateUser, createUser } from '#services/auth.service.js';
import { cookies } from '#utils/cookies.js';
import { formValidationError } from '#utils/format.js';
import { jwttoken } from '#utils/jwt.js';
import { signInSchema, signupSchema } from '#validations/auth.validation.js';
import { NextFunction, Request, Response } from 'express';

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = signupSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Valdiation failed',
        details: formValidationError(validationResult.error),
      });
    }

    const { name, email, password, role } = validationResult.data;

    const user = await createUser({ name, email, password, role });

    const token = jwttoken.sign({
      id: user?.id,
      email: user?.email,
      role: user?.role,
    });

    cookies.set(res, 'token', token);

    logger.info(`User registered succesfully ${email}`);
    res.status(201).json({
      message: 'User registered',
      user: {
        id: user?.id,
        name: user?.name,
        role: user?.role,
        email: user?.email,
      },
    });
  } catch (e) {
    logger.error('SignUp error', e);
    if (
      e instanceof Error &&
      e.message === 'User with this email already exists'
    ) {
      return res.status(409).json({ error: 'Email already exists' });
    }
    next(e);
  }
};

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = signInSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Valdiation failed',
        details: formValidationError(validationResult.error),
      });
    }

    const { email, password } = validationResult.data;

    const user = await authenticateUser(email, password);

    const token = jwttoken.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    cookies.set(res, 'token', token);

    logger.info(`User logged in succesfully ${email}`);
    return res.status(200).json({
      message: 'User logged in',
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (e) {
    logger.error('SignIn error', e);
    if (e instanceof Error && e.message === 'Invalid email or password') {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    next(e);
  }
};

export const signout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = cookies.get(req, 'token');

    if (!token) {
      logger.info('SignOut attempted without token');
    } else {
      logger.info('User signed out');
    }

    cookies.clear(res, 'token');

    return res.status(200).json({ message: 'User signed out' });
  } catch (e) {
    logger.error('SignOut error', e);
    next(e);
  }
};
