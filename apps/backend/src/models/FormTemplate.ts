import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

/**
 * FormTemplate.pages structure (JSON):
 * [
 *   {
 *     id: string,
 *     title: string,
 *     fields: [
 *       {
 *         id: string,
 *         type: 'text'|'number'|'textarea'|'yes_no'|'select'|'photo'|'instruction'|'image'|'document'|'info',
 *         label: string,
 *         required?: boolean,
 *         max?: number,          // photo max count
 *         options?: string[],    // select / custom yes_no
 *         url?: string,          // image / document
 *         content?: string,      // instruction / info body
 *         fileName?: string,
 *         fileSize?: string
 *       }
 *     ]
 *   }
 * ]
 */
export interface FormTemplateAttributes {
  id: string;
  organizationId: string;
  title: string;
  description?: string | null;
  category: string;
  pages: any[];
  estimatedDurationMinutes?: number | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type FormTemplateCreationAttributes = Optional<
  FormTemplateAttributes,
  'id' | 'description' | 'category' | 'pages' | 'estimatedDurationMinutes' | 'isActive' | 'createdAt' | 'updatedAt'
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
  declare pages: any[];
  declare estimatedDurationMinutes: number | null;
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
    pages: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    estimatedDurationMinutes: {
      type: DataTypes.INTEGER,
      allowNull: true,
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
    indexes: [{ fields: ['organizationId'] }, { fields: ['organizationId', 'isActive'] }],
  }
);
