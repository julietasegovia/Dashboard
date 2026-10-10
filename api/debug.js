import http from 'node:http'

export default async function handler(req, res) {
  try {
    const { default: app } = await import('../server/server.js')

    // Report the real error instead of Express's generic "Internal Server Error".
    app.use((err, _req, res2, _next) => {
      res2.status(500).json({ error: err.message, stack: String(err.stack).split('\n').slice(0, 6) })
    })

    const server = http.createServer(app)
    await new Promise((r) => server.listen(0, '127.0.0.1', r))
    const { port } = server.address()

    const results = {}
    for (const p of ['/api/health', '/api/config', '/api/weather', '/api/news']) {
      try {
        const r = await fetch(`http://127.0.0.1:${port}${p}`)
        results[p] = { status: r.status, body: (await r.text()).slice(0, 300) }
      } catch (e) {
        results[p] = { fetchError: e.message }
      }
    }
    server.close()
    res.status(200).json(results)
  } catch (err) {
    res.status(500).json({ loaded: false, message: err.message, stack: String(err.stack).split('\n').slice(0, 8) })
  }
}