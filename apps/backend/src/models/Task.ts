import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface TaskAttributes {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'DRAFT' | 'SCHEDULED' | 'TODO' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'OVERDUE';
  category?: string | null;
  startDate?: Date | null;
  dueDate?: Date | null;
  requiresValidation: boolean;
  requiresPhotoEvidence: boolean;
  requiresSignature: boolean;
  estimatedDurationMinutes?: number | null;
  checklist: any[];
  createdById: string;
  storeId?: string | null;
  teamId?: string | null;
  assignedUserId?: string | null;
  templateId?: string | null;
  formTemplateId?: string | null;
  formProgress?: any;
  recurrenceRule?: string | null;
  recurrenceParentId?: string | null;
  isRecurringInstance: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TaskCreationAttributes = Optional<
  TaskAttributes,
  | 'id'
  | 'description'
  | 'instructions'
  | 'priority'
  | 'status'
  | 'category'
  | 'startDate'
  | 'dueDate'
  | 'requiresValidation'
  | 'requiresPhotoEvidence'
  | 'requiresSignature'
  | 'estimatedDurationMinutes'
  | 'checklist'
  | 'storeId'
  | 'teamId'
  | 'assignedUserId'
  | 'templateId'
  | 'recurrenceRule'
  | 'recurrenceParentId'
  | 'isRecurringInstance'
  | 'createdAt'
  | 'updatedAt'
>;

export class Task extends Model<TaskAttributes, TaskCreationAttributes> implements TaskAttributes {
  declare id: string;
  declare organizationId: string;
  declare title: string;
  declare description: string | null;
  declare instructions: string | null;
  declare priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  declare status: 'DRAFT' | 'SCHEDULED' | 'TODO' | 'IN_PROGRESS' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'OVERDUE';
  declare category: string | null;
  declare startDate: Date | null;
  declare dueDate: Date | null;
  declare requiresValidation: boolean;
  declare requiresPhotoEvidence: boolean;
  declare requiresSignature: boolean;
  declare estimatedDurationMinutes: number | null;
  declare checklist: any[];
  declare createdById: string;
  declare storeId: string | null;
  declare teamId: string | null;
  declare assignedUserId: string | null;
  declare templateId: string | null;
  declare formTemplateId: string | null;
  declare formProgress: any;
  declare recurrenceRule: string | null;
  declare recurrenceParentId: string | null;
  declare isRecurringInstance: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Task.init(
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
    status: {
      type: DataTypes.ENUM(
        'DRAFT',
        'SCHEDULED',
        'TODO',
        'IN_PROGRESS',
        'SUBMITTED',
        'APPROVED',
        'REJECTED',
        'CANCELLED',
        'OVERDUE'
      ),
      defaultValue: 'TODO',
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    dueDate: {
      type: DataTypes.DATE,
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
    createdById: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    storeId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    assignedUserId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    templateId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    recurrenceRule: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    recurrenceParentId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isRecurringInstance: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'tasks',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { fields: ['organizationId', 'status'] },
      { fields: ['assignedUserId'] },
      { fields: ['storeId'] },
      { fields: ['teamId'] },
      { fields: ['dueDate'] },
    ],
  }
);

