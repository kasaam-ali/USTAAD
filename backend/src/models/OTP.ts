import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

export interface OTPAttributes {
  id: string;
  phone: string;
  otp: string;
  purpose: 'registration' | 'login' | 'password_reset';
  is_used: boolean;
  expires_at: Date;
  created_at?: Date;
  updated_at?: Date;
}

interface OTPCreationAttributes extends Optional<OTPAttributes, 'id' | 'is_used'> {}

class OTP extends Model<OTPAttributes, OTPCreationAttributes> implements OTPAttributes {
  public id!: string;
  public phone!: string;
  public otp!: string;
  public purpose!: 'registration' | 'login' | 'password_reset';
  public is_used!: boolean;
  public expires_at!: Date;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  public isExpired(): boolean {
    return new Date() > this.expires_at;
  }
}

OTP.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    otp: {
      type: DataTypes.STRING(6),
      allowNull: false,
    },
    purpose: {
      type: DataTypes.ENUM('registration', 'login', 'password_reset'),
      allowNull: false,
    },
    is_used: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'otps',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['phone', 'otp'],
      },
      {
        fields: ['expires_at'],
      },
    ],
  }
);

export default OTP;
