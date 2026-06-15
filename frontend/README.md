# Hospital CRM — Frontend

SPA для CRM-системы клиники. Подключается к Django REST Framework бэкенду
из соседней директории `../backend`.

## Стек

- **React 18 + TypeScript** (Vite, без SSR — чистый SPA)
- **refine** — headless-фреймворк для CRUD/data/auth/i18n
- **shadcn/ui + Radix + TailwindCSS** — UI-слой
- **Highcharts** — графики на дашборде
- **react-router-dom v6** — маршрутизация
- **react-hook-form + zod** — формы и валидация
- **axios** — HTTP-клиент
- Интерфейс полностью на русском языке.

## Архитектура — Feature-Sliced Design (FSD)

```
src/
  app/        — инициализация: провайдеры, роутер, конфиг ресурсов, стили
  pages/      — страницы-роуты (dashboard, patients, appointments, leads, ...)
  widgets/    — самостоятельные блоки UI (layout, dashboard-charts)
  features/   — пользовательские сценарии (зарезервировано под рост)
  entities/   — доменные модели и их типы (patient, appointment, lead, ...)
  shared/     — переиспользуемое ядро:
                api/    — dataProvider (DRF), authProvider (Token), http, уведомления
                ui/     — примитивы shadcn/ui
                lib/    — утилиты (cn, форматтеры дат/денег)
                config/ — константы, env
                i18n/   — русская локализация
```

Правило зависимостей FSD: слой может импортировать только нижележащие
(`app → pages → widgets → features → entities → shared`). Внутри слоя — через
public API слайса (файл `index.ts`).

## Интеграция с бэкендом

- Аутентификация: DRF `TokenAuthentication`. Логин — `POST /api/auth-token/`
  (`{username, password}` → `{token}`), токен хранится в `localStorage`,
  добавляется в заголовок `Authorization: Token <...>`.
- `dataProvider` понимает и «голый» список-массив, и пагинацию
  `{count, results}`; маппит refine-параметры на DRF: `?search=`,
  `?ordering=`, `?page=&page_size=`, фильтры по полям.

## Переменные окружения

`.env`:

```
VITE_API_URL=        # пусто в dev — запросы идут через vite-proxy на :8000
```

## Запуск

```bash
npm install
npm run dev      # http://localhost:5173 (API проксируется на :8000)
npm run build    # сборка в dist/
npm run preview  # предпросмотр сборки
npm run lint     # ESLint
npm run typecheck
```

Перед запуском поднимите бэкенд: `cd ../backend && docker compose up`.
