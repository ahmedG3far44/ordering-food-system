import mongoose from 'mongoose';
import dotenv from 'dotenv';

mongoose.set('strictPopulate', false);

function getMongoUri(): string {
  return process.env.MONGO_URI || 'mongodb://localhost:27017/food';
}

function transformDecimal128(doc: any, ret: any) {
  for (const key of Object.keys(ret)) {
    if (ret[key] instanceof mongoose.Types.Decimal128) {
      ret[key] = parseFloat(ret[key].toString());
    } else if (ret[key] !== null && typeof ret[key] === 'object' && '$numberDecimal' in ret[key]) {
      ret[key] = parseFloat(ret[key].$numberDecimal);
    }
  }
  return ret;
}

mongoose.set('toJSON', { virtuals: true, transform: transformDecimal128 });
mongoose.set('toObject', { virtuals: true, transform: transformDecimal128 });

export async function connectDB() {
  try {
    dotenv.config();
    const uri = getMongoUri();
    await mongoose.connect(uri);
    console.log('MongoDB connected successfully');

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    throw error;
  }
}

export default mongoose;
