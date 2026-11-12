import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface UserAttributes {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string | null;
  phoneNumber?: string | null;
  isSuperAdmin: boolean;
  isActive: boolean;
  refreshTokenHash?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type UserCreationAttributes = Optional<
  UserAttributes,
  'id' | 'avatarUrl' | 'phoneNumber' | 'isSuperAdmin' | 'isActive' | 'refreshTokenHash' | 'createdAt' | 'updatedAt'
>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare passwordHash: string;
  declare firstName: string;
  declare lastName: string;
  declare avatarUrl: string | null;
  declare phoneNumber: string | null;
  declare isSuperAdmin: boolean;
  declare isActive: boolean;
  declare refreshTokenHash: string | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    avatarUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    phoneNumber: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    isSuperAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    refreshTokenHash: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    indexes: [{ unique: true, fields: ['email'] }],
  }
);
