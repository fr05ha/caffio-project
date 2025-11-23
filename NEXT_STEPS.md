# Следующие шаги после деплоя Backend + DB на Render

## ✅ Что уже сделано:
- [x] Backend развёрнут на Render
- [x] PostgreSQL база данных активна

## 📋 Чеклист следующих шагов:

### 1. Засидировать данные в базу данных

**Важно**: Нужен **External Database URL** из Render PostgreSQL.

```bash
cd apps/backend
DATABASE_URL="<твой External Database URL из Render>" npx ts-node scripts/seed-all.ts
```

Это создаст:
- ✅ Все кафе (Single O, Mecca Coffee, Reuben Hills, Oh Matcha)
- ✅ Меню для Oh Matcha
- ✅ Темы для кафе
- ✅ Admin аккаунты (admin1@caffio.com, admin2@caffio.com, admin3@caffio.com)

**Проверка**: Открой `https://твой-backend-url.onrender.com/cafes` — должны быть все кафе.

---

### 2. Обновить CORS в Backend для фронтенда

Нужно добавить URL фронтенда в CORS настройки.

**Шаг 1**: Узнай URL твоего backend на Render (например, `https://caffio-backend.onrender.com`)

**Шаг 2**: Обнови `apps/backend/src/main.ts`:

```typescript
cors: {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://твой-фронтенд-url.vercel.app', // добавь после деплоя фронтенда
    // или 'https://твой-фронтенд-url.netlify.app',
    // или 'https://твой-фронтенд-url.onrender.com',
  ],
  credentials: true,
}
```

**Шаг 3**: Закоммить и запушить изменения → Render автоматически перезапустит backend.

---

### 3. Деплой фронтенда (Web Dashboard)

#### Вариант A: Vercel (рекомендуется для React)

1. Зайди на [vercel.com](https://vercel.com) и залогинься через GitHub
2. Нажми **Add New Project**
3. Импортируй репозиторий `caffio-project`
4. Настройки:
   - **Root Directory**: `frontend` (или `frontend/Coffee Delivery App (1)`, если структура такая)
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

5. **Environment Variables**:
   - `VITE_API_BASE_URL` = `https://твой-backend-url.onrender.com`

6. Нажми **Deploy**

7. После деплоя скопируй URL фронтенда и добавь его в CORS backend (шаг 2)

#### Вариант B: Netlify

1. Зайди на [netlify.com](https://netlify.com)
2. **Add new site** → **Import an existing project** → GitHub
3. Настройки:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `build`
   - **Environment variables**: `VITE_API_BASE_URL=https://твой-backend-url.onrender.com`

#### Вариант C: Render Static Site

1. В Render Dashboard → **New** → **Static Site**
2. Подключи GitHub репозиторий
3. Настройки:
   - **Name**: `caffio-frontend`
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `build`
   - **Environment Variables**: `VITE_API_BASE_URL=https://твой-backend-url.onrender.com`

---

### 4. Обновить мобильное приложение

После деплоя backend обнови `Mobile_App/services/api.ts`:

```typescript
// Замени локальный IP на Render URL
const API_BASE_URL = 'https://твой-backend-url.onrender.com';
```

**Важно**: Для тестирования на физическом устройстве через Expo Go это должно работать, так как Render URL доступен из интернета.

---

### 5. Проверка работы

#### Backend:
- [ ] `https://твой-backend-url.onrender.com/docs` — Swagger документация открывается
- [ ] `https://твой-backend-url.onrender.com/cafes` — возвращает список кафе
- [ ] `https://твой-backend-url.onrender.com/auth/login` — логин работает

#### Frontend:
- [ ] Фронтенд открывается по своему URL
- [ ] Логин работает (admin1@caffio.com / Admin123!)
- [ ] Меню загружается из backend
- [ ] Данные сохраняются в базу

#### Mobile App:
- [ ] Приложение подключается к Render backend
- [ ] Список кафе загружается
- [ ] Логин/регистрация работают
- [ ] Избранное сохраняется

---

## 🐛 Troubleshooting

### Проблема: "CORS error" в браузере
**Решение**: Убедись, что URL фронтенда добавлен в CORS настройки backend и изменения запушены в Git.

### Проблема: "Network request failed" в мобильном приложении
**Решение**: 
- Проверь, что `API_BASE_URL` в `Mobile_App/services/api.ts` указывает на Render URL (не localhost)
- Убедись, что backend не "спит" (сделай запрос через браузер, чтобы разбудить)

### Проблема: Backend "засыпает" после 15 минут
**Решение**: Это нормально для бесплатного тарифа. Первый запрос после сна может занять 30-40 секунд. Для продакшена нужен платный тариф.

### Проблема: Данные не сохраняются
**Решение**: 
- Проверь, что используешь правильный `DATABASE_URL` (Internal для backend, External для локального сидирования)
- Проверь логи в Render → Events → Failed Deploy

---

## 📝 Быстрая команда для сидирования

```bash
# Замени <EXTERNAL_DB_URL> на твой External Database URL из Render
cd apps/backend
DATABASE_URL="<EXTERNAL_DB_URL>" npx ts-node scripts/seed-all.ts
```

После успешного выполнения увидишь:
```
🌱 Starting full database seeding...
📦 Step 1: Seeding cafes...
✅ Created cafe: Single O Surry Hills
✅ Created cafe: Mecca Coffee King St
✅ Created cafe: Reuben Hills
📦 Step 2: Adding Oh Matcha cafe...
✅ Oh Matcha cafe and menu created
📦 Step 3: Setting cafe themes...
✅ Cafe themes updated
📦 Step 4: Creating admin accounts...
✅ Created admin: admin1@caffio.com for Mecca Coffee King St
✅ Created admin: admin2@caffio.com for Reuben Hills
✅ Created admin: admin3@caffio.com for Oh Matcha
🎉 Database seeding completed successfully!
```

---

## 🎯 Приоритет действий:

1. **Сейчас**: Засидировать данные (шаг 1)
2. **Затем**: Деплой фронтенда (шаг 3)
3. **Потом**: Обновить CORS и мобильное приложение (шаги 2 и 4)

