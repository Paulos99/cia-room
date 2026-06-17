(function () {
  'use strict';

  const RATE_LIMIT_MS = 30000;
  const STORAGE_KEY = 'cia_lead_last_submit';

  const labels = {
    objectType: {
      apartment: 'Квартира',
      house: 'Частный дом',
      studio: 'Студия / медиапространство',
      office: 'Офис / переговорная',
      horeca: 'HoReCa / коммерческое',
      industrial: 'Промышленный / нестандартный',
      other: 'Другое',
    },
    projectStage: {
      before: 'До ремонта',
      during: 'Ремонт идёт',
      ready: 'Объект готов',
    },
    preferredContact: {
      phone: 'Телефон',
      email: 'Email',
      telegram: 'Telegram',
    },
  };

  function track(name, params) {
    if (window.CIAAnalytics && typeof window.CIAAnalytics.trackEvent === 'function') {
      window.CIAAnalytics.trackEvent(name, params);
    }
  }

  function getUtm() {
    const params = new URLSearchParams(window.location.search);
    const utm = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach((key) => {
      const val = params.get(key);
      if (val) utm[key] = val;
    });
    return utm;
  }

  function showError(id, message) {
    const el = document.getElementById('error-' + id);
    const input = document.getElementById(id);
    if (el) {
      el.textContent = message;
      el.hidden = !message;
    }
    if (input) {
      input.classList.toggle('is-error', Boolean(message));
      if (message) {
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', 'error-' + id);
      } else {
        input.removeAttribute('aria-invalid');
        input.removeAttribute('aria-describedby');
      }
    }
  }

  function focusFirstInvalid(ids) {
    for (const id of ids) {
      const input = document.getElementById(id);
      if (input && input.classList.contains('is-error')) {
        input.focus();
        break;
      }
    }
  }

  function clearErrors(ids) {
    ids.forEach((id) => showError(id, ''));
  }

  function validatePhone(value) {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10;
  }

  function setStep(step) {
    const step1 = document.getElementById('form-step-1');
    const step2 = document.getElementById('form-step-2');
    if (!step1 || !step2) return;
    const isFirst = step === 1;
    step1.hidden = !isFirst;
    step2.hidden = isFirst;
    document.querySelectorAll('[data-step-indicator]').forEach((el) => {
      el.classList.toggle('is-active', el.getAttribute('data-step-indicator') === String(step));
    });

    const progress = document.getElementById('form-progress');
    const progressFill = document.getElementById('form-progress-fill');
    if (progress) {
      progress.setAttribute('aria-valuenow', String(step));
      progress.setAttribute('aria-label', 'Шаг ' + step + ' из 2');
    }
    if (progressFill) {
      progressFill.style.width = step === 1 ? '50%' : '100%';
    }

    const status = document.getElementById('form-status');
    if (status) status.hidden = true;
  }

  function validateStep1() {
    clearErrors(['objectType', 'city', 'projectStage', 'task']);
    let ok = true;

    const objectType = document.getElementById('objectType');
    const city = document.getElementById('city');
    const projectStage = document.getElementById('projectStage');
    const task = document.getElementById('task');

    if (!objectType || !objectType.value) {
      showError('objectType', 'Выберите тип объекта');
      ok = false;
    }
    if (!city || !city.value.trim()) {
      showError('city', 'Укажите город');
      ok = false;
    }
    if (!projectStage || !projectStage.value) {
      showError('projectStage', 'Выберите стадию');
      ok = false;
    }
    if (!task || !task.value.trim() || task.value.trim().length < 10) {
      showError('task', 'Опишите задачу (не менее 10 символов)');
      ok = false;
    }
    if (!ok) focusFirstInvalid(['objectType', 'city', 'projectStage', 'task']);
    return ok;
  }

  function validateStep2() {
    clearErrors(['name', 'phone', 'consent']);
    let ok = true;
    const name = document.getElementById('name');
    const phone = document.getElementById('phone');
    const consent = document.getElementById('consent');

    if (!name || !name.value.trim()) {
      showError('name', 'Укажите имя');
      ok = false;
    }
    if (!phone || !validatePhone(phone.value)) {
      showError('phone', 'Укажите корректный телефон');
      ok = false;
    }
    if (!consent || !consent.checked) {
      showError('consent', 'Необходимо согласие на обработку данных');
      ok = false;
    }
    if (!ok) focusFirstInvalid(['name', 'phone', 'consent']);
    return ok;
  }

  function setStatus(type, message) {
    const status = document.getElementById('form-status');
    if (!status) return;
    status.hidden = false;
    status.className = 'form-status form-status--' + type;
    status.textContent = message;
  }

  function collectPayload() {
    const get = (id) => {
      const el = document.getElementById(id);
      return el ? el.value.trim() : '';
    };

    return {
      source: 'cia-rooms-landing',
      name: get('name'),
      phone: get('phone'),
      emailOrTelegram: get('emailOrTelegram'),
      preferredContact: get('preferredContact') || 'phone',
      objectType: get('objectType'),
      objectTypeLabel: labels.objectType[get('objectType')] || get('objectType'),
      city: get('city'),
      area: get('area'),
      projectStage: get('projectStage'),
      projectStageLabel: labels.projectStage[get('projectStage')] || get('projectStage'),
      task: get('task'),
      utm: getUtm(),
      pageUrl: window.location.href,
      submittedAt: new Date().toISOString(),
    };
  }

  async function submitForm(form) {
    const honeypot = document.getElementById('website');
    if (honeypot && honeypot.value.trim()) {
      setStatus('success', 'Задача отправлена. Мы свяжемся с вами для уточнения исходных данных.');
      form.reset();
      setStep(1);
      return;
    }

    const last = Number(sessionStorage.getItem(STORAGE_KEY) || 0);
    if (Date.now() - last < RATE_LIMIT_MS) {
      setStatus('error', 'Пожалуйста, подождите перед повторной отправкой.');
      return;
    }

    if (!validateStep2()) return;

    const payload = collectPayload();
    const webhook = (typeof CIA_CONFIG !== 'undefined' && CIA_CONFIG.leadWebhookUrl) || '';

    track('form_submit', { objectType: payload.objectType });

    const submitBtn = document.getElementById('form-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
    }
    setStatus('info', 'Отправляем задачу…');

    try {
      if (!webhook) {
        await new Promise((r) => setTimeout(r, 600));
        sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
        setStatus('success', 'Задача принята (демо-режим: укажите leadWebhookUrl в js/config.js). Мы свяжемся с вами для уточнения исходных данных.');
        track('form_success', { mode: 'demo' });
        form.reset();
        setStep(1);
        return;
      }

      const res = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);

      sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
      const responseTime = (typeof CIA_CONFIG !== 'undefined' && CIA_CONFIG.responseTime) || '';
      const suffix = responseTime && !/^\[/.test(responseTime) ? ' ' + responseTime : '';
      setStatus('success', 'Задача отправлена. Мы свяжемся с вами' + suffix + '.');
      track('form_success', { mode: 'webhook' });
      form.reset();
      setStep(1);
    } catch (err) {
      console.error(err);
      setStatus('error', 'Не удалось отправить форму. Попробуйте позже или воспользуйтесь контактами ниже.');
      track('form_error', { message: String(err && err.message ? err.message : err) });
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
      }
    }
  }

  function validateField(id) {
    const validators = {
      objectType: () => {
        const el = document.getElementById('objectType');
        if (!el || !el.value) {
          showError('objectType', 'Выберите тип объекта');
          return false;
        }
        showError('objectType', '');
        return true;
      },
      city: () => {
        const el = document.getElementById('city');
        if (!el || !el.value.trim()) {
          showError('city', 'Укажите город');
          return false;
        }
        showError('city', '');
        return true;
      },
      projectStage: () => {
        const el = document.getElementById('projectStage');
        if (!el || !el.value) {
          showError('projectStage', 'Выберите стадию');
          return false;
        }
        showError('projectStage', '');
        return true;
      },
      task: () => {
        const el = document.getElementById('task');
        if (!el || !el.value.trim() || el.value.trim().length < 10) {
          showError('task', 'Опишите задачу (не менее 10 символов)');
          return false;
        }
        showError('task', '');
        return true;
      },
      name: () => {
        const el = document.getElementById('name');
        if (!el || !el.value.trim()) {
          showError('name', 'Укажите имя');
          return false;
        }
        showError('name', '');
        return true;
      },
      phone: () => {
        const el = document.getElementById('phone');
        if (!el || !validatePhone(el.value)) {
          showError('phone', 'Укажите корректный телефон');
          return false;
        }
        showError('phone', '');
        return true;
      },
    };

    if (validators[id]) validators[id]();
  }

  function initForm() {
    const form = document.getElementById('lead-form');
    if (!form) return;

    setStep(1);

    ['objectType', 'city', 'projectStage', 'task', 'name', 'phone'].forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('blur', () => validateField(id));
    });

    const consent = document.getElementById('consent');
    if (consent) {
      consent.addEventListener('change', () => {
        if (consent.checked) showError('consent', '');
      });
    }

    const nextBtn = document.getElementById('form-next');
    const backBtn = document.getElementById('form-back');

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        if (validateStep1()) setStep(2);
      });
    }

    if (backBtn) {
      backBtn.addEventListener('click', () => setStep(1));
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      submitForm(form);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initForm);
  } else {
    initForm();
  }
})();