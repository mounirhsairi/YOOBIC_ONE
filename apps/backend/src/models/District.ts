import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface DistrictAttributes {
  id: string;
  organizationId: string;
  regionId: string;
  name: string;
  code: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type DistrictCreationAttributes = Optional<DistrictAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class District extends Model<DistrictAttributes, DistrictCreationAttributes> implements DistrictAttributes {
  declare id: string;
  declare organizationId: string;
  declare regionId: string;
  declare name: string;
  declare code: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

District.init(
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
    regionId: {
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
    tableName: 'districts',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { fields: ['regionId'] },
      { unique: true, fields: ['organizationId', 'code'] },
    ],
  }
);
