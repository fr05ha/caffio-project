# Инструкция по развёртыванию на Render (бесплатный тариф)

## Ограничения бесплатного тарифа
- ❌ Нет pre-deploy команд
- ❌ Нет SSH доступа
- ❌ Автоматическое засыпание после 15 минут бездействия
- ✅ Подходит для демо и разработки

## Настройка Backend + PostgreSQL на Render

### 1. Создание PostgreSQL базы данных

1. Зайди в [Render Dashboard](https://dashboard.render.com/)
2. Нажми **New** → **PostgreSQL**
3. Заполни:
   - **Name**: `caffio-db` (или любое имя)
   - **Database**: `caffio` (или оставь по умолчанию)
   - **User**: оставь по умолчанию
   - **Region**: выбери ближайший
   - **PostgreSQL Version**: `16` (или последняя)
   - **Plan**: **Free**
4. Нажми **Create Database**
5. **Важно**: Сохрани `Internal Database URL` и `External Database URL` из вкладки **Info**

### 2. Создание Web Service для Backend

1. Нажми **New** → **Web Service**
2. Подключи GitHub репозиторий
3. Выбери репозиторий `caffio-project`
4. Заполни настройки:

#### Basic Settings:
- **Name**: `caffio-backend`
- **Region**: тот же, что и для БД
- **Branch**: `main` (или твоя рабочая ветка)
- **Root Directory**: `apps/backend`
- **Runtime**: `Node`
- **Build Command**: 
  ```
  npm install && npm run build
  ```
- **Start Command**: 
  ```
  npx prisma migrate deploy && npm run start
  ```
  ⚠️ **Важно**: Миграции запускаются в start command, так как pre-deploy недоступен на бесплатном тарифе.
  
  **Примечание**: Если после деплоя видишь ошибку `Cannot find module '/opt/render/project/src/apps/backend/dist/main.js'`, проверь, что в `package.json` поле `main` указывает на `dist/src/main.js` (NestJS сохраняет структуру папок при компиляции).

#### Environment Variables:
Добавь следующие переменные окружения (вкладка **Environment**):

- `DATABASE_URL` = `Internal Database URL` из PostgreSQL сервиса (начинается с `postgresql://...`)
- `JWT_SECRET` = сгенерируй секрет командой: `openssl rand -base64 32`
- `PORT` = `3000` (или оставь пустым, Render сам назначит)

#### Advanced Settings (опционально):
- **Auto-Deploy**: `Yes` (автоматический деплой при push в GitHub)

5. Нажми **Create Web Service**

### 3. Первый деплой и сидирование данных

После первого успешного деплоя:

1. Открой вкладку **Shell** в Render (или используй **Logs** для просмотра)
2. Если нужно засидировать данные, создай временный скрипт или используй Render Shell:
   ```bash
   # В Render Shell (если доступен) или через один из способов ниже
   cd apps/backend
   npx ts-node scripts/seed-admin-accounts.ts
   npx ts-node scripts/add-oh-matcha.ts
   npx ts-node scripts/set-cafe-themes.ts
   ```

   ⚠️ **Проблема**: На бесплатном тарифе Shell может быть недоступен.

   **Альтернатива**: Добавь сидирование в `prisma/seed.ts` и запусти через:
   ```bash
   npm run seed
   ```
   Но это тоже требует доступа к Shell.

   **Лучшее решение**: Засидируй данные локально после первого деплоя, подключившись к Render PostgreSQL через `External Database URL`.

### 4. Проверка работы

1. После деплоя открой URL сервиса (например, `https://caffio-backend.onrender.com`)
2. Проверь Swagger документацию: `https://caffio-backend.onrender.com/docs`
3. Проверь health endpoint (если есть): `https://caffio-backend.onrender.com/health`

### 5. Обновление CORS для фронтенда

После деплоя обнови CORS в `apps/backend/src/main.ts`:

```typescript
cors: {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://your-frontend-url.onrender.com', // добавь URL фронтенда на Render
  ],
  credentials: true,
}
```

Или используй переменную окружения:
```typescript
cors: {
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true,
}
```

## Troubleshooting

### Проблема: "Can't reach database server"
- Проверь, что `DATABASE_URL` использует `Internal Database URL` (не External)
- Убедись, что оба сервиса (backend и PostgreSQL) в одном регионе

### Проблема: "Migration failed"
- Проверь логи в Render → Events → Failed Deploy
- Убедись, что все миграции закоммичены в Git
- Попробуй очистить build cache: **Manual Deploy** → **Clear build cache & deploy**

### Проблема: "JWT_SECRET is not defined"
- Добавь `JWT_SECRET` в Environment Variables
- Перезапусти сервис после добавления переменной

### Проблема: Медленный первый запрос после засыпания
- Это нормально для бесплатного тарифа (cold start ~30-40 секунд)
- Для продакшена нужен платный тариф

## Следующие шаги

После успешного деплоя backend:
1. Деплой фронтенда (Vercel, Netlify, или Render Static Site)
2. Обновить `API_BASE_URL` в мобильном приложении на URL Render backend
3. Обновить CORS настройки в backend

