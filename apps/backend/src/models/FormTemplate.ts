import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface FormTemplateAttributes {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  category: string;
  sections: any[];
  passingScorePercentage: number;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FormTemplateCreationAttributes = Optional<
  FormTemplateAttributes,
  'id' | 'description' | 'category' | 'passingScorePercentage' | 'isActive' | 'createdAt' | 'updatedAt'
>;

export class FormTemplate
  extends Model<FormTemplateAttributes, FormTemplateCreationAttributes>
  implements FormTemplateAttributes
{
  declare id: string;
  declare organizationId: string;
  declare title: string;
  declare description: string | null;
  declare category: string;
  declare sections: any[];
  declare passingScorePercentage: number;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

FormTemplate.init(
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
    category: {
      type: DataTypes.STRING(100),
      defaultValue: 'OPERATIONS',
    },
    sections: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    passingScorePercentage: {
      type: DataTypes.FLOAT,
      defaultValue: 80,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'form_templates',
    timestamps: true,
    indexes: [{ fields: ['organizationId'] }],
  }
);
