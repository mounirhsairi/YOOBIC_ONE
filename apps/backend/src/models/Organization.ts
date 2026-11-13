import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface OrganizationAttributes {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  description?: string | null;
  contactEmail?: string | null;
  country?: string | null;
  timezone: string;
  defaultLanguage: string;
  currency: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'INACTIVE';
  subscriptionPlan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  subscriptionStatus: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED';
  createdAt?: Date;
  updatedAt?: Date;
}

export type OrganizationCreationAttributes = Optional<
  OrganizationAttributes,
  | 'id'
  | 'logoUrl'
  | 'description'
  | 'contactEmail'
  | 'country'
  | 'timezone'
  | 'defaultLanguage'
  | 'currency'
  | 'status'
  | 'subscriptionPlan'
  | 'subscriptionStatus'
  | 'createdAt'
  | 'updatedAt'
>;

export class Organization
  extends Model<OrganizationAttributes, OrganizationCreationAttributes>
  implements OrganizationAttributes
{
  declare id: string;
  declare name: string;
  declare slug: string;
  declare logoUrl: string | null;
  declare description: string | null;
  declare contactEmail: string | null;
  declare country: string | null;
  declare timezone: string;
  declare defaultLanguage: string;
  declare currency: string;
  declare status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'INACTIVE';
  declare subscriptionPlan: 'FREE' | 'STARTER' | 'PROFESSIONAL' | 'ENTERPRISE';
  declare subscriptionStatus: 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED';
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Organization.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    logoUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    contactEmail: {
      type: DataTypes.STRING(255),
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
    defaultLanguage: {
      type: DataTypes.STRING(10),
      defaultValue: 'en',
    },
    currency: {
      type: DataTypes.STRING(10),
      defaultValue: 'USD',
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'SUSPENDED', 'TRIAL', 'INACTIVE'),
      defaultValue: 'ACTIVE',
    },
    subscriptionPlan: {
      type: DataTypes.ENUM('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE'),
      defaultValue: 'STARTER',
    },
    subscriptionStatus: {
      type: DataTypes.ENUM('ACTIVE', 'TRIALING', 'PAST_DUE', 'CANCELED'),
      defaultValue: 'ACTIVE',
    },
  },
  {
    sequelize,
    tableName: 'organizations',
    timestamps: true,
    indexes: [{ unique: true, fields: ['slug'] }, { fields: ['status'] }],
  }
);
