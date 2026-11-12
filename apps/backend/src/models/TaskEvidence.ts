import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface TaskEvidenceAttributes {
  id: string;
  submissionId: string;
  taskId: string;
  type: 'PHOTO' | 'DOCUMENT' | 'SIGNATURE';
  fileUrl: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  capturedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TaskEvidenceCreationAttributes = Optional<
  TaskEvidenceAttributes,
  'id' | 'capturedAt' | 'createdAt' | 'updatedAt'
>;

export class TaskEvidence
  extends Model<TaskEvidenceAttributes, TaskEvidenceCreationAttributes>
  implements TaskEvidenceAttributes
{
  declare id: string;
  declare submissionId: string;
  declare taskId: string;
  declare type: 'PHOTO' | 'DOCUMENT' | 'SIGNATURE';
  declare fileUrl: string;
  declare fileName: string;
  declare fileSizeBytes: number;
  declare mimeType: string;
  declare capturedAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

TaskEvidence.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    submissionId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    taskId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('PHOTO', 'DOCUMENT', 'SIGNATURE'),
      allowNull: false,
    },
    fileUrl: {
      type: DataTypes.STRING(1000),
      allowNull: false,
    },
    fileName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fileSizeBytes: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    mimeType: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    capturedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'task_evidence',
    timestamps: true,
    indexes: [
      { fields: ['submissionId'] },
      { fields: ['taskId'] },
    ],
  }
);
