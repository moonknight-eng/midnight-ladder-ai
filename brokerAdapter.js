/*
Broker Adapter - simulation + OANDA skeleton
Put live keys in env vars only when you are ready.
*/

import axios from 'axios';

// In-memory simulation store (demo). Use a DB for production.
let simulatedAccount = {
  trades: [],
  balance: 10000
};

export async function handleBrokerExecution(payload, opts = { live:false }) {
  const { live } = opts;
  const event = (payload.event || '').toString().toUpperCase();

  if (!live) {
    const trade = {
      id: Date.now(),
      event,
      symbol: payload.symbol || 'EURUSD',
      price: payload.price || null,
      ts: new Date().toISOString(),
      meta: payload.meta || null
    };
    simulatedAccount.trades.push(trade);
    console.log('[SIM] Trade simulated:', trade);
    return trade;
  }

  const BROKER = process.env.BROKER || 'OANDA';
  if (BROKER === 'OANDA') {
    const token = process.env.OANDA_API_KEY;
    const accountId = process.env.OANDA_ACCOUNT;
    if (!token || !accountId) throw new Error('OANDA keys not configured');

    // Example skeleton: adapt order fields per OANDA docs
    const orderBody = {
      order: {
        instrument: payload.symbol || 'EUR_USD',
        units: payload.side === 'BUY' ? '100' : '-100',
        type: 'MARKET'
      }
    };
    try {
      const resp = await axios.post(`https://api-fxpractice.oanda.com/v3/accounts/${accountId}/orders`, orderBody, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('[LIVE] OANDA response', resp.data);
      return resp.data;
    } catch (err) {
      console.error('[LIVE] OANDA error', err.response ? err.response.data : err.message);
      throw err;
    }
  }

  console.log('Broker adapter reached default branch');
  return null;
}
