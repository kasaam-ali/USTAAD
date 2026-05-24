import User from './User';
import Worker from './Worker';
import Booking from './Booking';
import Review from './Review';
import OTP from './OTP';

// Define relationships
User.hasOne(Worker, { foreignKey: 'user_id', as: 'workerProfile' });
Worker.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Booking, { foreignKey: 'customer_id', as: 'customerBookings' });
User.hasMany(Booking, { foreignKey: 'worker_id', as: 'workerBookings' });

Booking.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Booking.belongsTo(User, { foreignKey: 'worker_id', as: 'worker' });

Booking.hasOne(Review, { foreignKey: 'booking_id', as: 'review' });
Review.belongsTo(Booking, { foreignKey: 'booking_id', as: 'booking' });

User.hasMany(Review, { foreignKey: 'customer_id', as: 'givenReviews' });
User.hasMany(Review, { foreignKey: 'worker_id', as: 'receivedReviews' });

Review.belongsTo(User, { foreignKey: 'customer_id', as: 'customer' });
Review.belongsTo(User, { foreignKey: 'worker_id', as: 'worker' });

export { User, Worker, Booking, Review, OTP };

export default {
  User,
  Worker,
  Booking,
  Review,
  OTP,
};
