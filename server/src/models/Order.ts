import mongoose, { Schema, Document, Model } from 'mongoose';
import { IOrderItem } from './OrderItem';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'DELIVERED' | 'CANCELLED';

export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  customerId: mongoose.Types.ObjectId;
  restaurantId: mongoose.Types.ObjectId;
  status: OrderStatus;
  totalAmount: mongoose.Types.Decimal128;
  createdAt: Date;
  items?: mongoose.Types.DocumentArray<IOrderItem>;
}

const OrderSchema = new Schema<IOrder>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    restaurantId: { type: Schema.Types.ObjectId, ref: 'Restaurant', required: true },
    status: { type: String, enum: ['PENDING', 'PREPARING', 'DELIVERED', 'CANCELLED'], default: 'PENDING' },
    totalAmount: { type: Schema.Types.Decimal128, required: true },
  },
  { 
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

OrderSchema.virtual('items', {
  ref: 'OrderItem',
  localField: '_id',
  foreignField: 'orderId',
  justOne: false
});

OrderSchema.virtual('restaurant', {
  ref: 'Restaurant',
  localField: 'restaurantId',
  foreignField: '_id',
  justOne: true
});

OrderSchema.virtual('customer', {
  ref: 'User',
  localField: 'customerId',
  foreignField: '_id',
  justOne: true
});

export const Order = mongoose.model<IOrder>('Order', OrderSchema);