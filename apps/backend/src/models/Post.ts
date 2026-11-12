import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface PostAttributes {
  id: string;
  communityId: string;
  authorId: string;
  content: string;
  mediaUrls: string[];
  likesCount: number;
  commentsCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type PostCreationAttributes = Optional<
  PostAttributes,
  'id' | 'mediaUrls' | 'likesCount' | 'commentsCount' | 'createdAt' | 'updatedAt'
>;

export class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  declare id: string;
  declare communityId: string;
  declare authorId: string;
  declare content: string;
  declare mediaUrls: string[];
  declare likesCount: number;
  declare commentsCount: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Post.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    communityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    mediaUrls: {
      type: DataTypes.JSON,
      defaultValue: [],
    },
    likesCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    commentsCount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    tableName: 'posts',
    timestamps: true,
    indexes: [{ fields: ['communityId'] }, { fields: ['authorId'] }],
  }
);
