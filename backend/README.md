# Backend Setup

## Installation
```bash
npm install
```

## Environment Setup
Create `.env` file with:
```
MONGODB_URI=mongodb://localhost:27017/hotel_management
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

## Initialize Database
```bash
node setup.js
```

## Start Server
```bash
npm run dev
```

Server will run on http://localhost:5000