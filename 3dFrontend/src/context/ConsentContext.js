// Lightweight cookie consent context compliant with GDPR/CCPA
// Stores preferences in localStorage and exposes helpers to gate features

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const STORAGE_KEY = 'cookieConsent.v1';

const defaultPreferences = {
  necessary: true, // always on
  functional: false,
  analytics: false,
  marketing: false,
};

const ConsentContext = createContext(null);

export function ConsentProvider({ children }) {
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [status, setStatus] = useState('unknown'); // 'unknown' | 'accepted' | 'rejected' | 'custom'
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.preferences) {
          setPreferences({ ...defaultPreferences, ...parsed.preferences, necessary: true });
          setStatus(parsed.status || 'custom');
        }
      }
    } catch (_) {
      // ignore
    }
  }, []);

  const persist = (prefs, newStatus) => {
    const record = {
      version: 1,
      updatedAt: new Date().toISOString(),
      status: newStatus,
      preferences: prefs,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  };

  const acceptAll = () => {
    const next = { ...defaultPreferences, functional: true, analytics: true, marketing: true };
    setPreferences(next);
    setStatus('accepted');
    persist(next, 'accepted');
  };

  const rejectAll = () => {
    const next = { ...defaultPreferences, functional: false, analytics: false, marketing: false };
    setPreferences(next);
    setStatus('rejected');
    persist(next, 'rejected');
  };

  const saveCustom = (customPrefs) => {
    const next = { ...defaultPreferences, ...customPrefs, necessary: true };
    setPreferences(next);
    setStatus('custom');
    persist(next, 'custom');
  };

  const allow = (category) => !!preferences[category];

  const value = useMemo(() => ({
    preferences,
    status,
    allow,
    acceptAll,
    rejectAll,
    saveCustom,
    modalOpen,
    openModal: () => setModalOpen(true),
    closeModal: () => setModalOpen(false),
  }), [preferences, status, modalOpen]);

  return (
    <ConsentContext.Provider value={value}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
}

