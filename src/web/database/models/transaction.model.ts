import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { TransactionStatus } from '../../../business/domain/values/transaction-status.js';
import { TransactionType } from '../../../business/domain/values/transaction-type.js';
import { AccountModel } from './account.model.js';

@Table({ tableName: 'transactions', underscored: true })
export class TransactionModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => AccountModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare accountId: string;

  @Column({
    type: DataType.ENUM(...Object.values(TransactionType)),
    allowNull: false,
  })
  declare type: TransactionType;

  @Column({
    type: DataType.ENUM(...Object.values(TransactionStatus)),
    allowNull: false,
  })
  declare status: TransactionStatus;

  @Column({ type: DataType.BIGINT, allowNull: false })
  declare amountKobo: number;

  @Column({ type: DataType.BIGINT, allowNull: true })
  declare balanceAfterKobo: number | null;

  @Column({ type: DataType.STRING(255), allowNull: true })
  declare description: string | null;

  @Column({ type: DataType.STRING(150), allowNull: true })
  declare counterpartyName: string | null;

  @Column({ type: DataType.CHAR(10), allowNull: true })
  declare counterpartyAccountNumber: string | null;

  @Column({ type: DataType.STRING(10), allowNull: true })
  declare bankCode: string | null;

  @Column({ type: DataType.STRING(64), allowNull: true })
  declare idempotencyKey: string | null;

  @Column({ type: DataType.UUID, allowNull: true })
  declare relatedTransactionId: string | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare expiresAt: Date | null;

  @Column({ type: DataType.DATE, allowNull: true })
  declare completedAt: Date | null;

  @BelongsTo(() => AccountModel)
  declare account?: AccountModel;
}
