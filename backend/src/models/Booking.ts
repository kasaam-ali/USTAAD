import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface BookingAttributes {
  id: string;
  customer_id: string;
  worker_id: string;
  description: string;
  scheduled_date: Date;
  time_preference: 'morning' | 'afternoon' | 'evening';
  address: string;
  city: string;
  area: string;
  latitude?: number;
  longitude?: number;
  status: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  estimated_price?: number;
  final_price?: number;
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: string;
  customer_notes?: string;
  worker_notes?: string;
  cancellation_reason?: string;
  completed_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface BookingCreationAttributes extends Optional<BookingAttributes, 'id' | 'status' | 'payment_status'> {}

class Booking extends Model<BookingAttributes, BookingCreationAttributes> implements BookingAttributes {
  public id!: string;
  public customer_id!: string;
  public worker_id!: string;
  public description!: string;
  public scheduled_date!: Date;
  public time_preference!: 'morning' | 'afternoon' | 'evening';
  public address!: string;
  public city!: string;
  public area!: string;
  public latitude?: number;
  public longitude?: number;
  public status!: 'pending' | 'accepted' | 'rejected' | 'in_progress' | 'completed' | 'cancelled';
  public estimated_price?: number;
  public final_price?: number;
  public payment_status!: 'pending' | 'paid' | 'refunded';
  public payment_method?: string;
  public customer_notes?: string;
  public worker_notes?: string;
  public cancellation_reason?: string;
  public completed_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Booking.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    worker_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    scheduled_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    time_preference: {
      type: DataTypes.ENUM('morning', 'afternoon', 'evening'),
      allowNull: false,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
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
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'pending',
    },
    estimated_price: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    final_price: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'refunded'),
      defaultValue: 'pending',
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    customer_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    worker_notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cancellation_reason: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'bookings',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['customer_id'],
      },
      {
        fields: ['worker_id'],
      },
      {
        fields: ['status'],
      },
      {
        fields: ['scheduled_date'],
      },
    ],
  }
);

export default Booking;
