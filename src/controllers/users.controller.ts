import logger from '#config/logger.js';
import {
  deleteUserService,
  getUserByIdService,
  getUsersService,
  updateUserService,
} from '#services/users.service.js';

import { formValidationError } from '#utils/format.js';
import {
  updateUserSchema,
  userIdSchema,
} from '#validations/users.validation.js';
import { NextFunction, Request, Response } from 'express';

export const fetchAllUsers = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info('Getting Users...');
    const users = await getUsersService();
    return res.json({
      message: 'Successfully retrieved users',
      users,
      count: users.length,
    });
  } catch (e) {
    logger.error(e);
    return next(e);
  }
};

export const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formValidationError(validationResult.error),
      });
    }

    const userId = Number(validationResult.data.id);
    const user = await getUserByIdService(userId);
    logger.info('User retrieved successfully', user);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ 
      message: 'User retrieved successfully',
      user,
     });
  } catch (e) {
    logger.error('Error getting user', e);
    return next(e);
  }
};

export const updateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const paramsValidation = userIdSchema.safeParse(req.params);
    const bodyValidation = updateUserSchema.safeParse(req.body);

    if (!paramsValidation.success || !bodyValidation.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: [
          ...(paramsValidation.success
            ? []
            : formValidationError(paramsValidation.error)),
          ...(bodyValidation.success
            ? []
            : formValidationError(bodyValidation.error)),
        ],
      });
    }

    const id = parseInt(paramsValidation.data.id);
    const { name, role } = bodyValidation.data;

    // Check permissions
    // Assumes req.user is set by authentication middleware
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (currentUser.id !== id && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    if (role && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can update roles' });
    }

    const updatedUser = await updateUserService(id, { name, role });

    return res.json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (e) {
    logger.error('Error updating user', e);
    return next(e);
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validationResult = userIdSchema.safeParse(req.params);

    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: formValidationError(validationResult.error),
      });
    }

    const id = parseInt(validationResult.data.id);
    await deleteUserService(id);

    return res.json({ message: 'User deleted successfully' });
  } catch (e) {
    logger.error('Error deleting user', e);
    return next(e);
  }
};
