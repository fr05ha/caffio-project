# Setup Instructions for Caffio Project

Follow these steps to set up the project on your computer.

## Quick Start (TL;DR)

```bash
# 1. Clone repository
git clone https://github.com/fr05ha/caffio-project.git
cd caffio-project

# 2. Create database
createdb caffio

# 3. Backend setup
cd apps/backend
npm install
echo 'DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/caffio?schema=public"' > .env
npx prisma migrate deploy
npx tsx scripts/seed-admin-accounts.ts
npx tsx scripts/add-oh-matcha.ts
npx tsx scripts/set-cafe-themes.ts
npm run start:dev

# 4. Frontend setup (in new terminal)
cd frontend
npm install
npm run build && npm run preview
```

**See detailed instructions below if you encounter any issues.**

## Prerequisites

Make sure you have the following installed:
- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v14 or higher) - [Download here](https://www.postgresql.org/download/)
- **Git** - [Download here](https://git-scm.com/)

## Step 1: Clone the Repository

```bash
git clone https://github.com/fr05ha/caffio-project.git
cd caffio-project
```

## Step 2: Set Up PostgreSQL Database

1. **Start PostgreSQL** (if not already running):
   ```bash
   # On macOS with Homebrew:
   brew services start postgresql
   
   # On Linux:
   sudo systemctl start postgresql
   
   # On Windows:
   # Start PostgreSQL service from Services
   ```

2. **Create the database**:
   ```bash
   # Connect to PostgreSQL
   psql postgres
   
   # Create database
   CREATE DATABASE caffio;
   
   # Exit psql
   \q
   ```

   Or create it from command line:
   ```bash
   createdb caffio
   ```

## Step 3: Set Up Backend

1. **Navigate to backend directory**:
   ```bash
   cd apps/backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   
   Create a `.env` file in the `apps/backend` directory:
   ```bash
   touch .env
   ```
   
   Or create it manually in your editor.

4. **Configure database connection in `.env`**:
   
   Add this line to your `.env` file:
   ```env
   DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/caffio?schema=public"
   ```
   
   **Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials.**
   
   **Examples:**
   
   - If your PostgreSQL username is `postgres` and password is `postgres`:
     ```env
     DATABASE_URL="postgresql://postgres:postgres@localhost:5432/caffio?schema=public"
     ```
   
   - If your PostgreSQL username is your system username (e.g., `john`) and no password:
     ```env
     DATABASE_URL="postgresql://john@localhost:5432/caffio?schema=public"
     ```
   
   - If you're using a different PostgreSQL user:
     ```env
     DATABASE_URL="postgresql://mikkey_frolkin@localhost:5432/caffio?schema=public"
     ```
   
   **Note:** Make sure `.env` is in `apps/backend/.env` (not in the root directory)

5. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```
   
   Or if you want to reset the database:
   ```bash
   npx prisma migrate reset
   ```

6. **Seed the database** (optional, but recommended):
   ```bash
   # Seed admin accounts
   npx tsx scripts/seed-admin-accounts.ts
   
   # Add Oh Matcha cafe and menu
   npx tsx scripts/add-oh-matcha.ts
   
   # Set cafe themes
   npx tsx scripts/set-cafe-themes.ts
   ```

7. **Start the backend server**:
   ```bash
   npm run start:dev
   ```
   
   The backend will run on `http://localhost:3000`

## Step 4: Set Up Frontend

1. **Open a new terminal** and navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Build the frontend** (optional, for preview):
   ```bash
   npm run build
   ```

4. **Start the frontend**:
   
   **Option A: Development mode**:
   ```bash
   npm run dev
   ```
   This will run on `http://localhost:3000` (or another port if 3000 is taken)
   
   **Option B: Preview mode** (serves the built version):
   ```bash
   npm run build
   npm run preview
   ```
   This will run on `http://127.0.0.1:5173`

## Step 5: Verify Everything is Working

1. **Check backend**:
   - Open `http://localhost:3000/cafes` in your browser
   - You should see a JSON array of cafes

2. **Check frontend**:
   - Open `http://localhost:3000` (dev mode) or `http://127.0.0.1:5173` (preview mode)
   - You should see the login page

3. **Test login**:
   - Use one of these test accounts:
     - Email: `admin1@caffio.com` / Password: `Admin123!`
     - Email: `admin2@caffio.com` / Password: `Admin456!`
     - Email: `admin3@caffio.com` / Password: `Admin789!`

## Troubleshooting

### Backend Issues

**Problem: Can't connect to database**
- Check PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Verify DATABASE_URL in `.env` is correct
- Check database exists: `psql -l | grep caffio`

**Problem: Prisma migration errors**
```bash
# Reset database and re-run migrations
npx prisma migrate reset
npx prisma migrate deploy
```

**Problem: Port 3000 already in use**
- Change port in `apps/backend/src/main.ts` or stop the service using port 3000

### Frontend Issues

**Problem: npm install fails**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Problem: CORS errors**
- Make sure backend is running on `http://localhost:3000`
- Check CORS configuration in `apps/backend/src/main.ts`

**Problem: Frontend can't connect to backend**
- Verify backend is running
- Check the API URL in `frontend/src/services/api.ts`
- Make sure CORS is configured correctly in backend

### Database Issues

**Problem: Database connection errors**
```bash
# Test PostgreSQL connection
psql -U YOUR_USERNAME -d caffio

# If connection fails, check:
# 1. PostgreSQL is running
# 2. User exists and has permissions
# 3. Database exists
```

## Project Structure

```
caffio-project/
├── apps/
│   └── backend/          # NestJS backend API
│       ├── prisma/        # Database schema and migrations
│       ├── scripts/       # Seed scripts
│       └── src/           # Backend source code
├── frontend/              # React frontend dashboard
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── services/     # API client
│   │   └── hooks/        # Custom React hooks
│   └── package.json
└── Mobile_App/            # Mobile app (separate project)
```

## Quick Start Commands

**In one terminal (Backend):**
```bash
cd apps/backend
npm install
# Create .env with DATABASE_URL
npx prisma migrate deploy
npx tsx scripts/seed-admin-accounts.ts
npx tsx scripts/add-oh-matcha.ts
npx tsx scripts/set-cafe-themes.ts
npm run start:dev
```

**In another terminal (Frontend):**
```bash
cd frontend
npm install
npm run build
npm run preview
```

## Admin Accounts

After running the seed scripts, you'll have 3 admin accounts:

1. **Mecca Coffee** (Brown theme)
   - Email: `admin1@caffio.com`
   - Password: `Admin123!`

2. **Reuben Hills** (Green theme)
   - Email: `admin2@caffio.com`
   - Password: `Admin456!`

3. **Oh Matcha** (Matcha theme)
   - Email: `admin3@caffio.com`
   - Password: `Admin789!`

## Need Help?

If you encounter any issues:
1. Check the error messages in the terminal
2. Verify all prerequisites are installed
3. Make sure PostgreSQL is running
4. Check that `.env` file exists and has correct DATABASE_URL
5. Ensure ports 3000 and 5173 are available

