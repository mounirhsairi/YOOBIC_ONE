import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface CertificateAttributes {
  id: string;
  organizationId: string;
  userId: string;
  courseId: string;
  title: string;
  issuedAt: Date;
  expiresAt?: Date | null;
  scorePercentage?: number | null;
  certificateCode: string;
  metadata?: any;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CertificateCreationAttributes = Optional<
  CertificateAttributes,
  'id' | 'expiresAt' | 'scorePercentage' | 'metadata' | 'createdAt' | 'updatedAt'
>;

export class Certificate
  extends Model<CertificateAttributes, CertificateCreationAttributes>
  implements CertificateAttributes
{
  declare id: string;
  declare organizationId: string;
  declare userId: string;
  declare courseId: string;
  declare title: string;
  declare issuedAt: Date;
  declare expiresAt: Date | null;
  declare scorePercentage: number | null;
  declare certificateCode: string;
  declare metadata: any;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Certificate.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    issuedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    scorePercentage: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    certificateCode: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'certificates',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { fields: ['userId'] },
      { fields: ['courseId'] },
      { unique: true, fields: ['certificateCode'] },
    ],
  }
);
