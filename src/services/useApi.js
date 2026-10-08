import { useEffect, useState } from "react"

export function useApi(path, {refreshMs} = {}){
    const [state, setState] = useState({data: null, loading: true, error: null})

    useEffect(()=> {
        const ctrl = new AbortController()
        const load = () =>
            fetch(path, {signal: ctrl.signal}).then((r) =>{
                // #region agent log
                fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'pre-fix',hypothesisId:'B',location:'useApi.js:load',message:'api response',data:{path,ok:r.ok,status:r.status},timestamp:Date.now()})}).catch(()=>{});
                // #endregion
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                    return r.json()
            }).then((data) => setState({data, loading: false, error:null})).catch((error) => {
                // #region agent log
                fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'pre-fix',hypothesisId:'B',location:'useApi.js:load',message:'api fetch failed',data:{path,name:error?.name,error:String(error?.message||error)},timestamp:Date.now()})}).catch(()=>{});
                // #endregion
                if(error.name !== 'AbortError') setState((s) => ({...s, loading: false, error}))
            })
        load()
        const id= refreshMs ? setInterval(load, refreshMs) : null
        return () => {
            ctrl.abort()
            if (id) clearInterval(id)
        }
    }, [path, refreshMs])
    return state
}