import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface RoleAttributes {
  id: string;
  organizationId?: string | null;
  name: string;
  code: string;
  description?: string | null;
  isSystem: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RoleCreationAttributes = Optional<RoleAttributes, 'id' | 'organizationId' | 'description' | 'isSystem' | 'createdAt' | 'updatedAt'>;

export class Role extends Model<RoleAttributes, RoleCreationAttributes> implements RoleAttributes {
  declare id: string;
  declare organizationId: string | null;
  declare name: string;
  declare code: string;
  declare description: string | null;
  declare isSystem: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Role.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    isSystem: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'roles',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { unique: true, fields: ['organizationId', 'code'] },
    ],
  }
);
