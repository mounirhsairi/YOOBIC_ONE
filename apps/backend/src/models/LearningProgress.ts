import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface LearningProgressAttributes {
  id: string;
  userId: string;
  courseId: string;
  organizationId: string;
  completedLessonIds: string[];
  quizScore?: number | null;
  passed: boolean;
  completedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type LearningProgressCreationAttributes = Optional<
  LearningProgressAttributes,
  'id' | 'completedLessonIds' | 'quizScore' | 'passed' | 'completedAt' | 'createdAt' | 'updatedAt'
>;

export class LearningProgress
  extends Model<LearningProgressAttributes, LearningProgressCreationAttributes>
  implements LearningProgressAttributes
{
  declare id: string;
  declare userId: string;
  declare courseId: string;
  declare organizationId: string;
  declare completedLessonIds: string[];
  declare quizScore: number | null;
  declare passed: boolean;
  declare completedAt: Date | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

LearningProgress.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    completedLessonIds: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    quizScore: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },
    passed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'learning_progress',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId', 'courseId'] },
      { fields: ['organizationId'] },
    ],
  }
);
