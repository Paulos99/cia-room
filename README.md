# ЦИА — Помещения (лендинг)

Статический лендинг направления «Помещения» Центра инновационной акустики.

## Локальный просмотр

```bash
# Python 3
python -m http.server 8080
```

Откройте `http://localhost:8080/`.

## Конфигурация

Заполните `js/config.js` перед продакшеном:

- `phone`, `email`, `telegram`, `geography`, `responseTime`
- `legalEntity`, `legalDetails`, `address`
- `domain` — публичный URL сайта
- `leadWebhookUrl` — HTTPS endpoint для POST JSON заявок
- `yandexMetrikaId` — номер счётчика Яндекс.Метрики

## GitHub Pages

1. Репозиторий: `Paulos99/cia-room`
2. В GitHub: **Settings → Pages → Build and deployment**
   - Source: **Deploy from a branch**
   - Branch: **main** / **/ (root)**
3. После push сайт доступен по адресу: https://paulos99.github.io/cia-room/

`index.html` лежит в корне репозитория — дополнительная сборка не требуется.

## Структура

- `index.html` — страница с 12 секциями
- `css/` — стили
- `js/config.js` — контакты и интеграции
- `js/main.js`, `form.js`, `faq.js`, `analytics.js`, `animations.js`
- `js/visuals/` — SVG-сцены
- `privacy.html`, `consent.html` — юридические шаблоны (TODO)
- `robots.txt`, `sitemap.xml`

## Форма заявок

POST JSON на `leadWebhookUrl` (см. `js/form.js`). Без URL включён демо-режим успешной отправки.

## Лицензия

Материалы проекта — по согласованию с правообладателем ЦИА.