export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, name } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const apiKey = process.env.VITE_MAILERLITE_API_KEY;
  const groupId = process.env.VITE_MAILERLITE_GROUP_ID;

  if (!apiKey) {
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    const payload = {
      email,
      groups: groupId ? [groupId] : [],
    };

    if (name) {
      payload.fields = { name };
    }

    const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data.message || data.detail || 'Failed to subscribe',
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('MailerLite subscribe error:', error);
    return res.status(500).json({ message: 'Something went wrong. Please try again.' });
  }
}
