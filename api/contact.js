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
          subject: `📩 New Message: ${subject || 'No Subject'}`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin:0;padding:0;background:#f4f4f7;font-family:'Segoe UI',Arial,sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f7;padding:40px 0;">
                <tr>
                  <td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                      <!-- HEADER -->
                      <tr>
                        <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);padding:32px 40px;text-align:center;">
                          <h1 style="color:#ffffff;margin:0;font-size:22px;font-weight:700;letter-spacing:0.5px;">
                            Gowsik P — Portfolio
                          </h1>
                          <p style="color:rgba(255,255,255,0.7);margin:6px 0 0;font-size:13px;">
                            New contact form submission
                          </p>
                        </td>
                      </tr>

                      <!-- BODY -->
                      <tr>
                        <td style="padding:36px 40px;">
                          <h2 style="color:#1a1a2e;margin:0 0 8px;font-size:20px;">
                            New message from ${name} 🎉
                          </h2>
                          <p style="color:#666;font-size:14px;line-height:1.6;margin:0 0 28px;">
                            Someone just reached out through your portfolio website. Here are the details:
                          </p>

                          <!-- INFO BOX -->
                          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f9fb;border-radius:10px;border:1px solid #e8ebf0;margin-bottom:24px;">
                            <tr>
                              <td style="padding:20px 24px;">
                                <p style="margin:0 0 12px;font-size:14px;color:#333;">
                                  <strong style="color:#0f3460;">👤 Name:</strong> ${name}
                                </p>
                                <p style="margin:0 0 12px;font-size:14px;color:#333;">
                                  <strong style="color:#0f3460;">📧 Email:</strong>
                                  <a href="mailto:${email}" style="color:#0f3460;text-decoration:none;">${email}</a>
                                </p>
                                <p style="margin:0 0 12px;font-size:14px;color:#333;">
                                  <strong style="color:#0f3460;">📋 Subject:</strong> ${subject || 'Not specified'}
                                </p>
                                <p style="margin:0;font-size:14px;color:#333;">
                                  <strong style="color:#0f3460;">💬 Message:</strong>
                                </p>
                              </td>
                            </tr>
                          </table>

                          <!-- MESSAGE -->
                          <div style="background:#ffffff;border-left:4px solid #0f3460;padding:16px 20px;border-radius:0 8px 8px 0;margin-bottom:28px;">
                            <p style="color:#444;font-size:15px;line-height:1.7;margin:0;white-space:pre-wrap;">${message}</p>
                          </div>

                          <!-- CTA BUTTON -->
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td align="center">
                                <a href="mailto:${email}?subject=Re: ${subject || 'Your message'}"
                                   style="display:inline-block;background:linear-gradient(135deg,#0f3460,#1a1a2e);color:#fff;text-decoration:none;padding:14px 36px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                                  Reply to ${name}
                                </a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>

                      <!-- FOOTER -->
                      <tr>
                        <td style="background:#f8f9fb;padding:20px 40px;text-align:center;border-top:1px solid #e8ebf0;">
                          <p style="color:#999;font-size:12px;margin:0;">
                            © 2026 Gowsik P · Full Stack & Cloud Engineer · Chennai, India
                          </p>
                          <p style="color:#bbb;font-size:11px;margin:6px 0 0;">
                            Sent at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
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
