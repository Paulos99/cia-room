(function () {
  'use strict';

  const STATE_KEY = 'cia_diagnose_state';
  const PREFILL_KEY = 'cia_diagnose_prefill';
  const MAX_AGE_MS = 24 * 60 * 60 * 1000;

  function readJson(key) {
    try {
      const raw = sessionStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function writeJson(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* ignore */ }
  }

  function isFresh(updatedAt) {
    if (!updatedAt) return false;
    return Date.now() - updatedAt < MAX_AGE_MS;
  }

  window.CIA_DIAGNOSE_STORAGE = {
    saveState(state) {
      writeJson(STATE_KEY, { ...state, updatedAt: Date.now() });
    },
    loadState(pageKey) {
      const data = readJson(STATE_KEY);
      if (!data || !isFresh(data.updatedAt)) return null;
      if (pageKey && data.pageKey && data.pageKey !== pageKey) return null;
      return data;
    },
    savePrefill(prefill) {
      writeJson(PREFILL_KEY, { ...prefill, updatedAt: Date.now() });
      window.__CIA_DIAGNOSE_PREFILL = prefill;
    },
    loadPrefill() {
      const data = readJson(PREFILL_KEY);
      if (!data || !isFresh(data.updatedAt)) return null;
      const { updatedAt, ...prefill } = data;
      return prefill;
    },
    clear() {
      try {
        sessionStorage.removeItem(STATE_KEY);
        sessionStorage.removeItem(PREFILL_KEY);
      } catch (e) { /* ignore */ }
    },
  };
})();
