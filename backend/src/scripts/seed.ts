import { User, Worker } from '../models';
import logger from '../utils/logger';

const SAMPLE_WORKERS = [
  {
    full_name: 'Ahmed Khan',
    phone: '3001234561',
    role: 'worker',
    trade: 'electrician',
    experience_years: 10,
    city: 'Lahore',
    area: 'DHA',
    description: 'Specialist in home wiring and inverter installation.',
    min_charge: 500,
    hourly_rate: 500,
    visit_charge: 200,
    cnic: '35202-1234567-1',
  },
  {
    full_name: 'Saeed Anwar',
    phone: '3001234562',
    role: 'worker',
    trade: 'plumber',
    experience_years: 8,
    city: 'Karachi',
    area: 'Clifton',
    description: 'Expert in modern plumbing systems and leakage detection.',
    min_charge: 400,
    hourly_rate: 400,
    visit_charge: 200,
    cnic: '42101-2345678-2',
  },
  {
    full_name: 'Bilal Malik',
    phone: '3001234563',
    role: 'worker',
    trade: 'carpenter',
    experience_years: 5,
    city: 'Rawalpindi',
    area: 'Saddar',
    description: 'Custom furniture design and precision repair work.',
    min_charge: 600,
    hourly_rate: 600,
    visit_charge: 250,
    cnic: '37405-3456789-3',
  },
  {
    full_name: 'Zahid Ali',
    phone: '3001234564',
    role: 'worker',
    trade: 'painter',
    experience_years: 12,
    city: 'Islamabad',
    area: 'F-7',
    description: 'Professional wall painting and texture specialist.',
    min_charge: 350,
    hourly_rate: 350,
    visit_charge: 150,
    cnic: '61101-4567890-4',
  },
  {
    full_name: 'Aslam Pervez',
    phone: '3001234565',
    role: 'worker',
    trade: 'tailor',
    experience_years: 20,
    city: 'Faisalabad',
    area: 'Ghulam Muhammad Abad',
    description: 'Master tailor for traditional and modern wear.',
    min_charge: 800,
    hourly_rate: 800,
    visit_charge: 300,
    cnic: '33100-5678901-5',
  },
];

const seedDatabase = async () => {
  try {
    logger.info('Starting database seeding...');

    // Create admin user
    const adminExists = await User.findOne({ where: { phone: '3000000000' } });

    if (!adminExists) {
      await User.create({
        full_name: 'Admin User',
        phone: '3000000000',
        email: 'admin@ustaad.com',
        password: 'admin123',
        role: 'admin',
        is_verified: true,
      });
      logger.info('✅ Admin user created');
    }

    // Create sample workers
    for (const workerData of SAMPLE_WORKERS) {
      const userExists = await User.findOne({ where: { phone: workerData.phone } });

      if (!userExists) {
        const user = await User.create({
          full_name: workerData.full_name,
          phone: workerData.phone,
          role: workerData.role as any,
          is_verified: true,
        });

        await Worker.create({
          user_id: user.id,
          trade: workerData.trade,
          experience_years: workerData.experience_years,
          city: workerData.city,
          area: workerData.area,
          description: workerData.description,
          min_charge: workerData.min_charge,
          hourly_rate: workerData.hourly_rate,
          visit_charge: workerData.visit_charge,
          cnic: workerData.cnic,
          rating: 4.5 + Math.random() * 0.5,
          total_ratings: Math.floor(Math.random() * 100) + 20,
          completed_jobs: Math.floor(Math.random() * 500) + 50,
        });

        logger.info(`✅ Created worker: ${workerData.full_name}`);
      }
    }

    logger.info('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
