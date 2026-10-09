import { useEffect, useState } from "react"

export function useApi(path, { refreshMs, enabled = true, headers } = {}) {
    const headerKey = headers ? JSON.stringify(headers) : ''
    const [state, setState] = useState({ data: null, loading: true, error: null })

    useEffect(() => {
        if (!enabled) return
        const ctrl = new AbortController()
        const load = () =>
            fetch(path, { signal: ctrl.signal, headers })
                .then((r) => {
                    if (!r.ok) throw Object.assign(new Error(`HTTP ${r.status}`), { status: r.status })
                    return r.json()
                })
                .then((data) => setState({ data, loading: false, error: null }))
                .catch((error) => {
                    if (error.name !== 'AbortError') setState((s) => ({ ...s, loading: false, error }))
                })
        load()
        const id = refreshMs ? setInterval(load, refreshMs) : null
        return () => {
            ctrl.abort()
            if (id) clearInterval(id)
        }
    }, [path, refreshMs, enabled, headerKey])

    return state
}
