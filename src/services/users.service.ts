import { db } from '#config/db.js';
import logger from '#config/logger.js';
import { users } from '#models/users.model.js';
import { eq } from 'drizzle-orm';

export const getUsersService = async () => {
  try {
    return await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users);
  } catch (e) {
    logger.error('Error getting users', e);
    throw e;
  }
};

export const getUserByIdService = async (id: number) => {
  try {
    const [user] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (e) {
    logger.error(`Error getting user by id ${id}:`, e);
    throw e;
  }
};

export const updateUserService = async (
  id: number,
  updates: Partial<typeof users.$inferInsert>
) => {
  try {
    const existingUser = await getUserByIdService(id);
    if (!existingUser) {
      throw new Error('User not found');
    }

    const result = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        updatedAt: users.updatedAt,
      });

    return result[0];
  } catch (e) {
    logger.error(`Error updating user with id ${id}`, e);
    throw e;
  }
};

export const deleteUserService = async (id: number) => {
  try {
    const result = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id });
    return result[0];
  } catch (e) {
    logger.error(`Error deleting user with id ${id}`, e);
    throw e;
  }
};
