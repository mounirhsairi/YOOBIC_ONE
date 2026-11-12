import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface NotificationAttributes {
  id: string;
  userId: string;
  organizationId: string;
  type: string;
  title: string;
  body: string;
  metadata?: any;
  isRead: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type NotificationCreationAttributes = Optional<
  NotificationAttributes,
  'id' | 'metadata' | 'isRead' | 'createdAt' | 'updatedAt'
>;

export class Notification
  extends Model<NotificationAttributes, NotificationCreationAttributes>
  implements NotificationAttributes
{
  declare id: string;
  declare userId: string;
  declare organizationId: string;
  declare type: string;
  declare title: string;
  declare body: string;
  declare metadata: any;
  declare isRead: boolean;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Notification.init(
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
    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    metadata: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    sequelize,
    tableName: 'notifications',
    timestamps: true,
    indexes: [
      { fields: ['userId', 'isRead'] },
      { fields: ['organizationId'] },
    ],
  }
);
