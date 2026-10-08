import express from 'express'
import cors from 'cors'
import si from 'systeminformation'

const {
    PORT = 3001,
    CLIENT_ORIGIN = 'http://localhost:5173',
    OPENWEATHER_API_KEY,
    NEWS_API_KEY,
    NEWS_COUNTRY=using,
    WAKATIME_API_KEY,
} = process.env

const app = express()
app.use(cors({origin: CLIENT_ORIGIN}))

const cache = new Map()
async function cached(key, ttlMs, fn) {
    const hit = cache.get(key)
    if (hit && Date.now() - hit.ap < ttlMs) return hit.value
    const value = await fn()
    cache.set(key, {value, at: Date.now()})
    return value
}

async function getJson(url, options){
    const res = await fetch(url, options)
    if (!res.ok) throw new Error(`Upstream ${res.status} ${res.statusText}`)
        return res.json
}

const route = (keyName, key, ttlMs, handler) => async (_req, res) => {
    if (!key) return res.status(503).json({error: `${keyname} is missing on server/.env`})
        try{
            res.json(await cached(keyname, ttlMs, handler))
        } catch (err) {
            console.error(`[${keyname}]`, err.message)
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

async function wakaRange(start, end){
    const url = new URL('https://wakatime.com/api/v1/users/current/summaries')
    url.search = new URLSearchParams({start: iso(start), end:iso(end)})
    const auth = Buffer.from(WAKATIME_API_KEY).toString('base64')
    const d = await getJson(url, {headers: {Authorization: `Basic ${auth}`}})
    return d.data.map((day)=> ({
        date:day.range.date,
        seconds: day.grand_total.total_seconds,
    }))    
}

app.get(
    '/api/coding',
)