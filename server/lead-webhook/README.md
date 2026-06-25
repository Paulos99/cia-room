# Эталонный приёмник заявок

Минимальный Node.js сервер для приёма заявок с лендинга ЦИА — Помещения.  
Подходит для тестов, staging и как основа для интеграции с CRM.

Полная документация API: [`docs/LEAD_FORM_INTEGRATION.md`](../../docs/LEAD_FORM_INTEGRATION.md)

## Быстрый старт

```bash
cd server/lead-webhook
cp .env.example .env
npm install
npm start
```

Сервер слушает `http://localhost:3000`, endpoint: `POST /api/leads`.

## Настройка (.env)

| Переменная | Описание | По умолчанию |
|------------|----------|--------------|
| `PORT` | Порт сервера | `3000` |
| `ALLOWED_ORIGIN` | Домен лендинга для CORS | `https://paulos99.github.io` |
| `API_KEY` | Секретный ключ (`X-API-Key`); пусто = без проверки | — |

## Подключение к лендингу

В [`js/config.js`](../../js/config.js):

```js
leadForm: {
  mode: 'live',
  webhookUrl: 'https://ваш-сервер.example.com/api/leads',
  webhookHeaders: { 'X-API-Key': 'ваш-ключ' },
},
```

Для локального теста с лендингом на `localhost:8080` укажите `ALLOWED_ORIGIN=http://localhost:8080`.

## Что делает сервер

1. Принимает `POST /api/leads` — JSON или `multipart/form-data`.
2. Проверяет `X-API-Key` / `Authorization: Bearer`, если задан `API_KEY`.
3. Сохраняет заявку в `data/leads/<requestId>.json`.
4. Сохраняет файлы в `data/uploads/`.
5. Отвечает `{ "ok": true, "leadId": "..." }`.

Папка `data/` создаётся автоматически и не коммитится в git.

## Тест curl

```bash
curl -X POST http://localhost:3000/api/leads \
  -H "Content-Type: application/json" \
  -d '{"formVersion":"1.0","requestId":"test-001","source":"cia-rooms-landing","name":"Тест","phone":"+79990000000","serviceType":"remote","serviceTypeLabel":"01","objectType":"apartment","objectTypeLabel":"Квартира","city":"Москва","projectStage":"ready","projectStageLabel":"Готов","task":"Тестовая заявка","attachments":[],"attachmentCount":0,"pageUrl":"http://localhost:8080/","referrer":"","userAgent":"curl","submittedAt":"2026-06-25T10:00:00.000Z"}'
```

## Деплой

### VPS (systemd + nginx)

1. Скопируйте папку на сервер, выполните `npm install --production`.
2. Настройте `.env` с продакшен-доменом в `ALLOWED_ORIGIN`.
3. Запустите через PM2 или systemd:
   ```bash
   pm2 start server.js --name cia-leads
   ```
4. Nginx reverse proxy:
   ```nginx
   location /api/leads {
     proxy_pass http://127.0.0.1:3000;
     client_max_body_size 100M;
     proxy_read_timeout 120s;
   }
   ```
5. Включите HTTPS (Let's Encrypt).

### Docker (опционально)

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
docker build -t cia-lead-webhook .
docker run -d -p 3000:3000 \
  -e ALLOWED_ORIGIN=https://example.com \
  -e API_KEY=secret \
  -v $(pwd)/data:/app/data \
  cia-lead-webhook
```

## Дальнейшая интеграция

Этот сервер — отправная точка. Типичный путь:

1. Принять заявку (как сейчас).
2. Отправить в CRM (Bitrix24, amoCRM) через их API.
3. Уведомить менеджера в Telegram / email.
4. Удалить или архивировать файлы по политике хранения.

Логику CRM добавляйте в `handleLead()` в `server.js` или вызывайте внешний сервис из Make/n8n.
