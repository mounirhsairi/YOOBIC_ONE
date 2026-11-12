import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface RegionAttributes {
  id: string;
  organizationId: string;
  name: string;
  code: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RegionCreationAttributes = Optional<RegionAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class Region extends Model<RegionAttributes, RegionCreationAttributes> implements RegionAttributes {
  declare id: string;
  declare organizationId: string;
  declare name: string;
  declare code: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Region.init(
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
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'regions',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { unique: true, fields: ['organizationId', 'code'] },
    ],
  }
);
