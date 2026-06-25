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

`index.html` лежит в корне репозитория — дополнительная сборка не требуется для главной, но **SEO-кластер** генерируется скриптом (см. ниже).

## SEO и контентный кластер

Сайт включает главный лендинг и SEO-страницы: услуги, объекты, география, блог.

### Сборка страниц

После изменения контента в `content/`:

```bash
python scripts/build-pages.py
```

Скрипт генерирует HTML в `services/`, `objects/`, `geography/`, `blog/` и обновляет `sitemap.xml`.

Контент: `content/services/*.json`, `content/objects/*.json`, `content/geography/*.json`, `content/blog/*.json`, каталоги — `content/catalogs/*.json`.

Домен для sitemap берётся из `content/site.json` (должен совпадать с `js/config.js` → `domain`).

### AI и нейровыдача

- `llms.txt` — краткий контекст для AI-краулеров
- `llms-full.txt` — расширенная база фактов
- `robots.txt` — разрешены GPTBot, OAI-SearchBot, Google-Extended
- JSON-LD `@graph`, FAQPage, Service/Article schema

### Яндекс.Метрика и вебмастера

1. Создайте счётчик в [Метрике](https://metrika.yandex.ru/) и укажите ID в `js/config.js` → `yandexMetrikaId`
2. Добавьте сайт в [Google Search Console](https://search.google.com/search-console) и [Яндекс.Вебмастер](https://webmaster.yandex.ru/)
3. Отправьте sitemap: `https://ваш-домен/sitemap.xml`
4. Цели в Метрике: `lead_submit`, клики `data-analytics` (уже размечены на главной)

### Чеклист смены домена

1. Обновить `domain` в `js/config.js` и `content/site.json`
2. Запустить `python scripts/build-pages.py` (пересобрать sitemap)
3. Настроить **301 редирект** со старого хоста на новый (GitHub Pages custom domain или nginx)
4. Переотправить sitemap в Search Console и Вебмастер
5. Проверить canonical и OG-теги на главной и 2–3 страницах кластера (`js/seo.js` подставляет домен автоматически)

### OG-изображение

```bash
python scripts/generate-og.py
```

Результат: `assets/og/og-image.jpg` (1200×630).

## Структура

- `index.html` — главный лендинг
- `services/`, `objects/`, `geography/`, `blog/` — SEO-кластер (генерируются)
- `content/` — исходники страниц кластера
- `templates/page.html` — шаблон SEO-страниц
- `scripts/build-pages.py`, `scripts/generate-og.py`
- `llms.txt`, `llms-full.txt`
- `css/` — стили
- `js/config.js`, `js/seo.js` — конфиг, SEO-патч canonical/schema
- `js/main.js`, `form.js`, `faq.js`, `analytics.js`, `animations.js`
- `js/visuals/` — SVG-сцены
- `docs/LEAD_FORM_INTEGRATION.md` — API формы заявок
- `server/lead-webhook/` — эталонный приёмник заявок
- `privacy.html`, `consent.html` — юридические шаблоны (TODO)
- `robots.txt`, `sitemap.xml`

## Лицензия

Материалы проекта — по согласованию с правообладателем ЦИА.
