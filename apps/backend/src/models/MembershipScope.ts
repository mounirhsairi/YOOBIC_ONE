import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface MembershipScopeAttributes {
  id: string;
  membershipId: string;
  scopeType: 'ORGANIZATION' | 'REGION' | 'DISTRICT' | 'STORE' | 'TEAM';
  scopeId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type MembershipScopeCreationAttributes = Optional<MembershipScopeAttributes, 'id' | 'createdAt' | 'updatedAt'>;

export class MembershipScope
  extends Model<MembershipScopeAttributes, MembershipScopeCreationAttributes>
  implements MembershipScopeAttributes
{
  declare id: string;
  declare membershipId: string;
  declare scopeType: 'ORGANIZATION' | 'REGION' | 'DISTRICT' | 'STORE' | 'TEAM';
  declare scopeId: string;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

MembershipScope.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    membershipId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    scopeType: {
      type: DataTypes.ENUM('ORGANIZATION', 'REGION', 'DISTRICT', 'STORE', 'TEAM'),
      allowNull: false,
    },
    scopeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'membership_scopes',
    timestamps: true,
    indexes: [
      { fields: ['membershipId'] },
      { fields: ['scopeType', 'scopeId'] },
    ],
  }
);
