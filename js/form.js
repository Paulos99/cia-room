(function () {
  'use strict';

  const RATE_LIMIT_MS = 30000;
  const STORAGE_KEY = 'cia_lead_last_submit';
  const FILE_CONFIG = {
    maxFiles: 10,
    maxFileSize: 25 * 1024 * 1024,
    maxTotalSize: 100 * 1024 * 1024,
  };
  const ALLOWED_EXTENSIONS = new Set([
    'jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'gif',
    'mp4', 'mov', 'webm', 'm4v',
    'pdf', 'dwg', 'dxf', 'doc', 'docx', 'xls', 'xlsx',
  ]);

  let attachmentFiles = [];

  const labels = {
    serviceType: {
      remote: '01 — Дистанционная оценка (без выезда)',
      measurement: '02 — Акустический замер и обследование',
      design: '03 — Инженерное акустическое проектирование',
      special: '04 — Специальные проекты',
      industrial: '05 — Промышленное проектирование',
      unsure: 'Пока не определился — помогите выбрать',
    },
    objectType: {
      apartment: 'Квартира',
      house: 'Частный дом',
      studio: 'Студия / медиапространство',
      office: 'Офис / переговорная',
      horeca: 'HoReCa / коммерческое',
      industrial: 'Промышленный / технический объект',
      other: 'Другое',
    },
    projectStage: {
      'design-project': 'Разработка дизайн-проекта',
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

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' Б';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0) + ' КБ';
    return (bytes / (1024 * 1024)).toFixed(bytes < 10 * 1024 * 1024 ? 1 : 0) + ' МБ';
  }

  function getFileExtension(name) {
    const parts = name.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }

  function getFileKind(file) {
    if (file.type.startsWith('image/')) return 'IMG';
    if (file.type.startsWith('video/')) return 'VID';
    const ext = getFileExtension(file.name);
    if (['pdf'].includes(ext)) return 'PDF';
    if (['dwg', 'dxf'].includes(ext)) return 'DWG';
    return 'DOC';
  }

  function isAllowedFile(file) {
    if (file.type.startsWith('image/') || file.type.startsWith('video/') || file.type === 'application/pdf') {
      return true;
    }
    return ALLOWED_EXTENSIONS.has(getFileExtension(file.name));
  }

  function showAttachmentError(message) {
    const el = document.getElementById('error-attachments');
    const dropzone = document.getElementById('attachments-dropzone');
    if (el) {
      el.textContent = message;
      el.hidden = !message;
    }
    if (dropzone) dropzone.classList.toggle('is-error', Boolean(message));
  }

  function getAttachmentsMeta() {
    return attachmentFiles.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type || getFileExtension(file.name),
    }));
  }

  function renderFileList() {
    const list = document.getElementById('attachments-list');
    if (!list) return;

    list.innerHTML = '';
    if (!attachmentFiles.length) {
      list.hidden = true;
      return;
    }

    list.hidden = false;
    attachmentFiles.forEach((file, index) => {
      const item = document.createElement('li');
      item.className = 'form-file-item';

      const icon = document.createElement('span');
      icon.className = 'form-file-item__icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = getFileKind(file);

      const body = document.createElement('span');
      body.className = 'form-file-item__body';

      const name = document.createElement('span');
      name.className = 'form-file-item__name';
      name.textContent = file.name;

      const meta = document.createElement('span');
      meta.className = 'form-file-item__meta';
      meta.textContent = formatFileSize(file.size);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'form-file-item__remove';
      remove.setAttribute('data-file-index', String(index));
      remove.setAttribute('aria-label', 'Удалить файл ' + file.name);
      remove.textContent = '×';

      body.appendChild(name);
      body.appendChild(meta);
      item.appendChild(icon);
      item.appendChild(body);
      item.appendChild(remove);
      list.appendChild(item);
    });

    list.querySelectorAll('.form-file-item__remove').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        removeAttachment(Number(btn.getAttribute('data-file-index')));
      });
    });
  }

  function syncFileInput() {
    const input = document.getElementById('attachments');
    if (!input || typeof DataTransfer === 'undefined') return;
    const dt = new DataTransfer();
    attachmentFiles.forEach((file) => dt.items.add(file));
    input.files = dt.files;
  }

  function removeAttachment(index) {
    attachmentFiles = attachmentFiles.filter((_, i) => i !== index);
    syncFileInput();
    renderFileList();
    validateAttachments();
  }

  function clearAttachments() {
    attachmentFiles = [];
    const input = document.getElementById('attachments');
    if (input) input.value = '';
    renderFileList();
    showAttachmentError('');
  }

  function validateAttachments() {
    if (!attachmentFiles.length) {
      showAttachmentError('');
      return true;
    }

    if (attachmentFiles.length > FILE_CONFIG.maxFiles) {
      showAttachmentError('Можно приложить не более ' + FILE_CONFIG.maxFiles + ' файлов');
      return false;
    }

    let totalSize = 0;
    for (const file of attachmentFiles) {
      if (!isAllowedFile(file)) {
        showAttachmentError('Формат файла «' + file.name + '» не поддерживается');
        return false;
      }
      if (file.size > FILE_CONFIG.maxFileSize) {
        showAttachmentError('Файл «' + file.name + '» больше 25 МБ');
        return false;
      }
      totalSize += file.size;
    }

    if (totalSize > FILE_CONFIG.maxTotalSize) {
      showAttachmentError('Общий размер файлов не должен превышать 100 МБ');
      return false;
    }

    showAttachmentError('');
    return true;
  }

  function addAttachments(fileList) {
    if (!fileList || !fileList.length) return;

    const existing = new Set(attachmentFiles.map((f) => f.name + ':' + f.size + ':' + f.lastModified));
    const incoming = Array.from(fileList);

    incoming.forEach((file) => {
      const key = file.name + ':' + file.size + ':' + file.lastModified;
      if (!existing.has(key)) {
        attachmentFiles.push(file);
        existing.add(key);
      }
    });

    if (attachmentFiles.length > FILE_CONFIG.maxFiles) {
      attachmentFiles = attachmentFiles.slice(0, FILE_CONFIG.maxFiles);
    }

    syncFileInput();
    renderFileList();
    validateAttachments();
  }

  function initAttachments() {
    const input = document.getElementById('attachments');
    const dropzone = document.getElementById('attachments-dropzone');
    const browse = dropzone && dropzone.querySelector('.form-dropzone__browse');
    if (!input || !dropzone) return;

    const openPicker = () => input.click();

    browse && browse.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openPicker();
    });

    dropzone.addEventListener('click', () => openPicker());

    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openPicker();
      }
    });

    input.addEventListener('change', () => {
      addAttachments(input.files);
    });

    ['dragenter', 'dragover'].forEach((type) => {
      dropzone.addEventListener(type, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add('is-dragover');
      });
    });

    ['dragleave', 'drop'].forEach((type) => {
      dropzone.addEventListener(type, (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove('is-dragover');
      });
    });

    dropzone.addEventListener('drop', (e) => {
      addAttachments(e.dataTransfer && e.dataTransfer.files);
    });
  }

  function buildSubmitRequest(payload, webhook) {
    if (!attachmentFiles.length) {
      return {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      };
    }

    const formData = new FormData();
    formData.append('payload', JSON.stringify(payload));
    attachmentFiles.forEach((file) => {
      formData.append('attachments', file, file.name);
    });
    return { headers: { Accept: 'application/json' }, body: formData };
  }

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

  function setFieldValue(id, value) {
    const el = document.getElementById(id);
    if (!el || value == null || value === '') return;
    el.value = value;
    showError(id, '');
    el.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function showPrefillNotice() {
    let notice = document.getElementById('form-prefill-notice');
    if (!notice) {
      notice = document.createElement('p');
      notice.id = 'form-prefill-notice';
      notice.className = 'form-prefill-notice';
      notice.setAttribute('role', 'status');
      const wrapper = document.querySelector('.lead-form-wrapper');
      const form = document.getElementById('lead-form');
      if (wrapper && form) wrapper.insertBefore(notice, form);
    }
    notice.textContent = 'Поля заполнены по ответам в подборе формата. Проверьте данные, укажите город и контакты.';
    notice.hidden = false;
  }

  function hidePrefillNotice() {
    const notice = document.getElementById('form-prefill-notice');
    if (notice) notice.hidden = true;
  }

  window.CIA_APPLY_LEAD_PREFILL = function applyLeadPrefill(prefill) {
    if (!prefill) return;
    setStep(1);
    setFieldValue('serviceType', prefill.serviceType);
    setFieldValue('objectType', prefill.objectType);
    setFieldValue('projectStage', prefill.projectStage);
    setFieldValue('task', prefill.task);
    showPrefillNotice();
    track('diagnose_lead_prefill', {
      serviceType: prefill.serviceType,
      objectType: prefill.objectType,
      projectStage: prefill.projectStage,
    });
    const task = document.getElementById('task');
    if (task) task.focus({ preventScroll: true });
  };

  function setServiceType(value) {
    const select = document.getElementById('serviceType');
    if (!select || !value) return;
    if (select.querySelector('option[value="' + value + '"]')) {
      select.value = value;
      showError('serviceType', '');
    }
  }

  function initLeadServicePrefill() {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get('service');
    if (fromUrl) setServiceType(fromUrl);

    document.querySelectorAll('[data-lead-service]').forEach((link) => {
      link.addEventListener('click', () => {
        setServiceType(link.getAttribute('data-lead-service'));
      });
    });
  }

  function validateStep1() {
    clearErrors(['serviceType', 'objectType', 'city', 'projectStage', 'task']);
    let ok = true;

    const serviceType = document.getElementById('serviceType');
    const objectType = document.getElementById('objectType');
    const city = document.getElementById('city');
    const projectStage = document.getElementById('projectStage');
    const task = document.getElementById('task');

    if (!serviceType || !serviceType.value) {
      showError('serviceType', 'Выберите формат услуги');
      ok = false;
    }
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
    if (!ok) focusFirstInvalid(['serviceType', 'objectType', 'city', 'projectStage', 'task']);
    if (ok && !validateAttachments()) ok = false;
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
      serviceType: get('serviceType'),
      serviceTypeLabel: labels.serviceType[get('serviceType')] || get('serviceType'),
      objectType: get('objectType'),
      objectTypeLabel: labels.objectType[get('objectType')] || get('objectType'),
      city: get('city'),
      area: get('area'),
      projectStage: get('projectStage'),
      projectStageLabel: labels.projectStage[get('projectStage')] || get('projectStage'),
      task: get('task'),
      attachments: getAttachmentsMeta(),
      attachmentCount: attachmentFiles.length,
      diagnosePrefill: window.__CIA_DIAGNOSE_PREFILL || null,
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
      clearAttachments();
      hidePrefillNotice();
      window.__CIA_DIAGNOSE_PREFILL = null;
      setStep(1);
      return;
    }

    const last = Number(sessionStorage.getItem(STORAGE_KEY) || 0);
    if (Date.now() - last < RATE_LIMIT_MS) {
      setStatus('error', 'Пожалуйста, подождите перед повторной отправкой.');
      return;
    }

    if (!validateStep2()) return;
    if (!validateAttachments()) {
      setStep(1);
      return;
    }

    const payload = collectPayload();
    const webhook = (typeof CIA_CONFIG !== 'undefined' && CIA_CONFIG.leadWebhookUrl) || '';

    track('form_submit', {
      objectType: payload.objectType,
      serviceType: payload.serviceType,
      attachmentCount: payload.attachmentCount,
    });

    const submitBtn = document.getElementById('form-submit');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');
    }
    setStatus('info', attachmentFiles.length ? 'Отправляем задачу и файлы…' : 'Отправляем задачу…');

    try {
      if (!webhook) {
        await new Promise((r) => setTimeout(r, 600));
        sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
        const filesNote = attachmentFiles.length
          ? ' Файлов приложено: ' + attachmentFiles.length + '.'
          : '';
        setStatus('success', 'Задача принята (демо-режим: укажите leadWebhookUrl в js/config.js).' + filesNote + ' Мы свяжемся с вами для уточнения исходных данных.');
        track('form_success', { mode: 'demo', attachmentCount: attachmentFiles.length });
        form.reset();
        clearAttachments();
        hidePrefillNotice();
        window.__CIA_DIAGNOSE_PREFILL = null;
        setStep(1);
        return;
      }

      const request = buildSubmitRequest(payload, webhook);
      const res = await fetch(webhook, {
        method: 'POST',
        headers: request.headers,
        body: request.body,
      });

      if (!res.ok) throw new Error('HTTP ' + res.status);

      sessionStorage.setItem(STORAGE_KEY, String(Date.now()));
      const responseTime = (typeof CIA_CONFIG !== 'undefined' && CIA_CONFIG.responseTime) || '';
      const suffix = responseTime && !/^\[/.test(responseTime) ? ' ' + responseTime : '';
      setStatus('success', 'Задача отправлена. Мы свяжемся с вами' + suffix + '.');
      track('form_success', { mode: 'webhook', attachmentCount: attachmentFiles.length });
      form.reset();
      clearAttachments();
      hidePrefillNotice();
      window.__CIA_DIAGNOSE_PREFILL = null;
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
      serviceType: () => {
        const el = document.getElementById('serviceType');
        if (!el || !el.value) {
          showError('serviceType', 'Выберите формат услуги');
          return false;
        }
        showError('serviceType', '');
        return true;
      },
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

    initLeadServicePrefill();
    initAttachments();

    ['serviceType', 'objectType', 'city', 'projectStage', 'task', 'name', 'phone'].forEach((id) => {
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