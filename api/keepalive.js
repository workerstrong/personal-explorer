// Keep-alive endpoint for the Supabase Free plan.
//
// Free plan projects are paused automatically when they receive too little
// database activity over a 7-day window. Because this site is fully static at
// runtime (published content is baked into public/content/profile.json during
// the build), visitors never touch Postgres, so the project would otherwise
// always be paused. Vercel Cron calls this endpoint on a daily schedule and the
// handler issues a couple of real PostgREST reads, which is the documented way
// to keep a free project active.
//
// See README.md → 「防止 Supabase 免费项目被自动暂停」.

const PROBES = [
  { target: 'site_publications', query: 'site_publications?id=eq.profile&select=revision,published_at' },
  { target: 'site_drafts', query: 'site_drafts?id=eq.profile&select=revision' },
]

function readConfiguration() {
  return {
    url: (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim().replace(/\/+$/, ''),
    key: (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim(),
    cronSecret: (process.env.CRON_SECRET || '').trim(),
  }
}

async function runProbe(url, key, query) {
  const startedAt = Date.now()
  try {
    const response = await fetch(`${url}/rest/v1/${query}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}`, Accept: 'application/json' },
    })
    const body = await response.text()
    return {
      status: response.status,
      ok: response.ok,
      ms: Date.now() - startedAt,
      detail: response.ok ? 'queried' : body.slice(0, 160),
    }
  } catch (error) {
    // A DNS/connection failure here is the signature of a paused or deleted project.
    return { status: 0, ok: false, ms: Date.now() - startedAt, detail: error.message }
  }
}

export default async function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD')
    return response.status(405).json({ error: 'Method not allowed' })
  }

  const config = readConfiguration()

  // Vercel Cron sends this header automatically once CRON_SECRET is configured.
  if (config.cronSecret && request.headers.authorization !== `Bearer ${config.cronSecret}`) {
    return response.status(401).json({ error: 'Unauthorized' })
  }

  if (!config.url || !config.key) {
    return response.status(503).json({
      ok: false,
      error: '服务器缺少 SUPABASE_URL / VITE_SUPABASE_URL，或缺少 SUPABASE_SERVICE_ROLE_KEY / VITE_SUPABASE_ANON_KEY。',
    })
  }

  const results = []
  for (const probe of PROBES) {
    results.push({ target: probe.target, ...(await runProbe(config.url, config.key, probe.query)) })
  }

  const succeeded = results.filter((result) => result.ok).length
  response.setHeader('Cache-Control', 'no-store')

  if (!succeeded) {
    return response.status(502).json({
      ok: false,
      checkedAt: new Date().toISOString(),
      hint: '所有查询都失败了。最常见的原因是 Supabase 免费项目因闲置被暂停，请到 Supabase Dashboard 点击 Resume project。',
      results,
    })
  }

  return response.status(200).json({
    ok: true,
    checkedAt: new Date().toISOString(),
    succeeded,
    attempted: results.length,
    results,
  })
}
