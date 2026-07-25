import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem extends Document {
  _id: mongoose.Types.ObjectId;
  orderId: mongoose.Types.ObjectId;
  menuItemId: mongoose.Types.ObjectId;
  quantity: number;
  priceAtPurchase: mongoose.Types.Decimal128;
}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true },
    menuItemId: { type: Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    quantity: { type: Number, required: true },
    priceAtPurchase: { type: Schema.Types.Decimal128, required: true },
  },
  { timestamps: true }
);

export const OrderItem = mongoose.model<IOrderItem>('OrderItem', OrderItemSchema);