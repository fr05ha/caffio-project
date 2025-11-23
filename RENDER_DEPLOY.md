# Инструкция по развёртыванию на Render (бесплатный тариф)

## Ограничения бесплатного тарифа
- ❌ Нет pre-deploy команд
- ❌ Нет SSH доступа
- ⚠️ Автоматическое засыпание после 15 минут бездействия (cold start ~30-40 сек)
- ✅ Подходит для демо и разработки
- ✅ Не потребляет ресурсы в спящем состоянии (не нужно приостанавливать вручную)

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

⚠️ **Важно**: На бесплатном тарифе Render **Shell недоступен**, поэтому сидирование нужно делать локально.

#### Способ 1: Сидирование через локальное подключение (рекомендуется)

1. После успешного деплоя открой PostgreSQL сервис в Render → вкладка **Info**
2. Скопируй **External Database URL** (начинается с `postgresql://...`)
3. Локально создай временный `.env` файл в `apps/backend/`:
   ```bash
   cd apps/backend
   echo "DATABASE_URL=<вставь External Database URL из Render>" > .env.render
   ```
4. Запусти сидирование локально, используя Render базу:
   
   **Вариант A: Один скрипт (рекомендуется)**
   ```bash
   cd apps/backend
   DATABASE_URL="<External Database URL>" npx ts-node scripts/seed-all.ts
   ```
   
   **Вариант B: Отдельные скрипты**
   ```bash
   cd apps/backend
   export DATABASE_URL="<External Database URL>"
   npx ts-node scripts/seed-admin-accounts.ts
   npx ts-node scripts/add-oh-matcha.ts
   npx ts-node scripts/set-cafe-themes.ts
   ```

5. После сидирования удали временный `.env.render` файл (если создавал)

#### Способ 2: Обновить seed.ts для автоматического сидирования

Можно расширить `prisma/seed.ts`, чтобы он включал все необходимые данные (админы, кафе, темы). Тогда после деплоя можно будет запустить `npm run seed` локально с `DATABASE_URL` от Render (как в способе 1).

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

### Нужно ли приостанавливать сервисы вручную?

**Короткий ответ: Нет, не обязательно.**

**Почему:**
- На бесплатном тарифе сервисы **автоматически засыпают** после 15 минут бездействия
- В спящем состоянии они **не потребляют ресурсы** (не тратят бесплатные часы)
- Приостановка вручную не даёт дополнительных преимуществ

**Когда приостанавливать вручную:**
- Если хочешь явно контролировать, когда сервис доступен
- Если не планируешь использовать сервис долгое время (недели/месяцы)
- Если хочешь избежать случайных пробуждений от мониторинга/ботов

**Как приостановить/возобновить:**
1. Открой сервис в Render Dashboard
2. Нажми **Settings** → **Suspend Service** (или **Resume Service**)
3. Приостановленный сервис не будет отвечать на запросы до возобновления

**Важно для PostgreSQL:**
- PostgreSQL на бесплатном тарифе **не засыпает автоматически**
- Если не используешь долго, можно приостановить вручную
- При возобновлении данные сохраняются (данные не удаляются)

## Следующие шаги

После успешного деплоя backend:
1. Деплой фронтенда (Vercel, Netlify, или Render Static Site)
2. Обновить `API_BASE_URL` в мобильном приложении на URL Render backend
3. Обновить CORS настройки в backend

