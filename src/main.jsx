import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// #region agent log
const agentLog = (hypothesisId, location, message, data) => fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'pre-fix',hypothesisId,location,message,data,timestamp:Date.now()})}).catch(()=>{});
// #endregion

async function boot() {
  // #region agent log
  try {
    const slim = await import('@tsparticles/slim')
    agentLog('A', 'main.jsx:boot', 'slim module loaded', {hasInitParticlesEngine: 'initParticlesEngine' in slim, hasLoadSlim: 'loadSlim' in slim})
  } catch (error) {
    agentLog('A', 'main.jsx:boot', 'slim import failed', {error: String(error?.message || error)})
  }
  // #endregion
  try {
    const { default: App } = await import('./App.jsx')
    // #region agent log
    agentLog('A', 'main.jsx:boot', 'App imported', {ok: true})
    // #endregion
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
    // #region agent log
    setTimeout(() => {
      agentLog('F', 'main.jsx:paint', 'after paint', {textLen: document.body?.innerText?.length ?? null, textSample: (document.body?.innerText || '').slice(0, 160), bodyChildren: document.body?.childElementCount ?? null})
    }, 1500)
    // #endregion
  } catch (error) {
    // #region agent log
    agentLog('A', 'main.jsx:boot', 'App import failed', {error: String(error?.message || error)})
    // #endregion
  }
}

boot()
