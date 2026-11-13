import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface TaskTemplateAttributes {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category?: string | null;
  requiresValidation: boolean;
  requiresPhotoEvidence: boolean;
  requiresSignature: boolean;
  estimatedDurationMinutes?: number | null;
  checklist: any[];
  // Recurrence
  recurrenceEnabled: boolean;
  recurrenceRule?: string | null; // e.g. "DAILY", "WEEKLY", "MONTHLY", or RRULE-like string
  recurrenceTime?: string | null; // "07:00"
  recurrenceDaysOfWeek?: number[] | null; // 0=Sun .. 6=Sat
  isActive: boolean;
  createdById: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TaskTemplateCreationAttributes = Optional<
  TaskTemplateAttributes,
  | 'id'
  | 'description'
  | 'instructions'
  | 'priority'
  | 'category'
  | 'requiresValidation'
  | 'requiresPhotoEvidence'
  | 'requiresSignature'
  | 'estimatedDurationMinutes'
  | 'checklist'
  | 'recurrenceEnabled'
  | 'recurrenceRule'
  | 'recurrenceTime'
  | 'recurrenceDaysOfWeek'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
>;

export class TaskTemplate
  extends Model<TaskTemplateAttributes, TaskTemplateCreationAttributes>
  implements TaskTemplateAttributes
{
  declare id: string;
  declare organizationId: string;
  declare title: string;
  declare description: string | null;
  declare instructions: string | null;
  declare priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  declare category: string | null;
  declare requiresValidation: boolean;
  declare requiresPhotoEvidence: boolean;
  declare requiresSignature: boolean;
  declare estimatedDurationMinutes: number | null;
  declare checklist: any[];
  declare recurrenceEnabled: boolean;
  declare recurrenceRule: string | null;
  declare recurrenceTime: string | null;
  declare recurrenceDaysOfWeek: number[] | null;
  declare isActive: boolean;
  declare createdById: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

TaskTemplate.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    priority: {
      type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
      defaultValue: 'MEDIUM',
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    requiresValidation: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    requiresPhotoEvidence: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    requiresSignature: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    estimatedDurationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    checklist: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    recurrenceEnabled: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    recurrenceRule: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    recurrenceTime: {
      type: DataTypes.STRING(10),
      allowNull: true,
    },
    recurrenceDaysOfWeek: {
      type: DataTypes.JSON,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'task_templates',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { fields: ['organizationId', 'isActive'] },
    ],
  }
);
