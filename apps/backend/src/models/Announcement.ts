import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface AnnouncementAttributes {
  id: string;
  organizationId: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  authorId: string;
  targetRole?: string | null;
  targetStoreId?: string | null;
  isPinned: boolean;
  publishedAt?: Date;
  readCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type AnnouncementCreationAttributes = Optional<
  AnnouncementAttributes,
  'id' | 'imageUrl' | 'targetRole' | 'targetStoreId' | 'isPinned' | 'publishedAt' | 'readCount' | 'createdAt' | 'updatedAt'
>;

export class Announcement
  extends Model<AnnouncementAttributes, AnnouncementCreationAttributes>
  implements AnnouncementAttributes
{
  declare id: string;
  declare organizationId: string;
  declare title: string;
  declare content: string;
  declare imageUrl: string | null;
  declare authorId: string;
  declare targetRole: string | null;
  declare targetStoreId: string | null;
  declare isPinned: boolean;
  declare publishedAt: Date;
  declare readCount: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Announcement.init(
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
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    targetRole: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    targetStoreId: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    isPinned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    publishedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    readCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'announcements',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { fields: ['targetStoreId'] },
      { fields: ['isPinned'] },
    ],
  }
);
