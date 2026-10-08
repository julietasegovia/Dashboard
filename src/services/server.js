import express from 'express'
import cors from 'cors'
import si from 'systeminformation'

const {
    PORT = 3001,
    CLIENT_ORIGIN = 'http://localhost:5173',
    OPENWEATHER_API_KEY,
    WEATHER_CITY = 'Buenos Aires,AR',
    NEWS_API_KEY,
    NEWS_COUNTRY = 'us',
    HACKATIME_API_KEY,
    HACKATIME_URL = 'https://hackatime.hackclub.com',
} = process.env

const app = express()
app.use(cors({origin: CLIENT_ORIGIN}))

const cache = new Map()
async function cached(key, ttlMs, fn) {
    const hit = cache.get(key)
    if (hit && Date.now() - hit.at < ttlMs) return hit.value
    const value = await fn()
    cache.set(key, {value, at: Date.now()})
    return value
}

async function getJson(url, options) {
    const res = await fetch(url, options)
    if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw new Error(`Upstream ${res.status} ${res.statusText}: ${body.slice(0, 200)}`)
    }
    return res.json()
}

const route = (keyName, key, ttlMs, handler) => async (_req, res) => {
    if (!key) return res.status(503).json({error: `${keyName} is missing on server/.env`})
        try{
            res.json(await cached(keyName, ttlMs, handler))
        } catch (err) {
            console.error(`[${keyName}]`, err.message, err.cause?.code ?? err.cause?.message ?? '')
            res.status(502).json({error: 'Couldnt get suppliers data'})
        }
}

const timeAgo = (iso) => {
    const mins = Math.max(1, Math.round((Date.now() - new Date(iso)) / 60000))
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.round(mins/60)
    return hrs < 24 ? `${hrs}h ago` : `${Math.round(hrs/24)}d ago`
}

app.get(
    '/api/weather',
    route('OPENWEATHER_API_KEY', OPENWEATHER_API_KEY, 10 * 60_000, async () => {
        const url = new URL('https://api.openweathermap.org/data/2.5/weather')
        url.search = new URLSearchParams({q: WEATHER_CITY, units: 'metric', appid: OPENWEATHER_API_KEY})
        const d = await getJson(url)
        const desc = d.weather?.[0]?.description ?? ''
        return {
            temp: Math.round(d.main.temp),
            high: Math.round(d.main.temp_max),
            low: Math.round(d.main.temp_min),
            humidity: d.main.humidity,
            description: desc.charAt(0).toUpperCase() + desc.slice(1),
        }
    }),
)

app.get(
    '/api/news',
    route('NEWS_API_KEY', NEWS_API_KEY, 15*60_000, async () => {
        const url = new URL('https://newsapi.org/v2/top-headlines')
        url.search = new URLSearchParams({country: NEWS_COUNTRY, pageSize: '3'})
        const d = await getJson(url, {headers: {'X-APi-Key': NEWS_API_KEY}})
        return {
            headlines: d.articles.slice(0, 3).map((a)=>({
                category: (a.source?.name ?? 'NEWS').toUpperCase(),
                title: a.title?.replace(/\s+-\s+[^-]+$/, '') ?? '',
                time: timeAgo(a.publishedAt),
                url: a.url,
            })),
        }
    }),
)

const iso = (d) => d.toISOString().slice(0, 10)
const daysAgo = (n) => new Date(Date.now() - n * 86_400_000)

async function wakaRange(start, end) {
    const url = new URL('/api/hackatime/v1/users/current/summaries', HACKATIME_URL)
    url.search = new URLSearchParams({start: iso(start), end: iso(end)})
    const d = await getJson(url, {headers: {Authorization: `Bearer ${HACKATIME_API_KEY}`}})
    return (d.data ?? []).map((day) => ({
        date: day.range?.date ?? day.range?.start?.slice(0, 10),
        seconds: day.grand_total?.total_seconds ?? 0,
    }))
}

app.get(
    '/api/coding',
    route('HACKATIME_API_KEY', HACKATIME_API_KEY, 15* 60_000, async () => {
        const [week, prevWeek] = await Promise.all([
            wakaRange(daysAgo(6), daysAgo(0)), wakaRange(daysAgo(13), daysAgo(7)).catch(() => [])
        ])
        const sum = (arr) => arr.reduce((t, d)=> t + d.seconds, 0)
        const total = sum(week)
        const prev = sum(prevWeek)
        const max = Math.max(...week.map((d)=> d.seconds), 1)
        return {
            hours: Math.floor(total/ 3600),
            minutes: Math.floor((total%3600)/60),
            deltaPct: prev ? Math.round(((total-prev)/ prev) * 100) : null,
            bars: week.map((d) => Math.round((d.seconds / max) * 100)),
            days: week.map((d) => ({date: d.date, seconds: d.seconds})),
            labels : week.map((d) => new Date(`${d.date}T12:00:00`).toLocaleDateString('en-US', {weekday: 'narrow'}),),
        }
    }),
)

app.get('/api/device', async (_req, res) => {
    try{
        const [battery, cpu] = await Promise.all([si.battery(), si.cpuTemperature()])
        res.json({
            battery: battery.hasBattery ? Math.round(battery.percent) : null,
            cpuTemp: cpu.main != null ? Math.round(cpu.main) : null,
        })
    }catch (err){
        console.error('[device]', err.message)
        res.status(500).json({error: 'Cant read hardware'})
    }
})

app.get('/api/health', (_req, res) => res.json({ok: true}))
app.listen(PORT, () => console.log(`API ready http://localhost:${PORT}`))