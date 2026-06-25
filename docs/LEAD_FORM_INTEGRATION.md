# Интеграция формы заявок — ЦИА Помещения

Документ для команды интернет-маркетинга: как подключить приём заявок с лендинга к вашему серверу или CRM.

## Быстрый чеклист

1. Разверните HTTPS endpoint, принимающий `POST` (см. [эталонный сервер](../server/lead-webhook/README.md) или свой API).
2. Настройте **CORS** — разрешите домен сайта и нужные заголовки (см. ниже).
3. Откройте [`js/config.js`](../js/config.js) и укажите:
   ```js
   leadForm: {
     mode: 'live',
     webhookUrl: 'https://ваш-сервер.example.com/api/leads',
     webhookHeaders: { 'X-API-Key': 'секрет' }, // при необходимости
   }
   ```
4. Заполните контакты, `domain`, `yandexMetrikaId`.
5. Протестируйте отправку без файлов и с файлом (curl ниже).

Пока `mode: 'demo'` — форма имитирует успешную отправку без реального запроса.

---

## Требования к серверу

| Требование | Значение |
|------------|----------|
| Протокол | **HTTPS** (обязательно в продакшене) |
| Метод | `POST` |
| CORS | `Access-Control-Allow-Origin: https://ваш-домен.ru` (или `*` для тестов) |
| CORS preflight | `Access-Control-Allow-Methods: POST, OPTIONS` |
| CORS headers | `Access-Control-Allow-Headers: Content-Type, Accept, X-API-Key, Authorization` |
| Размер тела | до **100 МБ** (суммарно файлы) |
| Таймаут | рекомендуется ≥ 120 с при загрузке файлов |

Лендинг — статический сайт (GitHub Pages и т.п.). Серверная логика **всегда внешняя**.

---

## Форматы запроса

### 1. Без вложений — `application/json`

```http
POST /api/leads HTTP/1.1
Host: api.example.com
Content-Type: application/json
Accept: application/json
X-API-Key: ваш-ключ

{ ...payload... }
```

### 2. С вложениями — `multipart/form-data`

| Поле | Тип | Описание |
|------|-----|----------|
| `payload` | string (JSON) | Тот же объект, что и в JSON-запросе |
| `attachments` | file (повторяющееся) | До 10 файлов, каждый до 25 МБ |

Лимиты на клиенте: 10 файлов × 25 МБ, суммарно 100 МБ.  
Допустимые форматы: JPG, PNG, WEBP, HEIC, GIF, MP4, MOV, WEBM, PDF, DWG, DXF, DOC, DOCX, XLS, XLSX.

---

## Схема JSON payload

| Поле | Тип | Обязательное | Пример / описание |
|------|-----|:---:|-------------------|
| `formVersion` | string | да | `"1.0"` |
| `requestId` | string (UUID) | да | `"a1b2c3d4-..."` — для трассировки |
| `source` | string | да | `"cia-rooms-landing"` |
| `name` | string | да | `"Иван Петров"` |
| `phone` | string | да | `"+79991234567"` |
| `emailOrTelegram` | string | нет | `"ivan@mail.ru"` или `"@ivan"` |
| `preferredContact` | string | да | `phone` \| `email` \| `telegram` |
| `serviceType` | string | да | `remote`, `measurement`, `design`, `special`, `industrial`, `unsure` |
| `serviceTypeLabel` | string | да | `"02 — Акустический замер и обследование"` |
| `objectType` | string | да | `apartment`, `house`, `studio`, `office`, `horeca`, `industrial`, `other` |
| `objectTypeLabel` | string | да | `"Квартира"` |
| `city` | string | да | `"Москва"` |
| `area` | string | нет | `"65 м²"` |
| `projectStage` | string | да | `design-project`, `before`, `during`, `ready` |
| `projectStageLabel` | string | да | `"До ремонта"` |
| `task` | string | да | Текст задачи (≥ 10 символов на клиенте) |
| `attachments` | array | да | `[{ "name": "plan.pdf", "size": 102400, "type": "application/pdf" }]` |
| `attachmentCount` | number | да | `0`–`10` |
| `diagnosePrefill` | object \| null | нет | Данные из диагностикатора на сайте |
| `utm` | object | нет | `{ "utm_source": "yandex", "utm_medium": "cpc" }` |
| `pageUrl` | string | да | URL страницы отправки |
| `referrer` | string | да | `document.referrer` |
| `userAgent` | string | да | User-Agent браузера |
| `submittedAt` | string (ISO 8601) | да | `"2026-06-25T12:00:00.000Z"` |

### Пример payload (без файлов)

```json
{
  "formVersion": "1.0",
  "requestId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "source": "cia-rooms-landing",
  "name": "Иван Петров",
  "phone": "+79991234567",
  "emailOrTelegram": "ivan@mail.ru",
  "preferredContact": "phone",
  "serviceType": "measurement",
  "serviceTypeLabel": "02 — Акустический замер и обследование",
  "objectType": "apartment",
  "objectTypeLabel": "Квартира",
  "city": "Москва",
  "area": "65 м²",
  "projectStage": "before",
  "projectStageLabel": "До ремонта",
  "task": "Слышно шум от соседей сверху, нужна оценка и рекомендации по звукоизоляции потолка.",
  "attachments": [],
  "attachmentCount": 0,
  "diagnosePrefill": null,
  "utm": { "utm_source": "yandex", "utm_medium": "cpc" },
  "pageUrl": "https://example.com/#lead",
  "referrer": "https://yandex.ru/",
  "userAgent": "Mozilla/5.0 ...",
  "submittedAt": "2026-06-25T10:30:00.000Z"
}
```

---

## Ответ сервера

### Успех — HTTP `200` или `201`

```json
{
  "ok": true,
  "message": "Заявка принята. Мы свяжемся с вами в течение 1 рабочего дня.",
  "leadId": "crm-12345"
}
```

- `message` — опционально; если передан, показывается пользователю вместо стандартного текста.
- `leadId` — опционально; уходит в аналитику как `form_success`.

Минимальный успешный ответ: пустое тело с кодом `200`.

### Ошибка — HTTP `4xx` / `5xx`

```json
{
  "ok": false,
  "message": "Файл слишком большой"
}
```

Поле `message` отображается пользователю, если сервер вернул JSON.

---

## Примеры curl

### Заявка без файлов

```bash
curl -X POST "https://api.example.com/api/leads" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "X-API-Key: ваш-ключ" \
  -d '{
    "formVersion": "1.0",
    "requestId": "test-001",
    "source": "cia-rooms-landing",
    "name": "Тест",
    "phone": "+79990000000",
    "serviceType": "remote",
    "serviceTypeLabel": "01 — Дистанционная оценка",
    "objectType": "apartment",
    "objectTypeLabel": "Квартира",
    "city": "Москва",
    "projectStage": "ready",
    "projectStageLabel": "Объект готов",
    "task": "Тестовая заявка для проверки интеграции",
    "attachments": [],
    "attachmentCount": 0,
    "pageUrl": "https://example.com/",
    "referrer": "",
    "userAgent": "curl",
    "submittedAt": "2026-06-25T10:00:00.000Z"
  }'
```

### Заявка с файлом

```bash
curl -X POST "https://api.example.com/api/leads" \
  -H "Accept: application/json" \
  -H "X-API-Key: ваш-ключ" \
  -F 'payload={"formVersion":"1.0","requestId":"test-002","source":"cia-rooms-landing","name":"Тест","phone":"+79990000000","serviceType":"remote","serviceTypeLabel":"01","objectType":"apartment","objectTypeLabel":"Квартира","city":"Москва","projectStage":"ready","projectStageLabel":"Готов","task":"Тест с файлом","attachments":[{"name":"plan.pdf","size":1024,"type":"application/pdf"}],"attachmentCount":1,"pageUrl":"https://example.com/","referrer":"","userAgent":"curl","submittedAt":"2026-06-25T10:00:00.000Z"}' \
  -F "attachments=@./plan.pdf"
```

---

## Парсинг multipart на сервере

### Node.js (Express + multer)

См. готовую реализацию в [`server/lead-webhook/`](../server/lead-webhook/).

```js
const payload = JSON.parse(req.body.payload);
const files = req.files; // массив attachments
```

### PHP

```php
$payload = json_decode($_POST['payload'], true);
$files = $_FILES['attachments']; // массив при multiple
```

### Python (Flask)

```python
payload = json.loads(request.form['payload'])
files = request.files.getlist('attachments')
```

---

## Подключение через no-code / CRM

### Make, Zapier, n8n

1. Создайте Webhook-триггер (Custom Webhook).
2. Укажите URL в `leadForm.webhookUrl`.
3. Для JSON-заявок — маппинг полей напрямую.
4. Для multipart — используйте модуль парсинга Form Data; `payload` распарсить как JSON.

### Bitrix24

- Входящий вебхук CRM: `crm.lead.add` с маппингом полей из JSON.
- Файлы — через `crm.lead.update` + `disk.folder.uploadfile` или отдельный обработчик multipart.
- CORS: Bitrix вебхуки обычно принимают запросы с любого origin.

### amoCRM

- Входящий webhook или интеграция через Make/n8n.
- Поля сделки маппятся из `name`, `phone`, `task`, UTM-меток.

---

## Защита от спама (уже на клиенте)

- Honeypot-поле `website` (скрыто) — ботам показывается фейковый успех.
- Rate limit — 30 секунд между отправками в одной вкладке.
- Валидация полей на клиенте.

Рекомендуется на сервере: проверка `X-API-Key`, rate limit по IP, опционально капча.

---

## Конфигурация на сайте

Полный пример — [`js/config.example.js`](../js/config.example.js).

| Параметр | Описание |
|----------|----------|
| `leadForm.mode` | `'demo'` — без запроса; `'live'` — реальная отправка |
| `leadForm.webhookUrl` | URL endpoint |
| `leadForm.webhookHeaders` | Доп. заголовки (API-ключ, Bearer) |
| `leadForm.timeoutMs` | Таймаут в мс (по умолчанию 120000) |
| `leadForm.successMessage` | Переопределить текст успеха |
| `leadForm.errorMessage` | Переопределить текст ошибки |

Устаревшее поле `leadWebhookUrl` поддерживается как fallback.

---

## Аналитика (Яндекс.Метрика)

События `reachGoal`:

| Цель | Когда |
|------|-------|
| `form_submit` | Начало отправки |
| `form_success` | Успех (`mode`, `requestId`, `leadId`) |
| `form_error` | Ошибка (`kind`, `requestId`) |
| `diagnose_lead_prefill` | Prefill из диагностикатора |

---

## Поддержка

Эталонный приёмник для тестов и разработки: [`server/lead-webhook/README.md`](../server/lead-webhook/README.md).
