# Installation Guide

This guide will help you set up the EcoBites monorepo on your local machine.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18 or higher (LTS recommended)
- **npm**: Comes with Node.js, version 8 or higher
- **MongoDB**: Local installation or cloud instance (e.g., MongoDB Atlas)
- **Git**: For cloning the repository

### Windows Specific
- Use Command Prompt or PowerShell (not Git Bash for server tests)
- For server testing, you may need to install `cross-env` globally if using npm scripts

## Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd proj2
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies (if any)
   npm install

   # Install client dependencies
   cd Ecobites/client
   npm install
   cd ../..

   # Install server dependencies
   cd Ecobites/server
   npm install
   cd ../..
   ```

3. **Set up environment variables**

   Create `.env` file in `Ecobites/server/`:
   ```
   MONGODB_URI=mongodb://localhost:27017/ecobites
   PORT=3000
   JWT_SECRET=your-super-secure-jwt-secret-here
   ```

   For production, use a strong JWT secret and proper MongoDB URI.

4. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

5. **Run the applications**

   **Backend (Terminal 1):**
   ```bash
   cd Ecobites/server
   npm start
   ```
   Server will start on http://localhost:3000

   **Frontend (Terminal 2):**
   ```bash
   cd Ecobites/client
   npm run dev
   ```
   Client will start on http://localhost:5173

## Detailed Setup

### Backend Setup

The server uses Express.js with MongoDB and includes authentication, order management, and testing.

**Dependencies:**
- Express 5
- Mongoose 8
- JWT for authentication
- bcrypt for password hashing
- Jest + Supertest for testing

**Environment Variables:**
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default 3000)
- `JWT_SECRET`: Secret key for JWT tokens

**Running Tests:**
```bash
cd Ecobites/server
npm test
```

On Windows cmd.exe, you may need:
```bash
set "NODE_OPTIONS=--experimental-vm-modules" && npx jest --coverage
```

### Frontend Setup

The client is a React application built with Vite and styled with Tailwind CSS.

**Dependencies:**
- React 18
- Vite 7
- Tailwind CSS 4
- React Router DOM
- Vitest + React Testing Library

**Running Tests:**
```bash
cd Ecobites/client
npm test
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running locally or update `MONGODB_URI` for cloud instance
   - Check firewall settings if using cloud MongoDB

2. **Port Already in Use**
   - Change PORT in `.env` or kill process using the port
   - `netstat -ano | findstr :3000` (Windows) or `lsof -i :3000` (Unix)

3. **npm install fails**
   - Clear npm cache: `npm cache clean --force`
   - Delete node_modules and package-lock.json, then reinstall

4. **Test failures on Windows**
   - Install cross-env: `npm install -g cross-env`
   - Update package.json scripts to use cross-env

### Development Tips

- Use `npm run dev` in server for auto-restart on changes
- Frontend hot-reloads automatically with Vite
- Check console logs for detailed error messages
- Ensure all environment variables are set before starting

## Next Steps

After installation:
1. Visit http://localhost:5173 to access the frontend
2. API endpoints available at http://localhost:3000/api/
3. Register a new user account to test authentication
4. Explore the application features as described in the documentation

For more information, see the [README.md](README.md) file.
