import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles.css';

export default function App() {
  const [log, setLog] = useState([]);
  const [p0, setP0] = useState(null);
  const [levels, setLevels] = useState(null);
  const [status, setStatus] = useState('Idle');
  const [live, setLive] = useState(false);

  const pushLog = (msg) => setLog(l => [ `${new Date().toLocaleString()} — ${msg}`, ...l].slice(0,300));

  const computeLevels = (p0price) => {
    const pip = 0.0001;
    const p1 = 6 * pip, p2 = 13 * pip, p3 = 25 * pip, p4 = 36 * pip;
    return {
      p0: p0price,
      p1_long: +(p0price + p1).toFixed(5),
      p1_short: +(p0price - p1).toFixed(5),
      p2: +(p0price + p2).toFixed(5),
      p2_low: +(p0price - p2).toFixed(5),
      p3: +(p0price + p3).toFixed(5),
      p3_low: +(p0price - p3).toFixed(5),
      p4: +(p0price + p4).toFixed(5),
      p4_low: +(p0price - p4).toFixed(5),
    };
  };

  const onSetP0 = () => {
    const val = prompt('Enter P0 (midnight open price) e.g. 1.09123');
    if (!val) return;
    const p0v = parseFloat(val);
    setP0(p0v);
    setLevels(computeLevels(p0v));
    pushLog(`P0 set to ${p0v}`);
  };

  const sendTestAlert = async (eventType) => {
    setStatus('Sending test alert...');
    try {
      const payload = { event: eventType, symbol: 'EURUSD', price: p0 || 0, meta:{ from: 'dashboard' } };
      const res = await axios.post('/api/tradingview-webhook', payload);
      pushLog(`Test alert sent: ${eventType} -> ${res.data.ok ? 'ok' : JSON.stringify(res.data)}`);
    } catch (err) {
      pushLog('Error sending test alert: ' + (err?.message || err));
    } finally {
      setStatus('Idle');
    }
  };

  useEffect(()=>{
    // initial log
    pushLog('Dashboard loaded');
  },[]);

  return (
    <div style={{ padding:20, fontFamily:'system-ui' }}>
      <h1>Midnight Ladder AI — Dashboard</h1>
      <div style={{ marginBottom:12 }}>
        <button onClick={onSetP0}>Set P0 (midnight open)</button>
        <button onClick={() => sendTestAlert('P1_BUY_FILLED')} style={{ marginLeft:10 }}>Send test P1 Buy</button>
        <button onClick={() => sendTestAlert('P1_SELL_FILLED')} style={{ marginLeft:10 }}>Send test P1 Sell</button>
        <label style={{ marginLeft: 20 }}>
          <input type="checkbox" checked={live} onChange={(e)=>setLive(e.target.checked)} /> Enable live trading
        </label>
      </div>

      <div style={{ display:'flex', gap:20 }}>
        <div style={{ flex:1 }}>
          <h3>Levels</h3>
          <pre>{levels ? JSON.stringify(levels, null, 2) : 'P0 not set'}</pre>
        </div>

        <div style={{ flex:1 }}>
          <h3>Event Log</h3>
          <div style={{ height:300, overflow:'auto', background:'#fafafa', padding:10 }}>
            {log.map((l,i) => <div key={i} style={{ padding:6, borderBottom:'1px solid #eee' }}>{l}</div>)}
          </div>
        </div>
      </div>

      <div style={{ marginTop:12 }}>
        <strong>Status:</strong> {status}
      </div>
    </div>
  );
}
