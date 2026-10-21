import type { User } from '../domain/entities/user.js';

export interface CreateUserInput {
  firstName: string;
  lastName: string;
  bvn: string | null;
}

export interface UserRepository {
  findById(id: string, tx?: unknown): Promise<User | null>;
  create(input: CreateUserInput, tx?: unknown): Promise<User>;
}
