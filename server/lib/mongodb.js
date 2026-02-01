import mongoose from 'mongoose';
import logger from '../utils/logger.js';

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;  // Use the MongoDB URI from .env file

    if (!uri) {
      throw new Error('MongoDB URI is not defined in .env');
    }

    logger.info('Attempting to connect to MongoDB', { uri: uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@') });

    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info('✅ MongoDB connected successfully');

    // Add connection event listeners
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error', { error: err.message, stack: err.stack });
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });

  } catch (error) {
    logger.error('❌ MongoDB connection failed', {
      error: error.message,
      stack: error.stack
    });
    process.exit(1);
  }
};

export default connectDB;
