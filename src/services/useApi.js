import { useEffect, useState } from "react"

export function useApi(path, {refreshMs} = {}){
    const [state, setState] = useState({data: null, loading: true, error: null})

    useEffect(()=> {
        const ctrl = new AbortController()
        const load = () =>
            fetch(path, {signal: ctrl.signal}).then((r) =>{
                if (!r.ok) throw new Error(`HTTP ${r.status}`)
                    return r.json()
            }).then((data) => setState({data, loading: false, error:null})).catch((error) => {
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