# Отчёт проверки упрощённой версии

Архитектура: статический экспорт Next.js, без API, БД, cookie, серверных секретов и миграций. Zod проверяет единый `shop.ts` и пользовательский выбор. Unit-тесты покрывают расчёт, allowlist и messenger URL; Playwright — адаптивность и стоп-лист.

Фактическая проверка 2026-11-12:

- `npm ci --ignore-scripts` запущен и остановлен HTTP 403 от npm registry до установки пакетов.
- `npm run lint`, `typecheck`, `test`, `test:integration` и `build` запущены, но завершились `command not found`, поскольку зависимости не установлены. Это не считается положительным результатом.
- JSON-файлы прошли `jq`; `eslint.config.mjs` прошёл `node --check`.
- По исходникам нет импортов `pg`, database URL, миграционных команд, Turnstile secrets или API заявок.
- Secret scan по шаблонам private key/OpenAI/GitHub token не нашёл совпадений.
- Hero WebP 1672×941 и icon PNG 64×64 распознаны корректно.

После загрузки в GitHub обязательны зелёная сборка Vercel и повторный запуск всех команд из README.
