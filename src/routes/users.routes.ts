import {
  deleteUser,
  fetchAllUsers,
  getUserById,
  updateUser,
} from '#controllers/users.controller.js';
import {
  authenticateToken,
  requireRole,
} from '#middlewares/auth.middleware.js';
import { Router } from 'express';

const router = Router();

router.get('/', authenticateToken, requireRole(['admin']), fetchAllUsers);
router.get('/:id', authenticateToken, getUserById);
router.put('/:id', authenticateToken, updateUser);
router.delete('/:id', authenticateToken, requireRole(['admin']), deleteUser);
// User CRUD routes configured

export default router;
