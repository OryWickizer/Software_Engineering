# Troubleshooting Guide

This guide covers common issues you might encounter while setting up and running EcoBites, along with step-by-step solutions.

---

## Table of Contents

1. [MongoDB Setup Issues](#mongodb-setup-issues)
2. [Environment Variables](#environment-variables)
3. [Database Seeding](#database-seeding)
4. [Port Conflicts](#port-conflicts)
5. [Authentication Issues](#authentication-issues)
6. [Test Failures](#test-failures)
7. [Package Installation Issues](#package-installation-issues)
8. [Build and Development Server Issues](#build-and-development-server-issues)

---

## MongoDB Setup Issues

### Issue: Cannot connect to MongoDB

**Error Message:**
```
MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017
```

**Solution:**

#### Option 1: Local MongoDB Setup

1. **Install MongoDB Community Edition**
   - **macOS:** 
     ```bash
     brew tap mongodb/brew
     brew install mongodb-community
     ```
   - **Windows:** Download installer from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - **Linux (Ubuntu):**
     ```bash
     sudo apt-get install -y mongodb-org
     ```

2. **Start MongoDB Service**
   - **macOS:**
     ```bash
     brew services start mongodb-community
     ```
   - **Windows:** MongoDB should start automatically, or use:
     ```cmd
     net start MongoDB
     ```
   - **Linux:**
     ```bash
     sudo systemctl start mongod
     sudo systemctl enable mongod
     ```

3. **Verify MongoDB is Running**
   ```bash
   mongosh
   # You should see MongoDB shell prompt
   ```

#### Option 2: MongoDB Atlas (Cloud Database)

1. **Create Free MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Create a new cluster (M0 Sandbox - FREE)

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like):
     ```
     mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
     ```

3. **Whitelist Your IP Address**
   - In Atlas, go to "Network Access"
   - Add your current IP address
   - Or add `0.0.0.0/0` (allow from anywhere - for development only)

4. **Create Database User**
   - In Atlas, go to "Database Access"
   - Add new database user with password
   - Grant "Read and write to any database" permission

5. **Update Your `.env` File**
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecobites?retryWrites=true&w=majority
   ```
   Replace `<username>` and `<password>` with your database user credentials.

---

## Environment Variables

### Issue: Missing or Invalid Environment Variables

**Error Message:**
```
Error: JWT_SECRET is not defined
```
or
```
TypeError: Cannot read property 'MONGODB_URI' of undefined
```

**Solution:**

1. **Create `.env` File in Server Directory**
   ```bash
   cd Ecobites/server
   touch .env
   ```

2. **Add Required Variables**
   
   Open `.env` and add:
   ```bash
   # Database
   MONGODB_URI=mongodb://localhost:27017/ecobites
   # Or for MongoDB Atlas:
   # MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecobites?retryWrites=true&w=majority

   # Server
   PORT=3000
   NODE_ENV=development

   # Authentication
   JWT_SECRET=your-super-secure-random-jwt-secret-minimum-32-characters-long
   ```

3. **Generate Secure JWT Secret**
   
   Run this command to generate a random secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
   Copy the output and use it as your `JWT_SECRET`.

4. **Verify Environment Variables Load**
   
   Test that your server can read the variables:
   ```bash
   cd Ecobites/server
   node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"
   ```

**Important:** Never commit your `.env` file to version control. It should be in `.gitignore`.

---

## Database Seeding

### Issue: Database is Empty / No Test Data

**Problem:** After setting up MongoDB, you need sample data to test the application.

**Solution: Seed the Database**

1. **Ensure MongoDB is Running**
   ```bash
   # Check if MongoDB is accessible
   mongosh
   # Type 'exit' to leave mongo shell
   ```

2. **Navigate to Server Directory**
   ```bash
   cd Ecobites/server
   ```

3. **Run the Seed Script**
   ```bash
   npm run seed
   ```
   
   Or directly:
   ```bash
   node src/seed.js
   ```

4. **Expected Output**
   ```
   🌱 Database seeded successfully!
   ✅ Created 5 users
   ✅ Created 3 restaurants
   ✅ Created 15 menu items
   ✅ Created 8 sample orders
   ```

5. **Verify Data Was Created**
   ```bash
   mongosh ecobites
   # In mongo shell:
   db.users.countDocuments()
   db.menuitems.countDocuments()
   db.orders.countDocuments()
   ```

6. **Re-seed Database (Clear and Recreate)**
   
   If you need to reset the database:
   ```bash
   # In mongosh:
   use ecobites
   db.dropDatabase()
   exit
   
   # Then run seed again:
   npm run seed
   ```

### Default Seeded Users

After seeding, you can log in with these test accounts:

| Role       | Email               | Password  |
|------------|---------------------|-----------|
| Customer   | alice@example.com   | password  |
| Customer   | bob@example.com     | password  |
| Restaurant | rest1@example.com   | password  |
| Restaurant | rest2@example.com   | password  |
| Driver     | driver@example.com  | password  |

---

## Port Conflicts

### Issue: Port Already in Use

**Error Message:**
```
Error: listen EADDRINUSE: address already in use :::3000
```
or
```
Port 5173 is already in use
```

**Solution:**

#### Option 1: Kill the Process Using the Port

**macOS/Linux:**
```bash
# Find process using port 3000
lsof -ti:3000
# Kill the process
kill -9 $(lsof -ti:3000)

# For frontend (port 5173)
lsof -ti:5173
kill -9 $(lsof -ti:5173)
```

**Windows (Command Prompt):**
```cmd
# Find process using port 3000
netstat -ano | findstr :3000
# Kill process (replace PID with actual process ID)
taskkill /PID <PID> /F

# For frontend (port 5173)
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

#### Option 2: Change the Port

**Backend:**
Edit `Ecobites/server/.env`:
```
PORT=3001
```

**Frontend:**
Edit `Ecobites/client/vite.config.js`:
```javascript
export default defineConfig({
  server: {
    port: 5174, // Change from 5173
  }
})
```

---

## Authentication Issues

### Issue: Login Fails / Token Errors

**Error Message:**
```
401 Unauthorized
```
or
```
jwt malformed
```

**Solutions:**

#### 1. Check JWT_SECRET

Ensure `JWT_SECRET` is set in your server `.env` file and is at least 32 characters long.

#### 2. Clear Browser Cookies

The app uses httpOnly cookies for authentication. Clear your browser cookies:
- **Chrome/Edge:** Settings → Privacy → Clear browsing data → Cookies
- **Firefox:** Settings → Privacy → Clear Data → Cookies
- Or use incognito/private mode

#### 3. Check Server is Running

Ensure the backend server is running on the correct port:
```bash
cd Ecobites/server
npm start
```

#### 4. CORS Issues

If you see CORS errors in the browser console, check:
- Frontend is making requests to `http://localhost:3000` (or your server port)
- Check `Ecobites/client/src/api/axios.config.js` has correct baseURL

#### 5. Re-seed Database

User passwords may be corrupted. Re-run the seed script:
```bash
cd Ecobites/server
npm run seed
```

---

## Test Failures

### Issue: Tests Failing Locally

**Common Causes & Solutions:**

#### 1. MongoDB Not Running

Ensure MongoDB is running before running tests:
```bash
# macOS
brew services start mongodb-community

# Windows
net start MongoDB

# Linux
sudo systemctl start mongod
```

#### 2. Test Database Conflicts

Tests create a separate test database. If tests fail intermittently:
```bash
# Clear test database
mongosh ecobites_test
db.dropDatabase()
exit
```

#### 3. Port Conflicts During Tests

Tests may fail if server port is in use:
```bash
# Kill any running servers
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### 4. Missing Dependencies

Ensure all dependencies are installed:
```bash
# Backend
cd Ecobites/server
npm install

# Frontend
cd Ecobites/client
npm install
```

#### 5. Run Tests with Coverage

**Backend (Jest):**
```bash
cd Ecobites/server
npm test -- --coverage
```

**Frontend (Vitest):**
```bash
cd Ecobites/client
npm test -- --coverage
```

#### 6. Run Specific Test File

**Backend:**
```bash
cd Ecobites/server
npm test -- tests/integration/auth.test.mjs
```

**Frontend:**
```bash
cd Ecobites/client
npm test -- src/tests/Login.test.jsx
```

---

## Package Installation Issues

### Issue: npm install Fails

**Error Message:**
```
npm ERR! code EACCES
```
or
```
npm ERR! network timeout
```

**Solutions:**

#### 1. Permission Issues (macOS/Linux)

Don't use `sudo` with npm. If you have permission issues:
```bash
# Fix npm permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc
```

#### 2. Clear npm Cache

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 3. Use npm ci for Clean Install

```bash
npm ci
```

#### 4. Network/Timeout Issues

If behind a corporate firewall or proxy:
```bash
npm config set registry https://registry.npmjs.org/
npm config set strict-ssl false  # Only if necessary
```

#### 5. Node Version Mismatch

Ensure you're using Node.js 18 or higher:
```bash
node --version
# Should show v18.x.x or higher

# Use nvm to switch versions
nvm install 18
nvm use 18
```

---

## Build and Development Server Issues

### Issue: Frontend Build Fails

**Error Message:**
```
Vite build failed
```

**Solution:**

1. **Clear Build Cache**
   ```bash
   cd Ecobites/client
   rm -rf dist node_modules .vite
   npm install
   npm run build
   ```

2. **Check for Syntax Errors**
   
   Run linter to find issues:
   ```bash
   npm run lint
   ```

3. **Memory Issues**
   
   Increase Node.js memory limit:
   ```bash
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run build
   ```

### Issue: Hot Module Reload Not Working

**Solution:**

1. **Restart Dev Server**
   ```bash
   # Kill server (Ctrl+C)
   npm run dev
   ```

2. **Clear Vite Cache**
   ```bash
   rm -rf node_modules/.vite
   npm run dev
   ```

---

## Quick Checklist

Before asking for help, verify:

- [ ] MongoDB is running (`mongosh` connects successfully)
- [ ] `.env` file exists in `Ecobites/server/` with all required variables
- [ ] Database is seeded (`npm run seed` completed successfully)
- [ ] All dependencies installed (`npm install` in both client and server)
- [ ] Correct Node.js version (18+): `node --version`
- [ ] No port conflicts (ports 3000 and 5173 are free)
- [ ] Browser cookies cleared (for auth issues)
- [ ] Both client and server are running in separate terminals

---

## Still Having Issues?

If none of the above solutions work:

1. **Check the logs** in both terminal windows running the client and server
2. **Open browser console** (F12) and check for JavaScript errors
3. **Check MongoDB logs** for database connection issues
4. **Create an issue** on GitHub with:
   - Error message (full stack trace)
   - Steps to reproduce
   - Your environment (OS, Node version, MongoDB version)
   - Output of `npm list` in both client and server directories

---

## Useful Commands Reference

```bash
# Start MongoDB
brew services start mongodb-community  # macOS
net start MongoDB                      # Windows
sudo systemctl start mongod            # Linux

# Check MongoDB status
mongosh

# Seed database
cd Ecobites/server && npm run seed

# Run tests
cd Ecobites/server && npm test        # Backend
cd Ecobites/client && npm test        # Frontend

# Start servers
cd Ecobites/server && npm start       # Backend
cd Ecobites/client && npm run dev     # Frontend

# Check for port usage
lsof -ti:3000                         # macOS/Linux
netstat -ano | findstr :3000          # Windows

# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```
