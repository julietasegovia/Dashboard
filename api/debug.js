
export default async function handler(req, res) {
  try {
    const m = await import('../server/server.js')
    res.status(200).json({ loaded: true, defaultExport: typeof m.default })
  } catch (err) {
    res.status(500).json({ loaded: false, message: err.message, stack: String(err.stack).split('\n').slice(0, 8) })
  }
}