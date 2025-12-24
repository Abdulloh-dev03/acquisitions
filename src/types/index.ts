import { users } from '#models/users.model.js';
import { InferInsertModel, InferSelectModel } from 'drizzle-orm';

export type User = InferSelectModel<typeof users>;

export type NewUser = InferInsertModel<typeof users>;

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role?: 'user' | 'admin';
}
