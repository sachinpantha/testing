# MongoDB Setup Instructions

## Option 1: Install MongoDB Community Server (Recommended)

1. **Download MongoDB Community Server**
   - Go to https://www.mongodb.com/try/download/community
   - Select Windows, Version 7.0+, Package: msi
   - Download and run the installer

2. **Install with default settings**
   - Check "Install MongoDB as a Service"
   - Check "Install MongoDB Compass" (optional GUI)

3. **Verify Installation**
   ```cmd
   mongod --version
   ```

## Option 2: Use MongoDB Atlas (Cloud)

1. **Create free account at https://www.mongodb.com/atlas**

2. **Create a cluster and get connection string**

3. **Update .env file**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/hotel_management
   ```

## Option 3: Use Docker (If you have Docker installed)

```cmd
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

## Start MongoDB Service (Windows)

If MongoDB is installed but not running:

```cmd
net start MongoDB
```

Or manually start:
```cmd
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath "C:\data\db"
```

## Verify MongoDB is Running

Open Command Prompt and run:
```cmd
mongo --eval "db.adminCommand('ismaster')"
```

Or check if port 27017 is listening:
```cmd
netstat -an | findstr :27017
```