/**
 * Пример конфигурации лендинга ЦИА — Помещения.
 * Скопируйте в config.js и заполните значения.
 *
 * Интеграция формы заявок: docs/LEAD_FORM_INTEGRATION.md
 */
const CIA_CONFIG = {
  phone: '+7 (999) 000-00-00',
  email: 'info@example.com',
  telegram: '@cia_rooms',
  geography: 'Россия',
  responseTime: 'в течение 1 рабочего дня',
  legalEntity: 'ООО «Пример»',
  legalDetails: 'ИНН 0000000000',
  address: 'г. Москва, ул. Примерная, д. 1',
  domain: 'https://example.com',
  siteName: 'ЦИА — Помещения',
  defaultOgImage: '/assets/og/og-image.jpg',
  areaServedSchema: { '@type': 'Country', name: 'Россия' },
  yandexMetrikaId: '12345678',

  leadForm: {
    mode: 'live',
    webhookUrl: 'https://api.example.com/api/leads',
    webhookHeaders: {
      'X-API-Key': 'ваш-секретный-ключ',
    },
    timeoutMs: 120000,
    successMessage: '',
    errorMessage: '',
  },
};
