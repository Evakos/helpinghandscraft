// Adds a newsletter sign-up to Resend as a contact. Needs RESEND_API_KEY in the Vercel project's environment.
// RESEND_SEGMENT_ID is optional: when set, the contact is also added to that segment.
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const email = String(req.body?.email || '').trim().toLowerCase();
  const name = String(req.body?.name || '').trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: 'Please enter a valid email address.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'Sign-ups are not available right now. Please try again later.' });
  }

  try {
    const payload = { email, unsubscribed: false };
    if (name) payload.first_name = name;
    if (process.env.RESEND_SEGMENT_ID) payload.segments = [{ id: process.env.RESEND_SEGMENT_ID }];

    const response = await fetch('https://api.resend.com/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      // Someone signing up twice is fine.
      if (response.status === 409 || /already exists/i.test(data.message || '')) {
        return res.status(200).json({ success: true });
      }
      console.error('Resend contact error:', response.status, data.message);
      return res.status(502).json({ message: 'Something went wrong. Please try again.' });
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Subscribe error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}
