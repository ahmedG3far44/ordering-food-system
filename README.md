# Urban Bistro - Food Ordering System

A full-stack food ordering system built with the MERN stack (MongoDB, Express, React, Node.js). Enables restaurant owners to manage their restaurants, menus, and orders while allowing customers to browse restaurants and place orders.

---

## Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)

### Frontend
- **Framework:** React (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Icons:** Lucide React

---

## Features

### Customer Features
- Browse restaurants by location
- View restaurant menus with prices
- Add items to cart
- Place orders
- View order history with status tracking
- Multi-currency support (auto-detected by restaurant location)

### Restaurant Owner Features
- Create and manage multiple restaurants
- Add/edit/delete menu items with AI image generation
- View and manage orders
- Sales analytics with date filtering
- Order status updates (Pending → Preparing → Delivered)
- Custom currency per restaurant

### System Features
- Role-based authentication (Customer / Restaurant Owner)
- Real-time cart management
- Responsive design
- Toast notifications
- Image placeholders with fallback
- Smooth hover animations
- 404 Not Found page

---

## Supported Currencies

| Code | Symbol | Country |
|------|--------|--------|
| USD | $ | United States |
| EUR | € | European Union |
| GBP | £ | United Kingdom |
| EGP | E£ | Egypt |
| SAR | ر.س | Saudi Arabia |
| AED | د.إ | UAE |
| INR | ₹ | India |
| JPY | ¥ | Japan |
| CAD | CA$ | Canada |
| AUD | A$ | Australia |

---

## Project Structure

```
ordering_system/
├── server/                    # Backend API
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── models/       # Mongoose schemas
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   ├── middlewares/   # Auth, error handling
│   │   ├── utils/       # Utilities
│   │   └── data/        # Seed data
│   └── package.json
│
├── client/                  # Frontend React app
│   ├── src/
│   │   ├── api/        # Axios API calls
│   │   ├── components/ # Reusable components
│   │   ├── pages/     # Page components
│   │   ├── store/     # Zustand stores
│   │   ├── types/     # TypeScript types
│   │   └── utils/     # Utilities
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**
```bash
cd ordering_system
```

2. **Install server dependencies**
```bash
cd server
npm install
```

3. **Install client dependencies**
```bash
cd ../client
npm install
```

### Environment Variables

Create `.env` files:

**Server** (`server/.env`):
```env
PORT=3001
MONGODB_URI=mongodb://localhost:27017/urbinbistro
JWT_SECRET=your_jwt_secret_key
```

**Client** (`client/.env`):
```env
VITE_API_URL=http://localhost:3001/api
```

### Running the Application

1. **Start MongoDB** (if local)

2. **Start the backend**
```bash
cd server
npm run dev
```

3. **Start the frontend**
```bash
cd client
npm run dev
```

4. Open `http://localhost:5173` in your browser

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|---------|-----------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |

### Restaurants
| Method | Endpoint | Description |
|--------|---------|-----------|
| GET | `/api/restaurants` | Get all restaurants |
| GET | `/api/restaurants/:id` | Get restaurant by ID |
| GET | `/api/restaurants/:id/menu` | Get restaurant menu |
| GET | `/api/restaurants/my` | Get owner's restaurants (auth required) |
| POST | `/api/restaurants` | Create restaurant (owner) |
| PUT | `/api/restaurants/:id` | Update restaurant (owner) |
| DELETE | `/api/restaurants/:id` | Delete restaurant (owner) |

### Menu Items
| Method | Endpoint | Description |
|--------|---------|-----------|
| POST | `/api/restaurants/:id/menu` | Add menu item (owner) |
| PUT | `/api/restaurants/:id/menu/:itemId` | Update menu item (owner) |
| DELETE | `/api/restaurants/:id/menu/:itemId` | Delete menu item (owner) |

### Orders
| Method | Endpoint | Description |
|--------|---------|-----------|
| POST | `/api/orders` | Create order |
| GET | `/api/orders` | Get user's orders |
| GET | `/api/orders/:id` | Get order details |
| GET | `/api/orders/restaurant/:id` | Get restaurant orders (owner) |
| PATCH | `/api/orders/:id/status` | Update order status (owner) |

### Sales Analytics
| Method | Endpoint | Description |
|--------|---------|-----------|
| GET | `/api/restaurants/my/sales` | Get all sales (owner) |
| GET | `/api/restaurants/:id/sales` | Get sales by restaurant (owner) |

---

## Database Models

### User
```json
{
  "_id": "ObjectId",
  "email": "string",
  "password": "hashed_string",
  "name": "string",
  "role": "CUSTOMER" | "RESTAURANT_OWNER"
}
```

### Restaurant
```json
{
  "_id": "ObjectId",
  "name": "string",
  "address": "string",
  "ownerId": "ObjectId",
  "currency": "USD" | "EUR" | "GBP" | ...,
  "imageUrl": "string",
  "cuisine": "string",
  "description": "string",
  "createdAt": "Date"
}
```

### MenuItem
```json
{
  "_id": "ObjectId",
  "name": "string",
  "description": "string",
  "price": "Decimal128",
  "imageUrl": "string",
  "restaurantId": "ObjectId"
}
```

### Order
```json
{
  "_id": "ObjectId",
  "customerId": "ObjectId",
  "restaurantId": "ObjectId",
  "status": "PENDING" | "PREPARING" | "DELIVERED" | "CANCELLED",
  "totalAmount": "Decimal128",
  "items": ["OrderItem"],
  "createdAt": "Date"
}
```

---

## Frontend Pages

### Public Routes
- `/` - Landing page
- `/restaurants` - Browse all restaurants
- `/restaurant/:id` - Restaurant menu
- `/login` - User login
- `/register` - User registration
- `*` - 404 Not Found

### Customer Routes (Protected)
- `/checkout` - Cart checkout
- `/orders` - Order history

### Owner Routes (Protected)
- `/owner/dashboard` - Dashboard with orders and sales
- `/owner/restaurants` - Manage restaurants
- `/owner/menu` - Manage menu items
- `/owner/settings` - Theme settings

---

## Known Issues Fixed

1. **Sales Analytics showing 0** - Fixed field name mapping (`breakdown` → `items`)
2. **Menu Item Update/Delete** - Added click handlers and edit form
3. **Orders missing customer info** - Added customer population to queries
4. **Currency not syncing** - Added currency field to cart and all display pages
5. **Image placeholders** - Added fallback images for missing URLs
6. **Button hover effects** - Added CSS transitions for smooth animations

---

## License

MIT