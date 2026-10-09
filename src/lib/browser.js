import {useEffect, useState} from 'react'

export function useGeo(){
    const [geo, setGeo] = useState({status: 'pending', lat: null, lon: null})
    useEffect(() => {
        if(!navigator.geolocation) return setGeo({status: 'unavailable', lat: null, lon: null})
            navigator.geolocation.getCurrentPosition(
                (p) => setGeo({status: 'granted', lat: +p.coords.latitude.toFixed(1), lon: +p.coords.longitude.toFixed(1)}),
                () => setGeo({status: 'denied', lat: null, lon: null}),
                { maximumAge: 30 * 60_000, timeout: 8000},
        )
    }, [])
    return geo
}

export function useBattery(){
    const [battery, setBattery] = useState(null)
    useEffect(() => {
        if(!navigator.getBattery) return
        let bat, alive = true
        const update = () => alive && bat && setBattery({level: Math.round(bat.level * 100), charging: bat.charging })
        navigator.getBattery().then((b) => {
            bat = b
            update()
            b.addEventListener('levelchange', update)
            b.addEventListener('chargingchange', update)
        })
        return () => {
            alive = false
            bat?.removeEventListener('levelchange', update)
            bat?.removeEventListener('chanrgingchange', update)
        }
    }, [])
    return battery
}

const STORAGE_KEY = 'hackatime_key'
export function useHackatimeKey() {
    const [key, setKey] = useState(() => {
        try {return localStorage.getItem(STORAGE_KEY) ?? ''} catch {return ''}
    })
    const save = (value) => {
        try {value ? localStorage.setItem(STORAGE_KEY, value): localStorage.removeItem(STORAGE_KEY)} catch {}
        setKey(value)
    }
    return [key, save]
}