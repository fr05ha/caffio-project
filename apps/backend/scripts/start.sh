#!/bin/bash
set -e

# Run Prisma migrations (for production)
echo "Running Prisma migrations..."
npx prisma migrate deploy

# Generate Prisma Client (in case it wasn't generated during build)
echo "Generating Prisma Client..."
npx prisma generate

# Start the application
echo "Starting NestJS application..."
node dist/main.js

