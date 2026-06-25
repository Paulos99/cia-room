# ЦИА — Помещения (лендинг)

Статический лендинг направления «Помещения» Центра инновационной акустики.

## Локальный просмотр

```bash
# Python 3
python -m http.server 8080
```

Откройте `http://localhost:8080/`.

## Конфигурация

Заполните `js/config.js` перед продакшеном (эталон — `js/config.example.js`):

- `phone`, `email`, `telegram`, `geography`, `responseTime`
- `legalEntity`, `legalDetails`, `address`
- `domain` — публичный URL сайта
- `yandexMetrikaId` — номер счётчика Яндекс.Метрики
- `leadForm` — настройки формы заявок (см. ниже)

## Форма заявок

Форма отправляет заявки на внешний HTTPS endpoint. Пока `leadForm.mode: 'demo'` — имитация успешной отправки.

**Для команды маркетинга** — пошаговая инструкция: [`docs/LEAD_FORM_INTEGRATION.md`](docs/LEAD_FORM_INTEGRATION.md)

Минимальное подключение в `js/config.js`:

```js
leadForm: {
  mode: 'live',
  webhookUrl: 'https://ваш-сервер.example.com/api/leads',
  webhookHeaders: { 'X-API-Key': 'секрет' }, // при необходимости
},
```

Эталонный сервер-приёмник для тестов: [`server/lead-webhook/`](server/lead-webhook/)

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
- `docs/LEAD_FORM_INTEGRATION.md` — API формы заявок
- `server/lead-webhook/` — эталонный приёмник заявок
- `privacy.html`, `consent.html` — юридические шаблоны (TODO)
- `robots.txt`, `sitemap.xml`

## Лицензия

Материалы проекта — по согласованию с правообладателем ЦИА.
