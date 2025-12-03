# Caffio - Coffee Shop Management Platform

<div align="center">


**A comprehensive coffee shop management platform with admin dashboard, mobile app, and full-stack backend**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)

</div>

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Caffio is a full-stack coffee shop management platform that enables cafe owners to manage their business operations while providing customers with a seamless mobile ordering experience. The platform consists of three main components:

- **Admin Dashboard**: Web-based management interface for cafe owners
- **Mobile App**: React Native app for customers to browse cafes, place orders, and track deliveries
- **Backend API**: RESTful API built with NestJS and PostgreSQL

## ✨ Features

### Admin Dashboard
- 📊 **Analytics Dashboard**: Real-time revenue, orders, and rating statistics
- 📝 **Menu Management**: Add, edit, and organize menu items with categories and customizations
- 📦 **Order Management**: Track and update order statuses (pending, preparing, ready, delivered)
- ⭐ **Review Management**: View and respond to customer reviews
- ⚙️ **Settings**: Configure cafe profile, business hours, contact information, and profile images
- 🎨 **Dynamic Theming**: Customizable cafe branding with unique color schemes

### Mobile App
- 🔍 **Cafe Discovery**: Browse nearby cafes with location-based recommendations
- 📱 **Menu Browsing**: View detailed menus with categories, images, and descriptions
- 🛒 **Shopping Cart**: Add items with customizations (size, milk type, sugar, ice)
- 💳 **Payment Integration**: Secure payments via Stripe (test mode)
- 📍 **Order Tracking**: Real-time order status updates with push notifications
- ⭐ **Reviews & Ratings**: Rate and review cafes
- ❤️ **Favorites**: Save favorite cafes and menu items
- 🚚 **Order Types**: Dine In, Take Away, and Delivery options

### Backend API
- 🔐 **Authentication**: JWT-based auth for admins and customers
- 🗄️ **Database**: PostgreSQL with Prisma ORM
- 📍 **Geocoding**: Automatic address-to-coordinates conversion
- 💰 **Payments**: Stripe integration for payment processing
- 📊 **Business Hours**: Automatic open/closed status calculation
- 🔔 **Notifications**: Push notification support for order updates

## 🛠 Tech Stack

### Backend
- **Framework**: NestJS 11.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 14+
- **ORM**: Prisma 6.x
- **Authentication**: JWT, bcrypt
- **Payment**: Stripe SDK
- **API Documentation**: Swagger/OpenAPI

### Frontend (Admin Dashboard)
- **Framework**: React 18.x
- **Build Tool**: Vite 6.x
- **UI Components**: Radix UI, Shadcn UI
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **State Management**: React Hooks

### Mobile App
- **Framework**: React Native 0.81.x
- **Platform**: Expo 54.x
- **Navigation**: React Navigation
- **Payment**: Stripe React Native SDK
- **Location**: Expo Location
- **Notifications**: Expo Notifications


## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ ([Download](https://nodejs.org/))
- **PostgreSQL** v14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **npm** or **yarn**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/fr05ha/caffio-project.git
   cd caffio-project
   ```

2. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb caffio
   # Or using psql:
   psql -U postgres -c "CREATE DATABASE caffio;"
   ```

3. **Backend Setup**
   ```bash
   cd apps/backend
   npm install
   
   # Create .env file
   echo 'DATABASE_URL="postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/caffio?schema=public"' > .env
   echo 'JWT_SECRET="your-secret-key-here"' >> .env
   echo 'PORT=3000' >> .env
   echo 'CORS_ORIGIN="http://localhost:5173"' >> .env
   
   # Run migrations
   npx prisma migrate deploy
   
   # Generate Prisma Client
   npx prisma generate
   
   # Seed database
   npx tsx scripts/seed-admin-accounts.ts
   npx tsx scripts/add-oh-matcha.ts
   npx tsx scripts/set-cafe-themes.ts
   
   # Start backend server
   npm run start:dev
   ```

4. **Frontend Setup** (Admin Dashboard)
   ```bash
   cd frontend
   npm install
   
   # Update API URL in src/services/api.ts if needed
   # Default: http://localhost:3000
   
   # Start development server
   npm run dev
   ```

5. **Mobile App Setup**
   ```bash
   cd Mobile_App
   npm install
   
   # Update API URL in services/api.ts if needed
   # Default: http://localhost:3000
   
   # Start Expo development server
   npm start
   # Or for iOS simulator:
   npm run ios
   # Or for Android:
   npm run android
   ```


## 🌐 Deployment

### Backend & Database (Render)

1. Create a PostgreSQL database on Render
2. Create a new Web Service
3. Connect your GitHub repository
4. Configure environment variables:
   - `DATABASE_URL` - Render PostgreSQL connection string
   - `JWT_SECRET` - Your JWT secret key
   - `PORT` - 3000 (or Render's assigned port)
   - `CORS_ORIGIN` - Your frontend URL
   - `STRIPE_SECRET_KEY` - Your Stripe secret key (optional)

5. Set Build Command:
   ```bash
   cd apps/backend && npm install && npx prisma generate && npm run build
   ```

6. Set Start Command:
   ```bash
   cd apps/backend && npx prisma migrate deploy && npm run start
   ```

### Frontend (Vercel)

1. Import your GitHub repository to Vercel
2. Set Root Directory to `frontend`
3. Configure environment variables:
   - `VITE_API_BASE_URL` - Your backend API URL

4. Deploy

### Mobile App

The mobile app can be built using Expo:

```bash
cd Mobile_App
npm install
expo build:ios    # For iOS
expo build:android # For Android
```

Or use EAS Build:
```bash
npm install -g eas-cli
eas build --platform ios
eas build --platform android
```


## 🙏 Acknowledgments

- [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [React](https://reactjs.org/) - UI library
- [Expo](https://expo.dev/) - React Native platform
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Stripe](https://stripe.com/) - Payment processing

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

<div align="center">

**Made with ❤️ for coffee lovers**

[Report Bug](https://github.com/fr05ha/caffio-project/issues) · 
[Request Feature](https://github.com/fr05ha/caffio-project/issues)

</div>
