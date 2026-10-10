import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createHash } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const KEY_FILE = path.join(__dirname, '.hackatime-key')

const {
    PORT = 3001,
    OPENWEATHER_API_KEY,
    WEATHER_CITY = 'Rosario,AR',
    NEWS_API_KEY,
    NEWS_COUNTRY = 'us',
    HACKATIME_URL = 'https://hackatime.hackclub.com',
    PERSONAL_MODE = 'false',
} = process.env

const personal = PERSONAL_MODE === 'true'

const app = express()
app.set('trust proxy', 1)
app.use(helmet({ contentSecurityPolicy: false }))
app.use('/api', rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: true, legacyHeaders: false }))

const cache = new Map()
async function cached(key, ttlMs, fn) {
    const hit = cache.get(key)
    if (hit && Date.now() - hit.at < ttlMs) return hit.value
    const value = await fn()
    cache.set(key, { value, at: Date.now(), ttlMs })
    if (cache.size > 500) for (const [k, v] of cache) if (Date.now() - v.at > v.ttlMs) cache.delete(k)
    if (cache.size > 2000) cache.clear()
    return value
}

async function getJson(url, options) {
    const res = await fetch(url, options)
    if (!res.ok) {
        const body = await res.text().catch(() => '')
        throw Object.assign(new Error(`Upstream ${res.status} ${res.statusText}: ${body.slice(0, 200)}`), { status: res.status })
    }
    return res.json()
}

const route = (name, { ttl, key = () => 'shared', check }, handler) => async (req, res) => {
    res.set('Cache-Control', 'private, no-store')
    const problem = check?.(req)
    if (problem) return res.status(problem.status).json({ error: problem.error })
    try {
        res.json(await cached(`${name}:${key(req)}`, ttl, () => handler(req)))
    } catch (err) {
        console.error(`[${name}]`, err.message, err.cause?.code ?? '')
        res.status(err.status === 401 || err.status === 403 ? 401 : 502).json({ error: 'Could not get provider data' })
    }
}

const timeAgo = (iso) => {
    const mins = Math.max(1, Math.round((Date.now() - new Date(iso)) / 60000))
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.round(mins / 60)
    return hrs < 24 ? `${hrs}h ago` : `${Math.round(hrs / 24)}d ago`
}

const num = (v) => (v === undefined || v === '' ? NaN : Number(v))
const coords = (req) => {
    const lat = num(req.query.lat), lon = num(req.query.lon)
    return Number.isFinite(lat) && Number.isFinite(lon) && Math.abs(lat) <= 90 && Math.abs(lon) <= 180
        ? { lat: lat.toFixed(1), lon: lon.toFixed(1) }
        : null
}

function tomorrowForecast(fc) {
    const offset = fc.city?.timezone ?? 0
    const localDate = (dt) => new Date((dt + offset) * 1000).toISOString().slice(0, 10)
    const target = localDate(Math.floor(Date.now() / 1000) + 86_400)
    const slots = (fc.list ?? []).filter((s) => localDate(s.dt) === target)
    if (!slots.length) return null
    const counts = {}
    for (const s of slots) {
        const d = s.weather?.[0]?.description
        if (d) counts[d] = (counts[d] ?? 0) + 1
    }
    const desc = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? ''
    return {
        high: Math.round(Math.max(...slots.map((s) => s.main.temp_max))),
        low: Math.round(Math.min(...slots.map((s) => s.main.temp_min))),
        description: desc.charAt(0).toUpperCase() + desc.slice(1),
        rain: Math.round(Math.max(...slots.map((s) => s.pop ?? 0)) * 100),
    }
}

app.get(
    '/api/weather',
    route('weather', {
        ttl: 10 * 60_000,
        key: (req) => { const c = coords(req); return c ? `${c.lat},${c.lon}` : 'default' },
        check: () => !OPENWEATHER_API_KEY && { status: 503, error: 'OPENWEATHER_API_KEY is not configured' },
    }, async (req) => {
        const params = new URLSearchParams({ ...(coords(req) ?? { q: WEATHER_CITY }), units: 'metric', appid: OPENWEATHER_API_KEY })
        const [d, fc] = await Promise.all([
            getJson(`https://api.openweathermap.org/data/2.5/weather?${params}`),
            getJson(`https://api.openweathermap.org/data/2.5/forecast?${params}`).catch((err) => {
                console.error('[forecast]', err.message)
                return null
            }),
        ])
        const desc = d.weather?.[0]?.description ?? ''
        return {
            temp: Math.round(d.main.temp),
            high: Math.round(d.main.temp_max),
            low: Math.round(d.main.temp_min),
            humidity: d.main.humidity,
            description: desc.charAt(0).toUpperCase() + desc.slice(1),
            tomorrow: fc ? tomorrowForecast(fc) : null,
        }
    }),
)

app.get(
    '/api/news',
    route('news', {
        ttl: 15 * 60_000,
        check: () => !NEWS_API_KEY && { status: 503, error: 'NEWS_API_KEY is not configured' },
    }, async () => {
        const url = new URL('https://newsapi.org/v2/top-headlines')
        url.search = new URLSearchParams({ country: NEWS_COUNTRY, pageSize: '3' })
        const d = await getJson(url, { headers: { 'X-Api-Key': NEWS_API_KEY } })
        return {
            headlines: d.articles.slice(0, 3).map((a) => ({
                category: (a.source?.name ?? 'NEWS').toUpperCase(),
                title: a.title?.replace(/\s+-\s+[^-]+$/, '') ?? '',
                time: timeAgo(a.publishedAt),
                url: a.url,
            })),
        }
    }),
)

const validKey = (k) => (typeof k === 'string' && k.trim() && k.trim().length <= 200 ? k.trim() : null)

const readSavedKey = () => {
    if (!personal) return null
    try { return validKey(fs.readFileSync(KEY_FILE, 'utf8')) } catch { return null }
}

const hackatimeKey = (req) => validKey(req.get('x-hackatime-key')) ?? readSavedKey()

if (personal) {
    app.post('/api/hackatime-key', express.json({ limit: '1kb' }), (req, res) => {
        const key = validKey(req.body?.key)
        if (!key) return res.sendStatus(400)
        fs.writeFileSync(KEY_FILE, key, { mode: 0o600 })
        res.sendStatus(204)
    })

    app.delete('/api/hackatime-key', (_req, res) => {
        fs.rmSync(KEY_FILE, { force: true })
        res.sendStatus(204)
    })
}

app.get('/api/config', (_req, res) => res.json({ personal }))
const iso = (d) => d.toISOString().slice(0, 10)
const daysAgo = (n) => new Date(Date.now() - n * 86_400_000)

async function wakaRange(key, start, end) {
    const url = new URL('/api/hackatime/v1/users/current/summaries', HACKATIME_URL)
    url.search = new URLSearchParams({ start: iso(start), end: iso(end) })
    const d = await getJson(url, { headers: { Authorization: `Bearer ${key}` } })
    return (d.data ?? []).map((day) => ({
        date: day.range?.date ?? day.range?.start?.slice(0, 10),
        seconds: day.grand_total?.total_seconds ?? 0,
    }))
}

app.get(
    '/api/coding',
    route('coding', {
        ttl: 15 * 60_000,
        key: (req) => createHash('sha256').update(hackatimeKey(req)).digest('hex').slice(0, 16),
        check: (req) => !hackatimeKey(req) && { status: 401, error: 'Missing Hackatime key' },
    }, async (req) => {
        const key = hackatimeKey(req)
        const [week, prevWeek] = await Promise.all([
            wakaRange(key, daysAgo(6), daysAgo(0)),
            wakaRange(key, daysAgo(13), daysAgo(7)).catch(() => []),
        ])
        const sum = (arr) => arr.reduce((t, d) => t + d.seconds, 0)
        const total = sum(week), prev = sum(prevWeek)
        const max = Math.max(...week.map((d) => d.seconds), 1)
        return {
            hours: Math.floor(total / 3600),
            minutes: Math.floor((total % 3600) / 60),
            deltaPct: prev ? Math.round(((total - prev) / prev) * 100) : null,
            bars: week.map((d) => Math.round((d.seconds / max) * 100)),
            days: week.map((d) => ({ date: d.date, seconds: d.seconds })),
            labels: week.map((d) => new Date(`${d.date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'narrow' })),
        }
    }),
)

function readText(file){
    try {return fs.readFileSync(file, 'utf8').trim()} catch {}
}

function deviceStats() {
    let battery = null
    let supplies = []
    try { supplies = fs.readdirSync('/sys/class/power_supply') } catch {}
    for (const name of supplies) {
        const base = `/sys/class/power_supply/${name}`
        if (readText(`${base}/type`) !== 'Battery') continue
        const capacity = Number(readText(`${base}/capacity`))
        if (Number.isFinite(capacity)) battery = capacity
    }

    let cpuTemp = null
    let hwmons = []
    try { hwmons = fs.readdirSync('/sys/class/hwmon') } catch {}
    for (const name of hwmons) {
        const base = `/sys/class/hwmon/${name}`
        const chip = readText(`${base}/name`)
        if (chip !== 'k10temp' && chip !== 'coretemp') continue
        const raw = Number(readText(`${base}/temp1_input`))
        if (Number.isFinite(raw)) cpuTemp = Math.round(raw / 1000)
    }

    return { battery, cpuTemp }
}

if (personal) app.get('/api/device', route('device', {ttl: 5_000}, () => deviceStats()))
app.get('/api/health', (_req, res) => res.json({ ok: true }))

const dist = path.join(__dirname, '..', 'dist')
if (fs.existsSync(dist)) {
    app.use(express.static(dist))
    app.get(/^(?!\/api).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')))
}

app.listen(PORT, () => console.log(`API ready on port ${PORT}`))