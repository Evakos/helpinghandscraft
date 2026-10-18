import { useState } from 'react';
import './ComingSoon.css';

const ComingSoon = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) return;

    setStatus('loading');
    setMessage('');

    try {
      const payload = { email: trimmedEmail };
      const trimmedName = name.trim();
      if (trimmedName) payload.name = trimmedName;

      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      setStatus('success');
      setMessage("Thank you! We'll be in touch soon.");
      setEmail('');
      setName('');
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <div className="coming-soon">
      <div className="coming-soon__container">
        <div className="coming-soon__logo">
          <img src="/logo.svg" alt="Helping Hands Craft" />
        </div>

        <p className="coming-soon__tagline">Curated Craft Supplies</p>
        <h1 className="coming-soon__title">We're Back Soon, Loyal Customers</h1>
        <div className="coming-soon__divider" />
        <p className="coming-soon__subtitle">
          We're taking a little time to refresh and restock. Leave your email below and we'll let you know the moment we're back.
        </p>

        <form className="coming-soon__form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name (optional)"
            disabled={status === 'loading'}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            required
            disabled={status === 'loading'}
          />
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Subscribing...' : 'Notify Me'}
          </button>
        </form>

        {message && (
          <p className={`coming-soon__message coming-soon__message--${status}`}>{message}</p>
        )}

        <p className="coming-soon__footer">✦ Handcrafted with love ✦</p>
      </div>
    </div>
  );
};

export default ComingSoon;
