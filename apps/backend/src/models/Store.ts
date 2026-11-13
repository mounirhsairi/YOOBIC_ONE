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
  addressLine2?: string | null;
  city?: string | null;
  /** Canadian province / territory code e.g. QC, ON, BC */
  province?: string | null;
  postalCode?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
  timezone: string;
  openingHours?: string | null;
  notes?: string | null;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type StoreCreationAttributes = Optional<
  StoreAttributes,
  | 'id'
  | 'regionId'
  | 'districtId'
  | 'address'
  | 'addressLine2'
  | 'city'
  | 'province'
  | 'postalCode'
  | 'country'
  | 'latitude'
  | 'longitude'
  | 'phone'
  | 'email'
  | 'timezone'
  | 'openingHours'
  | 'notes'
  | 'isActive'
  | 'createdAt'
  | 'updatedAt'
>;

export class Store extends Model<StoreAttributes, StoreCreationAttributes> implements StoreAttributes {
  declare id: string;
  declare organizationId: string;
  declare regionId: string | null;
  declare districtId: string | null;
  declare name: string;
  declare code: string;
  declare address: string | null;
  declare addressLine2: string | null;
  declare city: string | null;
  declare province: string | null;
  declare postalCode: string | null;
  declare country: string | null;
  declare latitude: number | null;
  declare longitude: number | null;
  declare phone: string | null;
  declare email: string | null;
  declare timezone: string;
  declare openingHours: string | null;
  declare notes: string | null;
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
    addressLine2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    province: {
      type: DataTypes.STRING(10),
      allowNull: true,
      comment: 'Canadian province/territory code (QC, ON, BC, ...)',
    },
    postalCode: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: true,
      defaultValue: 'Canada',
    },
    latitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DOUBLE,
      allowNull: true,
    },
    phone: {
      type: DataTypes.STRING(30),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    timezone: {
      type: DataTypes.STRING(50),
      defaultValue: 'America/Toronto',
    },
    openingHours: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
      { fields: ['province'] },
      { fields: ['city'] },
    ],
  }
);
