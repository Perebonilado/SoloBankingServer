import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import type { Transaction } from 'sequelize';
import type { User } from '../../business/domain/entities/user.js';
import type {
  CreateUserInput,
  UserRepository,
} from '../../business/repositories/user.repository.js';
import { AesFieldCipher } from '../adapters/aes-field-cipher.js';
import { UserModel } from '../database/models/index.js';
import { toUserEntity } from './mappers.js';

@Injectable()
export class SequelizeUserRepository implements UserRepository {
  constructor(
    @InjectModel(UserModel) private readonly users: typeof UserModel,
    private readonly cipher: AesFieldCipher,
  ) {}

  async findById(id: string, tx?: unknown): Promise<User | null> {
    const row = await this.users.findByPk(id, {
      transaction: tx as Transaction | undefined,
    });
    return row ? toUserEntity(row) : null;
  }

  async create(input: CreateUserInput, tx?: unknown): Promise<User> {
    const row = await this.users.create(
      {
        firstName: input.firstName,
        lastName: input.lastName,
        bvnEncrypted: input.bvn === null ? null : this.cipher.encrypt(input.bvn),
      },
      { transaction: tx as Transaction | undefined },
    );
    return toUserEntity(row);
  }
}
