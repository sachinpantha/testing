# Deployment Guide

## Backend Deployment (Render)

1. **Create Render Account** and connect your GitHub repository
2. **Create Web Service** with these settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment Variables:
     ```
     MONGODB_URI=mongodb+srv://sachinpantha69_db_user:yxDk1v2BUW2gFbeu@cluster0.gnlfvhg.mongodb.net/hotel_management?retryWrites=true&w=majority&appName=Cluster0
     JWT_SECRET=your_jwt_secret_key_here
     PORT=5000
     ```

3. **Deploy** and note your Render URL (e.g., `https://your-app-name.onrender.com`)

## Frontend Deployment (Vercel)

1. **Create Vercel Account** and connect your GitHub repository
2. **Set Environment Variable** in Vercel dashboard:
   ```
   REACT_APP_API_BASE_URL=https://your-render-backend-url.onrender.com/api
   ```

3. **Deploy** - Vercel will automatically build and deploy

## Environment Variables Setup

### For Vercel (Frontend):
- `REACT_APP_API_BASE_URL` = Your Render backend URL + `/api`

### For Render (Backend):
- `MONGODB_URI` = Your MongoDB Atlas connection string
- `JWT_SECRET` = Any secure random string
- `PORT` = 5000 (or leave empty for auto-assignment)

## Initialize Database

After backend deployment, run setup:
```bash
# Replace with your actual Render URL
curl -X POST https://your-render-backend-url.onrender.com/api/tables/initialize
```

Or access your backend URL directly to trigger the setup script.

## Testing

1. **Backend**: Visit `https://your-render-url.onrender.com/api/tables`
2. **Frontend**: Visit your Vercel URL and try logging in

## Login Credentials

- Super Admin: `admin` / `admin123`
- Waiter: `waiter1` / `waiter123`
- Chef: `chef1` / `chef123`
- Receptionist: `receptionist1` / `reception123`