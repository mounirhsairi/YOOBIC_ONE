import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface CommunityAttributes {
  id: string;
  organizationId: string;
  name: string;
  description?: string | null;
  isPrivate: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type CommunityCreationAttributes = Optional<CommunityAttributes, 'id' | 'description' | 'isPrivate' | 'createdAt' | 'updatedAt'>;

export class Community
  extends Model<CommunityAttributes, CommunityCreationAttributes>
  implements CommunityAttributes
{
  declare id: string;
  declare organizationId: string;
  declare name: string;
  declare description: string | null;
  declare isPrivate: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Community.init(
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
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    isPrivate: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'communities',
    timestamps: true,
    indexes: [{ fields: ['organizationId'] }],
  }
);
