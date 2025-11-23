# Деплой фронтенда (Web Dashboard)

## Вариант 1: Vercel (рекомендуется для Vite/React)

### Шаг 1: Подготовка

1. Убедись, что знаешь URL твоего backend на Render (например, `https://caffio-backend.onrender.com`)
2. Убедись, что все изменения закоммичены и запушены в GitHub

### Шаг 2: Деплой на Vercel

1. Зайди на [vercel.com](https://vercel.com) и залогинься через GitHub
2. Нажми **Add New Project** (или **Import Project**)
3. Выбери репозиторий `caffio-project`
4. Настройки проекта:

   **Framework Preset**: `Vite`
   
   **Root Directory**: `frontend`
   
   **Build Command**: `npm run build`
   
   **Output Directory**: `build`
   
   **Install Command**: `npm install`

5. **Environment Variables** (вкладка **Environment Variables**):
   - `VITE_API_BASE_URL` = `https://твой-backend-url.onrender.com`
     (например, `https://caffio-backend.onrender.com`)

6. Нажми **Deploy**

7. После деплоя Vercel даст тебе URL (например, `https://caffio-project.vercel.app`)

### Шаг 3: Обновить CORS в Backend

После получения URL фронтенда, обнови `apps/backend/src/main.ts`:

```typescript
cors: {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'https://твой-фронтенд-url.vercel.app', // добавь сюда
  ],
  credentials: true,
}
```

Закоммить и запушить → Render автоматически перезапустит backend.

---

## Вариант 2: Netlify

### Шаг 1: Подготовка

Аналогично Vercel — нужен URL backend.

### Шаг 2: Деплой на Netlify

1. Зайди на [netlify.com](https://netlify.com) и залогинься через GitHub
2. **Add new site** → **Import an existing project** → выбери `caffio-project`
3. Настройки:

   **Base directory**: `frontend`
   
   **Build command**: `npm run build`
   
   **Publish directory**: `build`
   
   **Environment variables**:
   - `VITE_API_BASE_URL` = `https://твой-backend-url.onrender.com`

4. Нажми **Deploy site**

5. После деплоя получишь URL (например, `https://caffio-project.netlify.app`)

### Шаг 3: Обновить CORS

Добавь URL Netlify в `apps/backend/src/main.ts` (как в варианте 1).

---

## Вариант 3: Render Static Site

### Шаг 1: Создание Static Site

1. В Render Dashboard → **New** → **Static Site**
2. Подключи GitHub репозиторий `caffio-project`
3. Настройки:

   **Name**: `caffio-frontend`
   
   **Branch**: `main`
   
   **Root Directory**: `frontend`
   
   **Build Command**: `npm install && npm run build`
   
   **Publish Directory**: `build`
   
   **Environment Variables**:
   - `VITE_API_BASE_URL` = `https://твой-backend-url.onrender.com`

4. Нажми **Create Static Site**

5. После деплоя получишь URL (например, `https://caffio-frontend.onrender.com`)

### Шаг 2: Обновить CORS

Добавь URL Render Static Site в `apps/backend/src/main.ts`.

---

## Проверка работы

После деплоя фронтенда:

1. Открой URL фронтенда в браузере
2. Попробуй залогиниться:
   - Email: `admin1@caffio.com`
   - Password: `Admin123!`
3. Проверь, что меню загружается из backend
4. Проверь, что изменения сохраняются (добавь/измени пункт меню)

---

## Troubleshooting

### Проблема: "Failed to fetch" или CORS error
**Решение**: 
- Убедись, что URL фронтенда добавлен в CORS настройки backend
- Проверь, что `VITE_API_BASE_URL` правильно установлен в переменных окружения
- Пересобери фронтенд после изменения переменных окружения

### Проблема: "API_BASE_URL is not defined"
**Решение**: 
- Проверь, что переменная окружения называется именно `VITE_API_BASE_URL` (с префиксом `VITE_`)
- В Vercel/Netlify/Render пересобери проект после добавления переменной

### Проблема: Фронтенд не подключается к backend
**Решение**:
- Проверь, что backend не "спит" (сделай запрос через браузер: `https://твой-backend-url.onrender.com/cafes`)
- Проверь, что `VITE_API_BASE_URL` указывает на правильный URL (с `https://`)
- Открой DevTools → Network и посмотри, какие запросы отправляются

