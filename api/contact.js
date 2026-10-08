/**
 * Serverless Contact Endpoint for Resend Email Integration
 * Handles:
 * - Request validation (name, email, message length & format)
 * - Anti-spam Honeypot detection
 * - In-memory IP rate limiting
 * - Secure Resend email delivery to pradeepbalamurugan22@gmail.com
 * - Clean JSON response without exposing API keys or stack traces
 */

// Load local environment variables if available
try {
  require('dotenv').config();
} catch (_) {
  // dotenv is optional in production serverless runtimes
}

const { Resend } = require('resend');

const RECIPIENT_EMAIL = 'pradeepbalamurugan22@gmail.com';
const FROM_EMAIL_DEFAULT = 'Portfolio Contact <onboarding@resend.dev>';

// In-memory rate limiting map
const ipRateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS_PER_WINDOW = 5;

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipRateLimitMap.entries()) {
    if (now - entry.startTime > RATE_LIMIT_WINDOW_MS) {
      ipRateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref?.();

function isRateLimited(ip) {
  if (!ip) return false;
  const clientIp = String(ip).split(',')[0].trim();
  const now = Date.now();
  const entry = ipRateLimitMap.get(clientIp);

  if (!entry || now - entry.startTime > RATE_LIMIT_WINDOW_MS) {
    ipRateLimitMap.set(clientIp, { startTime: now, count: 1 });
    return false;
  }

  entry.count++;
  return entry.count > MAX_REQUESTS_PER_WINDOW;
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function validateInput(body) {
  if (!body || typeof body !== 'object') {
    return { valid: false, message: 'Invalid request body.' };
  }

  // Honeypot check
  if (body._gotcha || body.honeypot) {
    return { valid: false, isSpam: true, message: 'Spam submission rejected.' };
  }

  const { name, email, message } = body;

  // Name validation
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { valid: false, message: 'Please enter your name.' };
  }
  const cleanName = name.trim();
  if (cleanName.length < 2 || cleanName.length > 100) {
    return { valid: false, message: 'Name must be between 2 and 100 characters.' };
  }

  // Email validation
  if (!email || typeof email !== 'string' || !email.trim()) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }
  const cleanEmail = email.trim();
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
  if (cleanEmail.length > 254 || !emailRegex.test(cleanEmail)) {
    return { valid: false, message: 'Please enter a valid email address.' };
  }

  // Message validation
  if (!message || typeof message !== 'string' || !message.trim()) {
    return { valid: false, message: 'Please enter a message.' };
  }
  const cleanMessage = message.trim();
  if (cleanMessage.length < 10 || cleanMessage.length > 5000) {
    return { valid: false, message: 'Message must be between 10 and 5000 characters.' };
  }

  return {
    valid: true,
    data: {
      name: cleanName,
      email: cleanEmail,
      message: cleanMessage
    }
  };
}

async function processContactSubmission({ body, ip }) {
  // Check rate limit
  if (isRateLimited(ip)) {
    return {
      statusCode: 429,
      body: {
        success: false,
        message: 'Too many requests. Please wait a few minutes before trying again.'
      }
    };
  }

  // Validate inputs
  const validation = validateInput(body);
  if (!validation.valid) {
    // If caught by honeypot, return a benign 400 without notifying bots
    if (validation.isSpam) {
      return {
        statusCode: 400,
        body: { success: false, message: 'Invalid submission.' }
      };
    }
    return {
      statusCode: 400,
      body: { success: false, message: validation.message }
    };
  }

  const { name, email, message } = validation.data;

  // Retrieve Resend API Key from server environment
  const apiKey = process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.trim() : '';
  if (!apiKey) {
    console.error('[Portfolio Contact Error] RESEND_API_KEY is not configured in the environment.');
    return {
      statusCode: 500,
      body: {
        success: false,
        message: 'Sorry, your message could not be sent. Please try again.'
      }
    };
  }

  try {
    const resend = new Resend(apiKey);
    const fromAddress = process.env.RESEND_FROM_EMAIL || FROM_EMAIL_DEFAULT;
    const subject = `New Portfolio Contact — ${name}`;

    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');

    const textContent = `New Portfolio Contact Message
----------------------------------------
From: ${name}
Email: ${email}
Date: ${new Date().toUTCString()}

Message:
${message}

----------------------------------------
Reply directly to this email to respond to ${name} (${email}).`;

    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b1120; color: #f8fafc; padding: 24px; margin: 0;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #0f172a; border: 1px solid #1e293b; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #0284c7; padding: 18px 24px;">
      <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 600;">// New Portfolio Contact Message</h2>
    </div>
    <div style="padding: 24px;">
      <div style="margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #1e293b;">
        <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Sender Details</p>
        <p style="margin: 0 0 6px 0; font-size: 15px;"><strong style="color: #38bdf8;">Name:</strong> ${safeName}</p>
        <p style="margin: 0; font-size: 15px;"><strong style="color: #38bdf8;">Email:</strong> <a href="mailto:${safeEmail}" style="color: #38bdf8; text-decoration: underline;">${safeEmail}</a></p>
      </div>
      <div style="margin-bottom: 20px;">
        <p style="margin: 0 0 8px 0; color: #94a3b8; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message</p>
        <div style="background-color: #0b1120; border: 1px solid #1e293b; border-radius: 6px; padding: 16px; color: #e2e8f0; font-size: 14px; line-height: 1.6;">
          ${safeMessage}
        </div>
      </div>
      <div style="font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 16px;">
        <p style="margin: 0;">Inquiry received via portfolio contact form. Reply directly to this email to reach <strong>${safeName}</strong> at <strong>${safeEmail}</strong>.</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to: [RECIPIENT_EMAIL],
      replyTo: email,
      subject: subject,
      text: textContent,
      html: htmlContent
    });

    if (error) {
      console.error('[Resend Delivery Error]', error);
      return {
        statusCode: 500,
        body: {
          success: false,
          message: 'Sorry, your message could not be sent. Please try again.'
        }
      };
    }

    return {
      statusCode: 200,
      body: {
        success: true,
        message: 'Thanks! Your message has been sent successfully.',
        id: data?.id
      }
    };
  } catch (err) {
    console.error('[Contact Handler Exception]', err?.message || err);
    return {
      statusCode: 500,
      body: {
        success: false,
        message: 'Sorry, your message could not be sent. Please try again.'
      }
    };
  }
}

function readStream(stream) {
  return new Promise((resolve, reject) => {
    let data = '';
    stream.on('data', chunk => {
      data += chunk;
      // Protect against body size abuse (>100KB)
      if (data.length > 1e5) {
        stream.destroy();
        reject(new Error('Payload too large'));
      }
    });
    stream.on('end', () => resolve(data));
    stream.on('error', reject);
  });
}

// --------------------------------------------------------------------------
// Standard Node / Vercel Serverless Export: handler(req, res)
// --------------------------------------------------------------------------
async function nodeHandler(req, res) {
  // CORS support
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: false, message: 'Method Not Allowed' }));
    return;
  }

  let body = req.body;
  if (!body || typeof body !== 'object') {
    try {
      const raw = await readStream(req);
      body = raw ? JSON.parse(raw) : {};
    } catch (_) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ success: false, message: 'Invalid JSON payload.' }));
      return;
    }
  }

  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress;
  const result = await processContactSubmission({ body, ip });

  res.statusCode = result.statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(result.body));
}

// --------------------------------------------------------------------------
// Netlify Functions Export: handler(event, context)
// --------------------------------------------------------------------------
async function netlifyHandler(event) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: 'Method Not Allowed' })
    };
  }

  let body = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (_) {
    return {
      statusCode: 400,
      headers,
      body: JSON.stringify({ success: false, message: 'Invalid JSON payload.' })
    };
  }

  const ip = event.headers['client-ip'] || event.headers['x-forwarded-for'];
  const result = await processContactSubmission({ body, ip });

  return {
    statusCode: result.statusCode,
    headers,
    body: JSON.stringify(result.body)
  };
}

module.exports = nodeHandler;
module.exports.handler = netlifyHandler;
module.exports.netlifyHandler = netlifyHandler;
module.exports.processContactSubmission = processContactSubmission;
