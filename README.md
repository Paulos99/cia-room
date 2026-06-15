# ЦИА — Помещения

Статический HTML-лендинг для акустических замеров и проектирования помещений.

## GitHub Pages

Сайт публикуется из корня репозитория:

**https://paulos99.github.io/cia-room/**

### Включение GitHub Pages

1. Откройте репозиторий → **Settings** → **Pages**
2. **Source**: Deploy from a branch
3. **Branch**: `main` / **Folder**: `/ (root)`
4. Сохраните — сайт появится через 1–3 минуты

## Локальный просмотр

Откройте `index.html` в браузере или запустите локальный сервер:

```bash
npx serve .
```

## Загрузка на хостинг

1. Заполните `js/config.js`
2. Загрузите всю папку в `public_html` / `www` через FTP
3. Убедитесь, что `index.html` открывается по домену

## Настройка `js/config.js`

| Поле | Описание |
|------|----------|
| `phone` | Телефон |
| `email` | Email |
| `telegram` | Telegram (@username) |
| `geography` | География работы |
| `responseTime` | Срок обратной связи |
| `legalEntity` | Юридическое лицо |
| `legalDetails` | ИНН / реквизиты |
| `domain` | Домен сайта |
| `leadWebhookUrl` | URL webhook/CRM для заявок |
| `yandexMetrikaId` | ID Яндекс.Метрики (опционально) |

Также замените `[ДОМЕН]` в `index.html`, `robots.txt`, `sitemap.xml`.

## Форма заявок (webhook)

Форма отправляет POST JSON на `leadWebhookUrl`:

```json
{
  "source": "cia-rooms-landing",
  "name": "...",
  "phone": "...",
  "objectType": "...",
  "utm": {},
  "pageUrl": "...",
  "createdAt": "ISO_DATE"
}
```

**CORS:** webhook должен принимать запросы из браузера. Если CRM не поддерживает CORS — используйте прокси (Make, Zapier, serverless-функцию).

Без `leadWebhookUrl` форма показывает контакты для прямой связи.

## Структура

```
index.html          — главная страница
privacy.html        — политика конфиденциальности (шаблон)
consent.html        — согласие на обработку данных (шаблон)
css/                — стили
js/config.js        — конфигурация
js/form.js          — форма заявки
js/visuals/         — SVG-визуализации
assets/             — иконки, OG-изображение
```

## Перед публикацией

- [ ] Заполнить контакты в `js/config.js`
- [ ] Настроить `leadWebhookUrl`
- [ ] Проверить `privacy.html` и `consent.html` у юриста
- [ ] Заменить `[ДОМЕН]` в meta и sitemap
- [ ] Протестировать форму
