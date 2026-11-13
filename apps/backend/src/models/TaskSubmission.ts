import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface TaskSubmissionAttributes {
  id: string;
  taskId: string;
  organizationId: string;
  submittedById: string;
  comment?: string | null;
  checklistResponses: any;
  submittedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TaskSubmissionCreationAttributes = Optional<
  TaskSubmissionAttributes,
  'id' | 'comment' | 'checklistResponses' | 'submittedAt' | 'createdAt' | 'updatedAt'
>;

export class TaskSubmission
  extends Model<TaskSubmissionAttributes, TaskSubmissionCreationAttributes>
  implements TaskSubmissionAttributes
{
  declare id: string;
  declare taskId: string;
  declare organizationId: string;
  declare submittedById: string;
  declare comment: string | null;
  declare checklistResponses: any;
  declare submittedAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

TaskSubmission.init(
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
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    submittedById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    checklistResponses: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    submittedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'task_submissions',
    timestamps: true,
    indexes: [
      { fields: ['taskId'] },
      { fields: ['organizationId'] },
      { fields: ['submittedById'] },
    ],
  }
);
