import React, { useEffect, useState } from 'react';
import { X, Send } from 'lucide-react';
import '../styles/InquiryModal.css';
import { CONTACT_EMAIL } from '../config/showcase';

const DEFAULT_EMAIL = CONTACT_EMAIL;

function buildPrefillMessage(product) {
  if (product && product.name) {
    return `Hi! I'm interested in ${product.name}. Could you send me pricing and lead time details?`;
  }
  return 'Hi! I would love to learn more about your custom figures and availability.';
}

function InquiryModal({
  open,
  onClose,
  product,
  defaultEmail = DEFAULT_EMAIL,
  title = 'Request a quote',
}) {
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!open) {
      setName('');
      setContact('');
      setMessage('');
      return;
    }
    setMessage(buildPrefillMessage(product));
  }, [open, product]);

  const closeModal = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  const submitInquiry = (event) => {
    event?.preventDefault();
    const subject = `Quote for ${product?.name || 'Custom Card Box'}`;
    const body = `Name: ${name || '(not provided)'}\nContact: ${
      contact || '(not provided)'
    }\n\n${message || ''}`;
    window.location.href = `mailto:${defaultEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    closeModal();
  };

  if (!open) return null;

  return (
    <div className="inquiry-modal" role="dialog" aria-modal="true">
      <div className="inquiry-modal__backdrop" onClick={closeModal} />
      <div className="inquiry-modal__dialog">
        <header className="inquiry-modal__header">
          <div>
            <span className="inquiry-modal__eyebrow">Studio Inquiry</span>
            <h3>{title}</h3>
            {product?.name && (
              <p className="inquiry-modal__subtitle">
                {product.name}
              </p>
            )}
          </div>
          <button
            type="button"
            className="inquiry-modal__close"
            onClick={closeModal}
            aria-label="Close inquiry form"
          >
            <X className="w-5 h-5" />
          </button>
        </header>
        <form className="inquiry-modal__form" onSubmit={submitInquiry}>
          <label className="inquiry-modal__field">
            <span>Name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </label>
          <label className="inquiry-modal__field">
            <span>Contact (email or IG)</span>
            <input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="@username or email"
            />
          </label>
          <label className="inquiry-modal__field">
            <span>Message</span>
            <textarea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </label>
          <button type="submit" className="inquiry-modal__submit">
            <span>Send inquiry</span>
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

export default InquiryModal;
