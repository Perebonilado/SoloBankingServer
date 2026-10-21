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
import { UserModel } from './user.model.js';

@Table({ tableName: 'beneficiaries', underscored: true })
export class BeneficiaryModel extends Model {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => UserModel)
  @Column({ type: DataType.UUID, allowNull: false })
  declare userId: string;

  @Column({ type: DataType.STRING(150), allowNull: false })
  declare accountName: string;

  @Column({ type: DataType.CHAR(10), allowNull: false })
  declare accountNumber: string;

  @Column({ type: DataType.STRING(10), allowNull: false })
  declare bankCode: string;

  @Column({ type: DataType.STRING(100), allowNull: false })
  declare bankName: string;

  @BelongsTo(() => UserModel)
  declare user?: UserModel;
}
