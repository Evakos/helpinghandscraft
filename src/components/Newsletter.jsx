import { useState } from 'react';
import './Newsletter.css';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) return;
    
    setStatus('loading');
    setMessage('');
    
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Something went wrong');
      setStatus('success');
      setMessage('Thank you for subscribing! Check your inbox for a confirmation email.');
      setEmail('');
      setName('');
    } catch (error) {
      setStatus('error');
      const errorMsg = error.message || 'Something went wrong. Please try again.';
      setMessage(errorMsg);
    }
  };

  return (
    <section className="newsletter-section" id="newsletter">
      <div className="newsletter-container">
        <div className="newsletter-content">
          <p className="newsletter-label">Stay in Touch</p>
          <div className="newsletter-divider" />
          <h2 className="newsletter-title">Join Our Newsletter</h2>
          <p className="newsletter-description">
            Be the first to know about new arrivals, exclusive offers, and craft inspiration delivered straight to your inbox.
          </p>
          
          <form className="newsletter-form" onSubmit={handleSubmit}>
            <div className="newsletter-inputs">
              <input
                type="text"
                placeholder="Your name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="newsletter-input newsletter-input--name"
                disabled={status === 'loading'}
              />
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="newsletter-input newsletter-input--email"
                required
                disabled={status === 'loading'}
              />
            </div>
            <button
              type="submit"
              className="newsletter-btn"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
            </button>
          </form>
          
          {message && (
            <p className={`newsletter-message newsletter-message--${status}`}>
              {message}
            </p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
