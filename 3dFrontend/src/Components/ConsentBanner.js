import React, { useState } from 'react';
import { useConsent } from '../context/ConsentContext';
import '../styles/Consent.css';

function ConsentBanner() {
  const { status, acceptAll, rejectAll, openModal } = useConsent();
  const [expanded, setExpanded] = useState(false);

  if (status !== 'unknown') return null;

  return (
    <div className="consent-banner" role="dialog" aria-live="polite" aria-label="Cookie consent">
      <div className="consent-content">
        <p>
          We use cookies to provide essential site functionality and to improve your experience. You can accept all, reject non-essential, or customize. See our
          {' '}<a href="/privacy">Privacy Policy</a> and <a href="/cookies">Cookie Policy</a>.
        </p>
        {expanded && (
          <ul className="consent-summary">
            <li><b>Necessary:</b> Required for core features like cart and checkout.</li>
            <li><b>Functional:</b> Enhancements like remembering preferences.</li>
            <li><b>Analytics:</b> Anonymous usage metrics to improve the site.</li>
            <li><b>Marketing:</b> Personalized offers and ads.</li>
          </ul>
        )}
      </div>
      <div className="consent-actions">
        <button className="btn-link" onClick={() => setExpanded((v) => !v)}>{expanded ? 'Hide details' : 'Learn more'}</button>
        <button className="btn" onClick={acceptAll}>Accept all</button>
        <button className="btn" onClick={rejectAll} aria-label="Reject non-essential cookies">Reject non-essential</button>
        <button className="btn-outline" onClick={openModal}>Customize</button>
      </div>
    </div>
  );
}

export default ConsentBanner;

