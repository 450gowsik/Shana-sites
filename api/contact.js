const { MongoClient } = require('mongodb');
const { Resend } = require('resend');

const mongodbUri = process.env.MONGODB_URI;
const mongodbDbName = process.env.MONGODB_DB || 'gowsik_portfolio';
const mongodbCollectionName = process.env.MONGODB_COLLECTION || 'messages';

if (!mongodbUri) {
  console.error('CRITICAL: MONGODB_URI is required for the contact form.');
}

let cachedMongoClient = null;

async function getMessagesCollection() {
  if (!mongodbUri) {
    throw new Error('MongoDB is not configured.');
  }

  if (!cachedMongoClient) {
    cachedMongoClient = new MongoClient(mongodbUri, {
      serverSelectionTimeoutMS: 8000,
    });
    await cachedMongoClient.connect();
  }

  return cachedMongoClient.db(mongodbDbName).collection(mongodbCollectionName);
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatSubmittedAt(date) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date);
}

function buildContactEmail({ name, email, subject, message, receivedAt }) {
  const displaySubject = subject || 'Not specified';
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeSubject = escapeHtml(displaySubject);
  const safeMessage = escapeHtml(message);
  const submittedAt = formatSubmittedAt(receivedAt);
  const safeSubmittedAt = escapeHtml(submittedAt);
  const replySubject = encodeURIComponent(`Re: ${subject || 'Your portfolio message'}`);
  const mailtoEmail = encodeURIComponent(email);
  const replyHref = `mailto:${mailtoEmail}?subject=${replySubject}`;

  return {
    text: [
      'New portfolio contact form submission',
      '',
      `Name: ${name}`,
      `Email: ${email}`,
      `Subject: ${displaySubject}`,
      `Submitted: ${submittedAt}`,
      '',
      'Message:',
      message,
    ].join('\n'),
    html: `
      <!doctype html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New portfolio contact</title>
        </head>
        <body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:#111827;">
          <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">
            New portfolio contact from ${safeName}
          </div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 12px;">
            <tr>
              <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="width:100%;max-width:640px;background:#ffffff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">
                  <tr>
                    <td style="background:#111827;padding:28px 32px;">
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td>
                            <p style="margin:0 0 6px;font-size:12px;line-height:18px;letter-spacing:0.14em;text-transform:uppercase;color:#93c5fd;font-weight:700;">Portfolio Contact</p>
                            <h1 style="margin:0;font-size:24px;line-height:32px;color:#ffffff;font-weight:700;">New message received</h1>
                          </td>
                          <td align="right" style="vertical-align:top;">
                            <span style="display:inline-block;background:#ffffff;color:#111827;border-radius:999px;padding:7px 12px;font-size:12px;line-height:14px;font-weight:700;">Action needed</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="padding:32px;">
                      <p style="margin:0 0 22px;font-size:15px;line-height:24px;color:#4b5563;">
                        A visitor submitted the contact form on your portfolio. Review the details below and reply directly from this email.
                      </p>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:10px;overflow:hidden;margin-bottom:24px;">
                        <tr>
                          <td style="background:#f9fafb;padding:14px 18px;border-bottom:1px solid #e5e7eb;font-size:13px;line-height:20px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">
                            Sender Details
                          </td>
                        </tr>
                        <tr>
                          <td style="padding:0 18px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td width="120" style="padding:14px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#6b7280;font-weight:700;">Name</td>
                                <td style="padding:14px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#111827;">${safeName}</td>
                              </tr>
                              <tr>
                                <td width="120" style="padding:14px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#6b7280;font-weight:700;">Email</td>
                                <td style="padding:14px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#111827;">
                                  <a href="mailto:${mailtoEmail}" style="color:#2563eb;text-decoration:none;">${safeEmail}</a>
                                </td>
                              </tr>
                              <tr>
                                <td width="120" style="padding:14px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#6b7280;font-weight:700;">Subject</td>
                                <td style="padding:14px 0;border-bottom:1px solid #f1f5f9;font-size:14px;color:#111827;">${safeSubject}</td>
                              </tr>
                              <tr>
                                <td width="120" style="padding:14px 0;font-size:13px;color:#6b7280;font-weight:700;">Submitted</td>
                                <td style="padding:14px 0;font-size:14px;color:#111827;">${safeSubmittedAt}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                        <tr>
                          <td style="padding:0 0 10px;font-size:13px;line-height:20px;color:#6b7280;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">Message</td>
                        </tr>
                        <tr>
                          <td style="background:#f9fafb;border-left:4px solid #2563eb;border-radius:8px;padding:18px 20px;">
                            <p style="margin:0;font-size:15px;line-height:25px;color:#1f2937;white-space:pre-wrap;">${safeMessage}</p>
                          </td>
                        </tr>
                      </table>

                      <table role="presentation" cellpadding="0" cellspacing="0" align="center">
                        <tr>
                          <td style="border-radius:8px;background:#111827;">
                            <a href="${replyHref}" style="display:inline-block;padding:14px 26px;color:#ffffff;font-size:14px;line-height:18px;font-weight:700;text-decoration:none;border-radius:8px;">Reply to ${safeName}</a>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <tr>
                    <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 32px;text-align:center;">
                      <p style="margin:0;font-size:12px;line-height:18px;color:#6b7280;">Gowsik P Portfolio Contact System</p>
                      <p style="margin:4px 0 0;font-size:11px;line-height:16px;color:#9ca3af;">This notification was generated automatically from gowsik-website.vercel.app.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `,
  };
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const name = String(req.body?.name || '').trim();
  const email = String(req.body?.email || '').trim();
  const subject = String(req.body?.subject || '').trim();
  const message = String(req.body?.message || '').trim();

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const receivedAt = new Date();
    const messages = await getMessagesCollection();
    await messages.insertOne({
      name,
      email,
      subject,
      message,
      receivedAt,
      source: 'portfolio-contact-form',
      createdAt: receivedAt,
    });

    try {
      if (process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const contactEmail = buildContactEmail({
          name,
          email,
          subject,
          message,
          receivedAt,
        });

        await resend.emails.send({
          from: 'Gowsik Portfolio <onboarding@resend.dev>',
          to: process.env.CONTACT_EMAIL_TO || 'gowsikbabubabu@gmail.com',
          reply_to: email,
          subject: `New portfolio contact: ${subject || 'No subject'}`,
          html: contactEmail.html,
          text: contactEmail.text,
        });
      }
    } catch (emailError) {
      console.error('Email notification failed:', emailError);
    }

    return res.status(200).json({ ok: true, message: 'Message sent successfully' });
  } catch (err) {
    console.error('Failed to save contact message:', err);
    const errorMessage = String(err?.message || '');
    const setupIssue =
      !mongodbUri ||
      errorMessage.includes('bad auth') ||
      errorMessage.includes('Authentication failed') ||
      errorMessage.includes('querySrv') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('Server selection timed out') ||
      errorMessage.includes('MongoDB is not configured');

    return res.status(500).json({
      error: setupIssue
        ? 'Contact database is not configured correctly.'
        : 'Could not send message.',
    });
  }
};
