import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface WorkerAttributes {
  id: string;
  user_id: string;
  trade: string;
  experience_years: number;
  description?: string;
  city: string;
  area: string;
  latitude?: number;
  longitude?: number;
  min_charge: number;
  hourly_rate: number;
  visit_charge: number;
  cnic: string;
  cnic_verified: boolean;
  portfolio_photos?: any[];
  service_areas?: string[];
  rating: number;
  total_ratings: number;
  completed_jobs: number;
  is_available: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface WorkerCreationAttributes extends Optional<WorkerAttributes, 'id' | 'rating' | 'total_ratings' | 'completed_jobs' | 'is_available' | 'cnic_verified'> {}

class Worker extends Model<WorkerAttributes, WorkerCreationAttributes> implements WorkerAttributes {
  public id!: string;
  public user_id!: string;
  public trade!: string;
  public experience_years!: number;
  public description?: string;
  public city!: string;
  public area!: string;
  public latitude?: number;
  public longitude?: number;
  public min_charge!: number;
  public hourly_rate!: number;
  public visit_charge!: number;
  public cnic!: string;
  public cnic_verified!: boolean;
  public portfolio_photos?: any[];
  public service_areas?: string[];
  public rating!: number;
  public total_ratings!: number;
  public completed_jobs!: number;
  public is_available!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Worker.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    trade: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    area: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    latitude: {
      type: DataTypes.DECIMAL(10, 8),
      allowNull: true,
    },
    longitude: {
      type: DataTypes.DECIMAL(11, 8),
      allowNull: true,
    },
    min_charge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 500,
    },
    hourly_rate: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 300,
    },
    visit_charge: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 200,
    },
    cnic: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    cnic_verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    portfolio_photos: {
      type: DataTypes.JSONB,
      allowNull: true,
      defaultValue: [],
    },
    service_areas: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true,
      defaultValue: [],
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 5.0,
    },
    total_ratings: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    completed_jobs: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'workers',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['trade'],
      },
      {
        fields: ['city', 'area'],
      },
      {
        fields: ['rating'],
      },
    ],
  }
);

export default Worker;
