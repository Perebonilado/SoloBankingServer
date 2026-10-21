import { DataTypes } from 'sequelize';
import type { Migration } from './umzug.js';

export const up: Migration = async ({ context: q }) => {
  await q.createTable('revoked_tokens', {
    token_id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    expires_at: { type: DataTypes.DATE, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false },
  });
  await q.addIndex('revoked_tokens', ['expires_at'], {
    name: 'revoked_tokens_expires_at_index',
  });
};

export const down: Migration = async ({ context: q }) => {
  await q.dropTable('revoked_tokens');
};
