# 🏨 Hotel Management System

A comprehensive MERN stack hotel management system with role-based access control for Super Admin, Waiter, Chef, and Receptionist.

## Features

### Super Admin
- User management (add/edit/delete staff)
- Menu management (add/update/delete items)
- View all orders and bills
- Generate reports

### Waiter
- View 15 dining tables
- Select tables and place orders
- View menu items and add to orders

### Chef
- View pending orders from kitchen
- Update order status (In Progress → Ready → Served)
- Real-time order management

### Receptionist
- View all tables
- Generate bills for completed orders
- Print/download PDF receipts
- Handle payments

## Tech Stack

- **Frontend**: React.js with React Router
- **Backend**: Node.js with Express.js
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **Styling**: Inline CSS (minimal design)

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running on localhost:27017)
- MongoDB Compass (optional, for database viewing)

### Installation

1. **Clone and navigate to the project**
   ```bash
   cd Hotel
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on `mongodb://localhost:27017`

5. **Initialize Database**
   ```bash
   cd ../backend
   node setup.js
   ```

6. **Start Backend Server**
   ```bash
   npm run dev
   ```

7. **Start Frontend (in new terminal)**
   ```bash
   cd ../frontend
   npm start
   ```

8. **Access the Application**
   Open http://localhost:3000 in your browser

## Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Super Admin | admin | admin123 |
| Waiter | waiter1 | waiter123 |
| Chef | chef1 | chef123 |
| Receptionist | receptionist1 | reception123 |

## Database Schema

### Collections
- **users**: Staff authentication and roles
- **menuitems**: Restaurant menu with prices
- **tables**: 15 dining tables with status
- **orders**: Customer orders with items
- **bills**: Generated bills with tax calculations

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Users (Super Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `DELETE /api/users/:id` - Delete user

### Menu
- `GET /api/menu` - Get menu items
- `POST /api/menu` - Create menu item (Admin only)
- `PUT /api/menu/:id` - Update menu item (Admin only)
- `DELETE /api/menu/:id` - Delete menu item (Admin only)

### Tables
- `GET /api/tables` - Get all tables
- `GET /api/tables/:tableNumber` - Get specific table
- `POST /api/tables/initialize` - Initialize 15 tables

### Orders
- `POST /api/orders` - Create order (Waiter only)
- `GET /api/orders/kitchen` - Get kitchen orders (Chef only)
- `PUT /api/orders/:id/status` - Update order status (Chef only)
- `GET /api/orders` - Get all orders (Admin only)

### Bills
- `POST /api/bills` - Generate bill (Receptionist only)
- `GET /api/bills/:id` - Get bill details
- `GET /api/bills` - Get all bills (Admin only)

## Workflow

1. **Waiter** selects a vacant table and places order
2. **Chef** receives order in kitchen dashboard
3. **Chef** updates order status to "Ready" when complete
4. **Receptionist** generates bill for served tables
5. **Receptionist** prints receipt for customer

## Project Structure

```
Hotel/
├── backend/
│   ├── models/          # Database schemas
│   ├── routes/          # API endpoints
│   ├── middleware/      # Authentication middleware
│   ├── server.js        # Express server
│   ├── setup.js         # Database initialization
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── context/     # Authentication context
│   │   ├── services/    # API calls
│   │   └── App.js       # Main app component
│   └── package.json
└── README.md
```

## Notes

- Tables are automatically initialized (1-15)
- Tax rate is set to 10% (configurable)
- Real-time updates require manual refresh
- All prices are in USD
- Responsive design for different screen sizes