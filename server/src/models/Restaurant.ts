import mongoose, { Schema, Document } from 'mongoose';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'EGP' | 'SAR' | 'AED' | 'JPY' | 'CAD' | 'AUD' | 'INR';

export interface IRestaurant extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  address: string;
  ownerId: mongoose.Types.ObjectId;
  currency: Currency;
  imageUrl?: string;
  cuisine?: string;
  description?: string;
}

const RestaurantSchema = new Schema<IRestaurant>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    currency: { type: String, enum: ['USD', 'EUR', 'GBP', 'EGP', 'SAR', 'AED', 'JPY', 'CAD', 'AUD', 'INR'], default: 'USD' },
    imageUrl: { type: String },
    cuisine: { type: String },
    description: { type: String },
  },
  { timestamps: true }
);

export const Restaurant = mongoose.model<IRestaurant>('Restaurant', RestaurantSchema);