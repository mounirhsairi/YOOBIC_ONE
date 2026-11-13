import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface TaskValidationAttributes {
  id: string;
  taskId: string;
  submissionId: string;
  organizationId: string;
  validatedById: string;
  decision: 'APPROVED' | 'REJECTED';
  reason?: string | null;
  validatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TaskValidationCreationAttributes = Optional<
  TaskValidationAttributes,
  'id' | 'reason' | 'validatedAt' | 'createdAt' | 'updatedAt'
>;

export class TaskValidation
  extends Model<TaskValidationAttributes, TaskValidationCreationAttributes>
  implements TaskValidationAttributes
{
  declare id: string;
  declare taskId: string;
  declare submissionId: string;
  declare organizationId: string;
  declare validatedById: string;
  declare decision: 'APPROVED' | 'REJECTED';
  declare reason: string | null;
  declare validatedAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

TaskValidation.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    submissionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    validatedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    decision: {
      type: DataTypes.ENUM('APPROVED', 'REJECTED'),
      allowNull: false,
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    validatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'task_validations',
    timestamps: true,
    indexes: [
      { fields: ['taskId'] },
      { fields: ['submissionId'] },
      { fields: ['organizationId'] },
      { fields: ['validatedById'] },
    ],
  }
);
