(function () {
  'use strict';

  const form = document.getElementById('lead-form');
  if (!form) return;

  const step1 = document.getElementById('form-step-1');
  const step2 = document.getElementById('form-step-2');
  const btnNext = document.getElementById('form-next');
  const btnBack = document.getElementById('form-back');
  const btnSubmit = document.getElementById('form-submit');
  const statusEl = document.getElementById('form-status');
  const indicators = document.querySelectorAll('[data-step-indicator]');

  let isSubmitting = false;

  const fields = {
    objectType: { el: document.getElementById('objectType'), error: document.getElementById('error-objectType'), required: true },
    city: { el: document.getElementById('city'), error: document.getElementById('error-city'), required: true },
    area: { el: document.getElementById('area'), error: null, required: false },
    projectStage: { el: document.getElementById('projectStage'), error: document.getElementById('error-projectStage'), required: true },
    task: { el: document.getElementById('task'), error: document.getElementById('error-task'), required: true },
    name: { el: document.getElementById('name'), error: document.getElementById('error-name'), required: true },
    phone: { el: document.getElementById('phone'), error: document.getElementById('error-phone'), required: true },
    emailOrTelegram: { el: document.getElementById('emailOrTelegram'), error: null, required: false },
    preferredContact: { el: document.getElementById('preferredContact'), error: null, required: false },
    consent: { el: document.getElementById('consent'), error: document.getElementById('error-consent'), required: true },
  };

  function showStatus(message, type) {
    statusEl.hidden = false;
    statusEl.textContent = message;
    statusEl.className = 'form-status form-status--' + type;
  }

  function hideStatus() {
    statusEl.hidden = true;
    statusEl.textContent = '';
  }

  function clearErrors() {
    Object.values(fields).forEach((f) => {
      if (!f.el) return;
      f.el.classList.remove('is-error');
      if (f.error) {
        f.error.hidden = true;
        f.error.textContent = '';
      }
    });
  }

  function validateField(key) {
    const f = fields[key];
    if (!f.el) return true;
    const val = f.el.type === 'checkbox' ? f.el.checked : f.el.value.trim();

    if (f.required && !val) {
      f.el.classList.add('is-error');
      if (f.error) {
        f.error.hidden = false;
        f.error.textContent = 'Заполните это поле';
      }
      return false;
    }

    if (key === 'phone' && val && val.replace(/\D/g, '').length < 10) {
      f.el.classList.add('is-error');
      if (f.error) {
        f.error.hidden = false;
        f.error.textContent = 'Укажите корректный номер телефона';
      }
      return false;
    }

    return true;
  }

  function validateStep(step) {
    clearErrors();
    const keys = step === 1
      ? ['objectType', 'city', 'projectStage', 'task']
      : ['name', 'phone', 'consent'];
    return keys.every(validateField);
  }

  function goToStep(step) {
    step1.hidden = step !== 1;
    step2.hidden = step !== 2;
    indicators.forEach((ind) => {
      ind.classList.toggle('is-active', Number(ind.dataset.stepIndicator) === step);
    });
    hideStatus();
  }

  function getUtm() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((key) => {
      if (params.get(key)) utm[key] = params.get(key);
    });
    return utm;
  }

  function getPayload() {
    return {
      source: 'cia-rooms-landing',
      name: fields.name.el.value.trim(),
      phone: fields.phone.el.value.trim(),
      emailOrTelegram: fields.emailOrTelegram.el.value.trim(),
      preferredContact: fields.preferredContact.el.value,
      objectType: fields.objectType.el.value,
      city: fields.city.el.value.trim(),
      area: fields.area.el.value.trim(),
      projectStage: fields.projectStage.el.value,
      task: fields.task.el.value.trim(),
      utm: getUtm(),
      pageUrl: window.location.href,
      referrer: document.referrer || '',
      createdAt: new Date().toISOString(),
    };
  }

  btnNext?.addEventListener('click', () => {
    if (validateStep(1)) {
      goToStep(2);
      if (window.CIAAnalytics) window.CIAAnalytics.track('form_step_1_complete');
    }
  });

  btnBack?.addEventListener('click', () => goToStep(1));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    const honeypot = document.getElementById('website');
    if (honeypot && honeypot.value) return;

    if (!validateStep(2)) return;

    const webhookUrl = typeof CIA_CONFIG !== 'undefined' ? CIA_CONFIG.leadWebhookUrl : '';

    if (!webhookUrl) {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
      if (isLocal) {
        showStatus('Демо-режим: webhook не настроен. Заявка не отправлена. Заполните leadWebhookUrl в js/config.js.', 'info');
      } else {
        showStatus('Онлайн-отправка временно недоступна. Свяжитесь с нами по телефону или в мессенджере — контакты указаны ниже.', 'error');
      }
      if (window.CIAAnalytics) window.CIAAnalytics.track('form_error', { reason: 'no_webhook' });
      return;
    }

    isSubmitting = true;
    btnSubmit.disabled = true;
    showStatus('Отправка заявки…', 'info');
    if (window.CIAAnalytics) window.CIAAnalytics.track('form_submit');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getPayload()),
      });

      if (!response.ok) throw new Error('Server error');

      const responseTime = typeof CIA_CONFIG !== 'undefined' ? CIA_CONFIG.responseTime : '';
      let successMsg = 'Заявка принята. Специалист свяжется с вами, чтобы уточнить задачу и исходные данные объекта.';
      if (responseTime && !responseTime.startsWith('[')) {
        successMsg += ' ' + responseTime;
      }

      showStatus(successMsg, 'success');
      form.reset();
      goToStep(1);
      if (window.CIAAnalytics) window.CIAAnalytics.track('form_success');
    } catch {
      showStatus('Не удалось отправить заявку. Попробуйте позже или свяжитесь с нами напрямую по контактам ниже.', 'error');
      if (window.CIAAnalytics) window.CIAAnalytics.track('form_error', { reason: 'fetch_failed' });
    } finally {
      isSubmitting = false;
      btnSubmit.disabled = false;
    }
  });
})();
