const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');

// Initialize Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL: SUPABASE_URL or SUPABASE_ANON_KEY is missing from environment variables.");
}

const supabase = createClient(supabaseUrl || '', supabaseKey || '');

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const { data, error } = await supabase
      .from('messages')
      .insert([
        { 
          name, 
          email, 
          subject, 
          message, 
          received_at: new Date().toISOString() 
        }
      ]);

    if (error) throw error;

    // Send Email Notification
    try {
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Portfolio Contact <onboarding@resend.dev>',
          to: 'gowsikbabubabu@gmail.com',
          subject: `New Message: ${subject || 'No Subject'}`,
          html: `
            <h3>New Portfolio Message</h3>
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject || 'N/A'}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <hr />
            <p><small>Sent at: ${new Date().toLocaleString()}</small></p>
          `
        });
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
      // We don't return 500 here because the message was already saved to Supabase
    }

    return res.status(200).json({ ok: true, message: 'Message sent successfully' });
  } catch (err) {
    console.error('Failed to save to Supabase:', err);
    return res.status(500).json({ error: 'Could not send message.' });
  }
};
