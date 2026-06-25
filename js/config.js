/**
 * Единый конфигурационный файл лендинга ЦИА — Помещения.
 * При смене домена обновите только `domain` и перегенерируйте sitemap (npm run build / python scripts/build-pages.py).
 */
const CIA_CONFIG = {
  phone: '[ТЕЛЕФОН]',
  email: '[EMAIL]',
  telegram: '[TELEGRAM]',
  geography: 'Россия',
  responseTime: '[СРОК ОБРАТНОЙ СВЯЗИ]',
  legalEntity: '[ЮРИДИЧЕСКОЕ ЛИЦО]',
  legalDetails: '[ИНН / РЕКВИЗИТЫ — ПРИ НЕОБХОДИМОСТИ]',
  address: '[АДРЕС]',
  domain: 'https://paulos99.github.io/cia-room',
  siteName: 'ЦИА — Помещения',
  defaultOgImage: '/assets/og/og-image.jpg',
  areaServedSchema: { '@type': 'Country', name: 'Россия' },
  leadWebhookUrl: '',
  yandexMetrikaId: '',
  leadForm: {
    mode: 'demo',
    webhookUrl: '',
  },
};
