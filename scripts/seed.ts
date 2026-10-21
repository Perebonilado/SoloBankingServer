import 'dotenv/config';
import 'reflect-metadata';
import { Sequelize } from 'sequelize-typescript';
import { AesFieldCipher } from '../src/web/adapters/aes-field-cipher.js';
import {
  ALL_MODELS,
  AccountModel,
  UserModel,
} from '../src/web/database/models/index.js';
import { SequelizeUserRepository } from '../src/web/repositories/sequelize-user.repository.js';

const CUSTOMERS = [
  {
    firstName: 'Richard',
    lastName: 'Eradiri',
    bvn: '22200000001',
    accountNumber: '0175274355',
    balanceKobo: 10_000_000,
  },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set, cannot seed.');
  }
  if (!process.env.BVN_ENCRYPTION_KEY) {
    throw new Error('BVN_ENCRYPTION_KEY is not set, cannot seed.');
  }

  const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    models: ALL_MODELS,
    timezone: '+00:00',
    logging: false,
    define: { underscored: true, charset: 'utf8mb4' },
  });
  await sequelize.authenticate();

  const users = new SequelizeUserRepository(
    UserModel,
    new AesFieldCipher(process.env.BVN_ENCRYPTION_KEY),
  );

  for (const customer of CUSTOMERS) {
    const existing = await AccountModel.findOne({
      where: { accountNumber: customer.accountNumber },
    });
    if (existing) {
      console.log(`Account ${customer.accountNumber} already exists.`);
      continue;
    }

    await sequelize.transaction(async (transaction) => {
      const user = await users.create(
        {
          firstName: customer.firstName,
          lastName: customer.lastName,
          bvn: customer.bvn,
        },
        transaction,
      );
      await AccountModel.create(
        {
          userId: user.id,
          accountNumber: customer.accountNumber,
          balanceKobo: customer.balanceKobo,
        },
        { transaction },
      );
    });
    console.log(
      `Seeded ${customer.firstName} ${customer.lastName}: ${customer.accountNumber}`,
    );
  }

  await sequelize.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
