import nodemailer from 'nodemailer';
import { handleBrokerExecution } from './brokerAdapter.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    let payload = req.body;
    if (typeof payload === 'string') {
      try { payload = JSON.parse(payload); } catch(e) { /* keep raw */ }
    }
    console.log('Received webhook:', payload);

    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || null;
    if (WEBHOOK_SECRET) {
      const sig = req.headers['x-webhook-secret'] || req.query.secret;
      if (sig !== WEBHOOK_SECRET) {
        console.warn('Invalid webhook secret');
        return res.status(401).json({ error: 'invalid secret' });
      }
    }

    // Send email notification if configured
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS && process.env.EMAIL_TO) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });
        const subject = `TradingView Alert: ${payload.event || 'unknown'}`;
        const text = `Payload:\n\n${JSON.stringify(payload,null,2)}\n\nTime: ${new Date().toISOString()}`;
        await transporter.sendMail({ from: process.env.EMAIL_USER, to: process.env.EMAIL_TO, subject, text });
      } catch (e) {
        console.warn('Email failed', e);
      }
    }

    const LIVE = (process.env.LIVE_TRADING === 'true');

    await handleBrokerExecution(payload, { live: LIVE });

    return res.status(200).json({ ok:true, received: payload });
  } catch (err) {
    console.error('Webhook handler error', err);
    return res.status(500).json({ error: 'internal error' });
  }
}
