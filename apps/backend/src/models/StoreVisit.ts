import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../database/sequelize';

export interface StoreVisitAttributes {
  id: string;
  organizationId: string;
  storeId: string;
  visitorId: string;
  visitType: 'SCHEDULED' | 'AD_HOC' | 'AUDIT' | 'COACHING';
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  plannedAt?: Date | null;
  startedAt?: Date | null;
  completedAt?: Date | null;
  notes?: string | null;
  checklistResults?: any;
  score?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export type StoreVisitCreationAttributes = Optional<
  StoreVisitAttributes,
  | 'id'
  | 'visitType'
  | 'status'
  | 'plannedAt'
  | 'startedAt'
  | 'completedAt'
  | 'notes'
  | 'checklistResults'
  | 'score'
  | 'latitude'
  | 'longitude'
  | 'createdAt'
  | 'updatedAt'
>;

export class StoreVisit
  extends Model<StoreVisitAttributes, StoreVisitCreationAttributes>
  implements StoreVisitAttributes
{
  declare id: string;
  declare organizationId: string;
  declare storeId: string;
  declare visitorId: string;
  declare visitType: 'SCHEDULED' | 'AD_HOC' | 'AUDIT' | 'COACHING';
  declare status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  declare plannedAt: Date | null;
  declare startedAt: Date | null;
  declare completedAt: Date | null;
  declare notes: string | null;
  declare checklistResults: any;
  declare score: number | null;
  declare latitude: number | null;
  declare longitude: number | null;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

StoreVisit.init(
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
    storeId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    visitorId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    visitType: {
      type: DataTypes.ENUM('SCHEDULED', 'AD_HOC', 'AUDIT', 'COACHING'),
      defaultValue: 'AD_HOC',
    },
    status: {
      type: DataTypes.ENUM('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'),
      defaultValue: 'PLANNED',
    },
    plannedAt: { type: DataTypes.DATE, allowNull: true },
    startedAt: { type: DataTypes.DATE, allowNull: true },
    completedAt: { type: DataTypes.DATE, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    checklistResults: { type: DataTypes.JSON, allowNull: true },
    score: { type: DataTypes.FLOAT, allowNull: true },
    latitude: { type: DataTypes.DOUBLE, allowNull: true },
    longitude: { type: DataTypes.DOUBLE, allowNull: true },
  },
  {
    sequelize,
    tableName: 'store_visits',
    timestamps: true,
    indexes: [
      { fields: ['organizationId'] },
      { fields: ['storeId'] },
      { fields: ['visitorId'] },
      { fields: ['status'] },
    ],
  }
);
