import dns from 'node:dns'
import net from 'node:net'
import express from 'express'
import cors from 'cors'
import si from 'systeminformation'

dns.setDefaultResultOrder('ipv4first')
net.setDefaultAutoSelectFamily(false)

const {
    PORT = 3001,
    CLIENT_ORIGIN = 'http://localhost:5173',
    OPENWEATHER_API_KEY,
    WEATHER_CITY = 'Rosario,AR',
    NEWS_API_KEY,
    NEWS_COUNTRY='us',
    WAKATIME_API_KEY,
} = process.env

const app = express()
app.use(cors({origin: CLIENT_ORIGIN}))

const cache = new Map()
async function cached(key, ttlMs, fn) {
    const hit = cache.get(key)
    // #region agent log
    fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'pre-fix',hypothesisId:'G',location:'server.js:cached',message:'cache lookup',data:{key,hasHit:Boolean(hit),hitKeys:hit?Object.keys(hit):null},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (hit && Date.now() - hit.at < ttlMs) {
        // #region agent log
        fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'post-fix',hypothesisId:'G',location:'server.js:cached',message:'cache hit return',data:{key},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        return hit.value
    }
    const value = await fn()
    cache.set(key, {value, at: Date.now()})
    return value
}

async function getJson(url, options){
    const res = await fetch(url, options)
    if (!res.ok) throw new Error(`Upstream ${res.status} ${res.statusText}`)
    const body = await res.json()
    // #region agent log
    fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'post-fix',hypothesisId:'D',location:'server.js:getJson',message:'getJson return shape',data:{host:url?.host??null,pathname:url?.pathname??null,status:res.status,returnType:typeof body,isArray:Array.isArray(body)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
        return body
}

const route = (keyName, key, ttlMs, handler) => async (_req, res) => {
    // #region agent log
    let keynameResolves = true
    try { void keyname } catch { keynameResolves = false }
    fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'pre-fix',hypothesisId:'D',location:'server.js:route',message:'route enter',data:{keyName,keyPresent:Boolean(key),keynameResolves},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
    if (!key) return res.status(503).json({error: `${keyName} is missing on server/.env`})
        try{
            const value = await cached(keyName, ttlMs, handler)
            // #region agent log
            fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'post-fix',hypothesisId:'D',location:'server.js:route',message:'route ok',data:{keyName,valueType:typeof value,keys:value&&typeof value==='object'?Object.keys(value):null},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
            res.json(value)
        } catch (err) {
            console.error(`[${keyName}]`, err.message)
            // #region agent log
            fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'post-fix',hypothesisId:'D',location:'server.js:route',message:'route error',data:{keyName,error:String(err?.message||err)},timestamp:Date.now()})}).catch(()=>{});
            fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'post-fix',hypothesisId:'D',location:'server.js:route',message:'route error cause',data:{keyName,cause:err?.cause?.code||err?.cause?.message||null},timestamp:Date.now()})}).catch(()=>{});
            // #endregion
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
    route('WAKATIME_API_KEY', WAKATIME_API_KEY, 15* 60_000, async () => {
        // #region agent log
        let prevweekName = 'defined'
        try { void prevweek } catch { prevweekName = 'ReferenceError' }
        fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'pre-fix',hypothesisId:'D',location:'server.js:coding',message:'prevweek binding',data:{prevweekName},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        const [week, prevWeek] = await Promise.all([
            wakaRange(daysAgo(6), daysAgo(0)), wakaRange(daysAgo(13), daysAgo(7))
        ])
        const sum = (arr) => arr.reduce((t, d)=> t + d.seconds, 0)
        const total = sum(week)
        // #region agent log
        prevweekName = 'defined'
        try { void prevweek } catch { prevweekName = 'ReferenceError' }
        fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'pre-fix',hypothesisId:'D',location:'server.js:coding',message:'coding totals',data:{weekLength:week?.length??null,prevWeekIsArray:Array.isArray(prevWeek),prevweekName},timestamp:Date.now()})}).catch(()=>{});
        // #endregion
        const prev = sum(prevWeek)
        const max = Math.max(...week.map((d)=> d.seconds), 1)
        return {
            hours: Math.floor(total/ 3600),
            minutes: Math.floor((total%3600)/60),
            deltaPct: prev ? Math.round(((total-prev)/ prev) * 100) : null,
            bars: week.map((d) => Math.round((d.seconds / max) * 100)),
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
// #region agent log
await fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'pre-fix',hypothesisId:'C',location:'server.js:listen',message:'before listen',data:{hasListen:typeof app.listen,hasLiisten:typeof app.liisten,port:String(PORT)},timestamp:Date.now()})}).catch(()=>{});
// #endregion
app.listen(PORT, () => {
    console.log(`API ready http://localhost:${PORT}`)
    // #region agent log
    fetch('http://127.0.0.1:7632/ingest/b1d0acd6-3679-4484-bbc0-9e5a4f5aecd2',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'7f0471'},body:JSON.stringify({sessionId:'7f0471',runId:'post-fix',hypothesisId:'C',location:'server.js:listen',message:'listen callback',data:{port:String(PORT)},timestamp:Date.now()})}).catch(()=>{});
    // #endregion
})