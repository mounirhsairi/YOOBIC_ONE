import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface CourseAttributes {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  category: string;
  estimatedMinutes: number;
  isMandatory: boolean;
  modules: any[];
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CourseCreationAttributes = Optional<
  CourseAttributes,
  'id' | 'description' | 'thumbnailUrl' | 'category' | 'estimatedMinutes' | 'isMandatory' | 'isActive' | 'createdAt' | 'updatedAt'
>;

export class Course extends Model<CourseAttributes, CourseCreationAttributes> implements CourseAttributes {
  declare id: string;
  declare organizationId: string;
  declare title: string;
  declare description: string | null;
  declare thumbnailUrl: string | null;
  declare category: string;
  declare estimatedMinutes: number;
  declare isMandatory: boolean;
  declare modules: any[];
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Course.init(
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
    thumbnailUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(100),
      defaultValue: 'COMPLIANCE',
    },
    estimatedMinutes: {
      type: DataTypes.INTEGER,
      defaultValue: 15,
    },
    isMandatory: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    modules: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'courses',
    timestamps: true,
    indexes: [{ fields: ['organizationId'] }],
  }
);
