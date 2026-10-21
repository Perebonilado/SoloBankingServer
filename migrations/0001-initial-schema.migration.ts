import { DataTypes, Op } from 'sequelize';
import type { Migration } from './umzug.js';

const timestamps = {
  created_at: { type: DataTypes.DATE, allowNull: false },
  updated_at: { type: DataTypes.DATE, allowNull: false },
};

export const up: Migration = async ({ context: q }) => {
  await q.createTable('users', {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    first_name: { type: DataTypes.STRING(100), allowNull: false },
    last_name: { type: DataTypes.STRING(100), allowNull: false },
    bvn_encrypted: { type: DataTypes.STRING(255), allowNull: true },
    ...timestamps,
  });

  await q.createTable('accounts', {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
    },
    account_number: { type: DataTypes.CHAR(10), allowNull: false, unique: true },
    balance_kobo: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
    ...timestamps,
  });
  await q.addConstraint('accounts', {
    type: 'check',
    name: 'accounts_balance_kobo_not_negative',
    fields: ['balance_kobo'],
    where: { balance_kobo: { [Op.gte]: 0 } },
  });

  await q.createTable('beneficiaries', {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    account_name: { type: DataTypes.STRING(150), allowNull: false },
    account_number: { type: DataTypes.CHAR(10), allowNull: false },
    bank_code: { type: DataTypes.STRING(10), allowNull: false },
    bank_name: { type: DataTypes.STRING(100), allowNull: false },
    ...timestamps,
  });
  await q.addConstraint('beneficiaries', {
    type: 'unique',
    name: 'beneficiaries_user_account_bank_unique',
    fields: ['user_id', 'account_number', 'bank_code'],
  });
  await q.addIndex('beneficiaries', ['user_id', 'account_name'], {
    name: 'beneficiaries_user_account_name_index',
  });

  await q.createTable('transactions', {
    id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    account_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'accounts', key: 'id' },
    },
    type: { type: DataTypes.ENUM('debit', 'credit'), allowNull: false },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'failed', 'expired'),
      allowNull: false,
    },
    amount_kobo: { type: DataTypes.BIGINT, allowNull: false },
    balance_after_kobo: { type: DataTypes.BIGINT, allowNull: true },
    description: { type: DataTypes.STRING(255), allowNull: true },
    counterparty_name: { type: DataTypes.STRING(150), allowNull: true },
    counterparty_account_number: { type: DataTypes.CHAR(10), allowNull: true },
    bank_code: { type: DataTypes.STRING(10), allowNull: true },
    idempotency_key: { type: DataTypes.STRING(64), allowNull: true },
    related_transaction_id: {
      type: DataTypes.UUID,
      allowNull: true,
      references: { model: 'transactions', key: 'id' },
    },
    expires_at: { type: DataTypes.DATE, allowNull: true },
    completed_at: { type: DataTypes.DATE, allowNull: true },
    ...timestamps,
  });
  await q.addConstraint('transactions', {
    type: 'check',
    name: 'transactions_amount_kobo_positive',
    fields: ['amount_kobo'],
    where: { amount_kobo: { [Op.gt]: 0 } },
  });
  await q.addConstraint('transactions', {
    type: 'unique',
    name: 'transactions_account_idempotency_unique',
    fields: ['account_id', 'idempotency_key'],
  });
  await q.addIndex('transactions', ['account_id', 'status', 'created_at'], {
    name: 'transactions_account_status_created_index',
  });
};

export const down: Migration = async ({ context: q }) => {
  await q.dropTable('transactions');
  await q.dropTable('beneficiaries');
  await q.dropTable('accounts');
  await q.dropTable('users');
};
