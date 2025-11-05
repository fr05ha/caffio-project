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

## PostgreSQL Setup

If you don't have PostgreSQL installed, follow these instructions for your operating system:

### Windows Installation

1. **Download PostgreSQL:**
   - Go to [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
   - Download the installer for Windows
   - Choose the latest version (14 or higher)

2. **Run the Installer:**
   - Run the downloaded `.exe` file
   - Follow the installation wizard
   - **Important:** Remember the password you set for the `postgres` user
   - Default port is `5432` (keep this)
   - Choose the default locale or select your preference

3. **Verify Installation:**
   - Open **Command Prompt** or **PowerShell**
   - Navigate to PostgreSQL bin directory (usually `C:\Program Files\PostgreSQL\14\bin`)
   - Run: `psql --version`
   - Or use pgAdmin (included with installation)

4. **Start PostgreSQL Service:**
   - Press `Win + R`, type `services.msc`, press Enter
   - Find "postgresql-x64-14" (or similar)
   - Right-click and select "Start" (if not already running)

### Initial PostgreSQL Configuration

After installation, you need to set up a user and database:

**Windows:**

1. **Open Command Prompt** and navigate to PostgreSQL bin directory:
   ```cmd
   cd "C:\Program Files\PostgreSQL\14\bin"
   ```

2. **Access PostgreSQL:**
   ```cmd
   psql -U postgres
   ```
   Enter the password you set during installation

3. **Create the database:**
   ```sql
   CREATE DATABASE caffio;
   ```

4. **Exit psql:**
   ```sql
   \q
   ```

### Alternative: Create Database from Command Line

**Windows:**
```cmd
# From Command Prompt (in PostgreSQL bin directory)
cd "C:\Program Files\PostgreSQL\14\bin"
createdb -U postgres caffio
```

### Verify PostgreSQL is Working

Test your PostgreSQL connection:

**Windows Command Prompt:**
```cmd
# Navigate to PostgreSQL bin directory
cd "C:\Program Files\PostgreSQL\14\bin"

# Connect to PostgreSQL
psql -U postgres

# Enter your password when prompted

# List databases
\l

# Connect to caffio database
\c caffio

# Exit
\q
```

### Common Issues

**Problem: "psql: command not found"**
- **Windows:** Add PostgreSQL bin directory to system PATH:
  1. Press `Win + X` and select "System"
  2. Click "Advanced system settings"
  3. Click "Environment Variables"
  4. Under "System variables", find "Path" and click "Edit"
  5. Click "New" and add: `C:\Program Files\PostgreSQL\14\bin`
  6. Click "OK" on all dialogs
  7. Restart Command Prompt/PowerShell
- Or use the full path: `"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres`

**Problem: "connection refused" or "cannot connect"**
- **Windows:** Check if PostgreSQL service is running:
  1. Press `Win + R`, type `services.msc`, press Enter
  2. Find "postgresql-x64-14" (or similar)
  3. Check if status is "Running"
  4. If not running, right-click and select "Start"
- Make sure PostgreSQL is listening on port 5432

**Problem: "authentication failed"**
- **Windows:** Use the password you set during PostgreSQL installation
- Make sure you're using the correct username: `-U postgres`
- Try connecting with: `psql -U postgres -d postgres`
- If you forgot your password, you may need to reset it

**Problem: "database does not exist"**
- Create the database first:
  ```cmd
  cd "C:\Program Files\PostgreSQL\14\bin"
  createdb -U postgres caffio
  ```
- Or in psql:
  ```sql
  CREATE DATABASE caffio;
  ```

## Step 1: Clone the Repository

```bash
git clone https://github.com/fr05ha/caffio-project.git
cd caffio-project
```

## Step 2: Set Up PostgreSQL Database

1. **Start PostgreSQL Service** (if not already running):
   - Press `Win + R`, type `services.msc`, press Enter
   - Find "postgresql-x64-14" (or similar)
   - Right-click and select "Start" (if status is "Stopped")

2. **Create the database**:
   
   **Option A: Using psql (SQL prompt)**
   ```cmd
   # Navigate to PostgreSQL bin directory
   cd "C:\Program Files\PostgreSQL\14\bin"
   
   # Connect to PostgreSQL
   psql -U postgres
   
   # Enter your password when prompted
   
   # Create database
   CREATE DATABASE caffio;
   
   # Exit psql
   \q
   ```
   
   **Option B: Using createdb (Command line)**
   ```cmd
   # Navigate to PostgreSQL bin directory
   cd "C:\Program Files\PostgreSQL\14\bin"
   
   # Create database
   createdb -U postgres caffio
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
   
   **Windows Command Prompt:**
   ```cmd
   cd apps\backend
   type nul > .env
   ```
   
   **Windows PowerShell:**
   ```powershell
   cd apps\backend
   New-Item .env -ItemType File
   ```
   
   Or create it manually in your editor (Notepad, VS Code, etc.).

4. **Configure database connection in `.env`**:
   
   Add this line to your `.env` file:
   ```env
   DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/caffio?schema=public"
   ```
   
   **Replace `YOUR_USERNAME` and `YOUR_PASSWORD` with your PostgreSQL credentials.**
   
   **Example for Windows (default postgres user):**
   
   If your PostgreSQL username is `postgres` and your password is `your_password`:
     ```env
     DATABASE_URL="postgresql://postgres:your_password@localhost:5432/caffio?schema=public"
     ```
   
   **Important:** Replace `your_password` with the password you set during PostgreSQL installation.
   
   Example:
     ```env
     DATABASE_URL="postgresql://postgres:mypassword123@localhost:5432/caffio?schema=public"
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
```cmd
# Navigate to PostgreSQL bin directory
cd "C:\Program Files\PostgreSQL\14\bin"

# Test PostgreSQL connection
psql -U postgres -d caffio

# If connection fails, check:
# 1. PostgreSQL is running (check Services app)
# 2. User exists and has permissions (default: postgres)
# 3. Database exists (CREATE DATABASE caffio;)
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

