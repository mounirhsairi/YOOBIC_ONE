import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface TeamAttributes {
  id: string;
  organizationId: string;
  storeId?: string | null;
  name: string;
  description?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type TeamCreationAttributes = Optional<TeamAttributes, 'id' | 'storeId' | 'description' | 'createdAt' | 'updatedAt'>;

export class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  declare id: string;
  declare organizationId: string;
  declare storeId: string | null;
  declare name: string;
  declare description: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Team.init(
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
    storeId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'teams',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { fields: ['storeId'] },
    ],
  }
);
