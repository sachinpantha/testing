const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./src/config/database');

const app = express();

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'https://testing-c1yi10mus-sachin-panthas-projects.vercel.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Database connection
connectDB();

// Routes

app.get('/', (req, res) => {
    res.json('API is running...');
});
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/users', require('./src/routes/users'));
app.use('/api/menu', require('./src/routes/menu'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/tables', require('./src/routes/tables'));
app.use('/api/bills', require('./src/routes/bills'));
app.use('/api/transactions', require('./src/routes/transactions'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));