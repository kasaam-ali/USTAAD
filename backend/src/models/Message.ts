import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface MessageAttributes {
  id: string;
  booking_id: string;
  sender_id: string;
  message: string;
  message_type: 'text' | 'image' | 'voice' | 'location';
  is_read: boolean;
  read_at?: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id' | 'is_read'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: string;
  public booking_id!: string;
  public sender_id!: string;
  public message!: string;
  public message_type!: 'text' | 'image' | 'voice' | 'location';
  public is_read!: boolean;
  public read_at?: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id',
      },
    },
    sender_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message_type: {
      type: DataTypes.ENUM('text', 'image', 'voice', 'location'),
      defaultValue: 'text',
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['booking_id'],
      },
      {
        fields: ['sender_id'],
      },
      {
        fields: ['created_at'],
      },
    ],
  }
);

export default Message;
