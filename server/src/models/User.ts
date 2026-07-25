import mongoose, { Schema, Document } from 'mongoose';

export type Role = 'CUSTOMER' | 'RESTAURANT_OWNER';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  name: string;
  role: Role;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ['CUSTOMER', 'RESTAURANT_OWNER'], default: 'CUSTOMER' },
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>('User', UserSchema);