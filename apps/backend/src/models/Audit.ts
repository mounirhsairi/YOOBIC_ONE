import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface AuditAttributes {
  id: string;
  organizationId: string;
  templateId: string;
  storeId: string;
  auditorId: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledDate: Date;
  completedAt?: Date | null;
  score?: number | null;
  passed?: boolean | null;
  findings?: any;
  correctiveActions?: any[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type AuditCreationAttributes = Optional<
  AuditAttributes,
  'id' | 'status' | 'completedAt' | 'score' | 'passed' | 'findings' | 'correctiveActions' | 'createdAt' | 'updatedAt'
>;

export class Audit extends Model<AuditAttributes, AuditCreationAttributes> implements AuditAttributes {
  declare id: string;
  declare organizationId: string;
  declare templateId: string;
  declare storeId: string;
  declare auditorId: string;
  declare status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  declare scheduledDate: Date;
  declare completedAt: Date | null;
  declare score: number | null;
  declare passed: boolean | null;
  declare findings: any;
  declare correctiveActions: any[];
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Audit.init(
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
    templateId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    storeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    auditorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
      defaultValue: 'SCHEDULED',
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    passed: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    findings: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    correctiveActions: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
  },
  {
    sequelize,
    tableName: 'audits',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { fields: ['storeId'] },
      { fields: ['auditorId'] },
      { fields: ['status'] },
    ],
  }
);
