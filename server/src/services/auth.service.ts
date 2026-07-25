import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, Role } from '../models';

import { createError } from '../middlewares/errorHandler';

const JWT_SECRET = process.env.JWT_SECRET || 'default_secret';

export const registerUser = async (data: { email: string; password: string; name: string, role:Role}) => {
  const { email, password, name, role } = data;
    
  if (!email || !password || !name) {
    throw createError(400, "Missing required fields");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    email,
    password: hashedPassword,
    name,
    role,
  });

  return newUser;
};

export const loginUser = async (email: string, pass: string) => {
  const user = await User.findOne({ email });
  if (!user) throw createError(401, 'Invalid credentials');

  const isMatch = await bcrypt.compare(pass, user.password);
  if (!isMatch) throw createError(401, 'Invalid credentials');

  const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
  return { user: { id: user._id, email: user.email, role: user.role, name: user.name }, token };
};