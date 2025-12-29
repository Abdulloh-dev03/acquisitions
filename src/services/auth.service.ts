import { db } from '#config/db.js';
import logger from '#config/logger.js';
import { users } from '#models/users.model.js';
import { CreateUserDTO } from '#types/index.js';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

export const hashPassword = async (password: string) => {
  try {
    return await bcrypt.hash(password, 10);
  } catch (e) {
    logger.error(`Error hashing password ${e}`);
    throw new Error('Invalid hashing');
  }
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (e) {
    logger.error(`Error comparing password ${e}`);
    throw new Error('Invalid password comparison');
  }
};

export const createUser = async (data: CreateUserDTO) => {
  try {
    const { name, email, password, role = 'user' } = data;

    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        password: hashedPassword,
        role,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        createdAt: users.createdAt,
      });

    logger.info(`User ${newUser?.email} created successfully`);
    return newUser;
  } catch (error) {
    logger.error('Error creating user', error);
    throw error;
  }
};

export const authenticateUser = async (email: string, password: string) => {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    logger.info(`User ${user.email} authenticated successfully`);
    return user;
  } catch (error) {
    if (
      error instanceof Error &&
      error.message === 'Invalid email or password'
    ) {
      logger.warn(`Authentication failed for email ${email}: ${error.message}`);
      throw error;
    }

    logger.error('Error authenticating user', error);
    throw error;
  }
};
