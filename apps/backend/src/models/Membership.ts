import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface MembershipAttributes {
  id: string;
  userId: string;
  organizationId: string;
  roleId: string;
  regionId?: string | null;
  districtId?: string | null;
  storeId?: string | null;
  teamId?: string | null;
  jobTitle?: string | null;
  employeeNumber?: string | null;
  status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DEACTIVATED';
  joinedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MembershipCreationAttributes = Optional<
  MembershipAttributes,
  | 'id'
  | 'regionId'
  | 'districtId'
  | 'storeId'
  | 'teamId'
  | 'jobTitle'
  | 'employeeNumber'
  | 'status'
  | 'joinedAt'
  | 'createdAt'
  | 'updatedAt'
>;

export class Membership
  extends Model<MembershipAttributes, MembershipCreationAttributes>
  implements MembershipAttributes
{
  declare id: string;
  declare userId: string;
  declare organizationId: string;
  declare roleId: string;
  declare regionId: string | null;
  declare districtId: string | null;
  declare storeId: string | null;
  declare teamId: string | null;
  declare jobTitle: string | null;
  declare employeeNumber: string | null;
  declare status: 'ACTIVE' | 'INVITED' | 'SUSPENDED' | 'DEACTIVATED';
  declare joinedAt: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Membership.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    roleId: {
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
    storeId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    teamId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    jobTitle: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    employeeNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INVITED', 'SUSPENDED', 'DEACTIVATED'),
      defaultValue: 'ACTIVE',
    },
    joinedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: 'memberships',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['userId', 'organizationId'] },
      { fields: ['organizationId', 'status'] },
      { fields: ['storeId'] },
      { fields: ['teamId'] },
    ],
  }
);
