import React, { useState, useEffect } from 'react';
import { useConsent } from '../context/ConsentContext';
import '../styles/Consent.css';

function ConsentModal() {
  const { modalOpen, closeModal, preferences, saveCustom, acceptAll, rejectAll } = useConsent();
  const [local, setLocal] = useState(preferences);

  useEffect(() => setLocal(preferences), [preferences, modalOpen]);

  if (!modalOpen) return null;

  const toggle = (key) => setLocal((p) => ({ ...p, [key]: !p[key] }));

  const onSave = () => {
    saveCustom({
      functional: !!local.functional,
      analytics: !!local.analytics,
      marketing: !!local.marketing,
    });
    closeModal();
  };

  return (
    <div className="consent-modal-backdrop" role="dialog" aria-modal="true" aria-label="Privacy preferences">
      <div className="consent-modal">
        <h3>Privacy preferences</h3>
        <p>Manage how we use cookies and similar technologies.</p>
        <div className="consent-group">
          <label className="disabled">
            <input type="checkbox" checked readOnly /> Necessary (always on)
          </label>
          <small>Core features like navigation, security, and checkout.</small>
        </div>
        <div className="consent-group">
          <label>
            <input type="checkbox" checked={!!local.functional} onChange={() => toggle('functional')} /> Functional
          </label>
          <small>Preferences like language, saved carts, and improvements.</small>
        </div>
        <div className="consent-group">
          <label>
            <input type="checkbox" checked={!!local.analytics} onChange={() => toggle('analytics')} /> Analytics
          </label>
          <small>Anonymous usage analytics to help us improve.</small>
        </div>
        <div className="consent-group">
          <label>
            <input type="checkbox" checked={!!local.marketing} onChange={() => toggle('marketing')} /> Marketing
          </label>
          <small>Personalized offers, remarketing, and ads.</small>
        </div>

        <div className="consent-modal-actions">
          <button className="btn" onClick={acceptAll}>Accept all</button>
          <button className="btn" onClick={rejectAll}>Reject non-essential</button>
          <button className="btn-primary" onClick={onSave}>Save preferences</button>
          <button className="btn-link" onClick={closeModal}>Close</button>
        </div>
        <div className="consent-legal">
          See our <a href="/privacy">Privacy Policy</a> and <a href="/cookies">Cookie Policy</a> for details.
        </div>
      </div>
    </div>
  );
}

export default ConsentModal;

