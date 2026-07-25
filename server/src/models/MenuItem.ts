import mongoose, { Schema, Document } from 'mongoose';

export interface IMenuItem extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  imageUrl?: string;
  price: mongoose.Types.Decimal128;
  restaurantId: mongoose.Types.ObjectId;
}

const MenuItemSchema = new Schema<IMenuItem>(
  {
    name: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    price: { type: Schema.Types.Decimal128, required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  },
  { timestamps: true }
);

export const MenuItem = mongoose.model<IMenuItem>('MenuItem', MenuItemSchema);