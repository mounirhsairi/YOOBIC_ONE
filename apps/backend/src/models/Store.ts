import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface StoreAttributes {
  id: string;
  organizationId: string;
  regionId?: string | null;
  districtId?: string | null;
  name: string;
  code: string;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  timezone: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type StoreCreationAttributes = Optional<
  StoreAttributes,
  'id' | 'regionId' | 'districtId' | 'address' | 'city' | 'country' | 'timezone' | 'isActive' | 'createdAt' | 'updatedAt'
>;

export class Store extends Model<StoreAttributes, StoreCreationAttributes> implements StoreAttributes {
  declare id: string;
  declare organizationId: string;
  declare regionId: string | null;
  declare districtId: string | null;
  declare name: string;
  declare code: string;
  declare address: string | null;
  declare city: string | null;
  declare country: string | null;
  declare timezone: string;
  declare isActive: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Store.init(
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
      allowNull: true,
    },
    districtId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'UTC',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'stores',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { unique: true, fields: ['organizationId', 'code'] },
      { fields: ['regionId'] },
      { fields: ['districtId'] },
    ],
  }
);
