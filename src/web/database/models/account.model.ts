import {
  BelongsTo,
  Column,
  DataType,
  Default,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
  Unique,
} from 'sequelize-typescript';
import { UserModel } from './user.model.js';

@Table({ tableName: 'accounts', underscored: true })
export class AccountModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => UserModel)
  @Unique
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Unique
  @Column({ type: DataType.CHAR(10), allowNull: false })
  declare accountNumber: string;

  @Column({ type: DataType.BIGINT, allowNull: false, defaultValue: 0 })
  declare balanceKobo: number;

  @BelongsTo(() => UserModel)
  declare user?: UserModel;
}
