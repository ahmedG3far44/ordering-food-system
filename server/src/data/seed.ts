import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User, Restaurant, MenuItem, Order, OrderItem, OrderStatus, IUser, IRestaurant, IMenuItem } from '../models';
import { connectDB } from '../utils/mongodb';

dotenv.config();

async function seed() {
  try {
    await connectDB();

    await User.deleteMany({});
    await Restaurant.deleteMany({});
    await MenuItem.deleteMany({});
    await Order.deleteMany({});
    await OrderItem.deleteMany({});

    console.log('Cleared existing data');

    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await User.insertMany([
      { email: 'john@example.com', password: hashedPassword, name: 'John Doe', role: 'CUSTOMER' },
      { email: 'jane@example.com', password: hashedPassword, name: 'Jane Smith', role: 'CUSTOMER' },
      { email: 'pizzaowner@example.com', password: hashedPassword, name: 'Mario Rossi', role: 'RESTAURANT_OWNER' },
      { email: 'burgerowner@example.com', password: hashedPassword, name: 'Bob Johnson', role: 'RESTAURANT_OWNER' },
      { email: 'sushiowner@example.com', password: hashedPassword, name: 'Yuki Tanaka', role: 'RESTAURANT_OWNER' },
    ]);
    console.log('Created users:', users.length);

    const pizzaOwner = users.find((u: IUser) => u.email === 'pizzaowner@example.com');
    const burgerOwner = users.find((u: IUser) => u.email === 'burgerowner@example.com');
    const sushiOwner = users.find((u: IUser) => u.email === 'sushiowner@example.com');
    const john = users.find((u: IUser) => u.email === 'john@example.com');
    const jane = users.find((u: IUser) => u.email === 'jane@example.com');

    const restaurants = await Restaurant.insertMany([
      { name: 'Pizza Palace', address: '123 Main Street, New York, NY 10001', ownerId: pizzaOwner!._id },
      { name: 'Burger Barn', address: '456 Oak Avenue, Los Angeles, CA 90001', ownerId: burgerOwner!._id },
      { name: 'Sushi Supreme', address: '789 Elm Drive, San Francisco, CA 94102', ownerId: sushiOwner!._id },
    ]);
    console.log('Created restaurants:', restaurants.length);

    const pizzaRest = restaurants.find((r: IRestaurant) => r.name === 'Pizza Palace');
    const burgerRest = restaurants.find((r: IRestaurant) => r.name === 'Burger Barn');
    const sushiRest = restaurants.find((r: IRestaurant) => r.name === 'Sushi Supreme');

    const menuItems = await MenuItem.insertMany([
      { name: 'Margherita Pizza', description: 'Classic tomato sauce, mozzarella, fresh basil', price: mongoose.Types.Decimal128.fromString('12.99'), restaurantId: pizzaRest!._id },
      { name: 'Pepperoni Pizza', description: 'Tomato sauce, mozzarella, pepperoni', price: mongoose.Types.Decimal128.fromString('14.99'), restaurantId: pizzaRest!._id },
      { name: 'Cheeseburger', description: 'Beef patty, cheddar cheese, lettuce, tomato, onion', price: mongoose.Types.Decimal128.fromString('9.99'), restaurantId: burgerRest!._id },
      { name: 'Bacon Burger', description: 'Beef patty, bacon, cheddar, pickles, special sauce', price: mongoose.Types.Decimal128.fromString('11.99'), restaurantId: burgerRest!._id },
      { name: 'Veggie Burger', description: 'Plant-based patty, avocado, lettuce, tomato', price: mongoose.Types.Decimal128.fromString('10.99'), restaurantId: burgerRest!._id },
      { name: 'Salmon Roll', description: 'Fresh salmon, cucumber, avocado, rice, nori', price: mongoose.Types.Decimal128.fromString('15.99'), restaurantId: sushiRest!._id },
      { name: 'Dragon Roll', description: 'Shrimp tempura, eel, avocado, spicy mayo', price: mongoose.Types.Decimal128.fromString('18.99'), restaurantId: sushiRest!._id },
      { name: 'California Roll', description: 'Crab, avocado, cucumber, sesame seeds', price: mongoose.Types.Decimal128.fromString('12.99'), restaurantId: sushiRest!._id },
    ]);
    console.log('Created menuItems:', menuItems.length);

    const margherita = menuItems.find((m: IMenuItem) => m.name === 'Margherita Pizza');
    const pepperoni = menuItems.find((m: IMenuItem) => m.name === 'Pepperoni Pizza');
    const cheeseburger = menuItems.find((m: IMenuItem) => m.name === 'Cheeseburger');
    const salmonRoll = menuItems.find((m: IMenuItem) => m.name === 'Salmon Roll');
    const dragonRoll = menuItems.find((m: IMenuItem) => m.name === 'Dragon Roll');

    const orders = await Order.insertMany([
      { customerId: john!._id, restaurantId: pizzaRest!._id, status: 'PENDING' as OrderStatus, totalAmount: mongoose.Types.Decimal128.fromString('27.98') },
      { customerId: jane!._id, restaurantId: burgerRest!._id, status: 'PREPARING' as OrderStatus, totalAmount: mongoose.Types.Decimal128.fromString('45.97') },
      { customerId: john!._id, restaurantId: sushiRest!._id, status: 'DELIVERED' as OrderStatus, totalAmount: mongoose.Types.Decimal128.fromString('15.99') },
    ]);
    console.log('Created orders:', orders.length);

    const order1 = orders[0];
    const order2 = orders[1];
    const order3 = orders[2];

    await OrderItem.insertMany([
      { orderId: order1._id, menuItemId: margherita!._id, quantity: 2, priceAtPurchase: margherita!.price },
      { orderId: order1._id, menuItemId: pepperoni!._id, quantity: 1, priceAtPurchase: pepperoni!.price },
      { orderId: order2._id, menuItemId: cheeseburger!._id, quantity: 3, priceAtPurchase: cheeseburger!.price },
      { orderId: order3._id, menuItemId: salmonRoll!._id, quantity: 1, priceAtPurchase: salmonRoll!.price },
    ]);
    console.log('Created orderItems');

    console.log('\n--- Seed completed successfully ---');
    console.log('Test credentials: password123 for all users');

  } catch (error) {
    console.error('Seed error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seed();