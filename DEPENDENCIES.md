# Зависимости

Проект использует только Next.js/React, Zod и инструменты разработки. PostgreSQL, `pg`, Turnstile и серверные SDK удалены. Прямые версии закреплены в `package.json`; после восстановления доступа к npm registry требуется пересоздать полный транзитивный lockfile и выполнить `npm ci`, `npm audit --omit=dev` и production build.

| Пакет | Версия | Назначение |
|---|---:|---|
| next | 16.4.6 | Статический App Router build |
| react / react-dom | 19.3.0 | Интерфейс |
| zod | 4.1.12 | Валидация конфигурации и заказа |
| vitest | 4.0.7 | Unit/integration tests |
| @playwright/test | 1.56.1 | Проверка браузерного UX |
