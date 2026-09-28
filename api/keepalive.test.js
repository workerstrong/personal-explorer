import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import handler from './keepalive.js'

function createResponse() {
  return {
    statusCode: 0,
    headers: {},
    payload: undefined,
    setHeader(name, value) { this.headers[name] = value },
    status(code) { this.statusCode = code; return this },
    json(value) { this.payload = value; return this },
  }
}

function createRequest({ method = 'GET', authorization } = {}) {
  return { method, headers: authorization ? { authorization } : {} }
}

describe('keepalive handler', () => {
  beforeEach(() => {
    vi.stubEnv('SUPABASE_URL', 'https://example.supabase.co')
    vi.stubEnv('VITE_SUPABASE_URL', '')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', 'service-role-key')
    vi.stubEnv('VITE_SUPABASE_ANON_KEY', '')
    vi.stubEnv('CRON_SECRET', '')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('queries the database and reports success', async () => {
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200, text: async () => '[]' }))
    vi.stubGlobal('fetch', fetchMock)

    const response = createResponse()
    await handler(createRequest(), response)

    expect(response.statusCode).toBe(200)
    expect(response.payload.ok).toBe(true)
    expect(response.payload.succeeded).toBe(2)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://example.supabase.co/rest/v1/site_publications?id=eq.profile&select=revision,published_at')
    expect(init.headers.apikey).toBe('service-role-key')
    expect(init.headers.Authorization).toBe('Bearer service-role-key')
    expect(response.headers['Cache-Control']).toBe('no-store')
  })

  it('reports a paused project when every probe fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('fetch failed') }))

    const response = createResponse()
    await handler(createRequest(), response)

    expect(response.statusCode).toBe(502)
    expect(response.payload.ok).toBe(false)
    expect(response.payload.hint).toContain('Resume project')
    expect(response.payload.results.every((result) => result.status === 0)).toBe(true)
  })

  it('stays healthy when only one probe fails', async () => {
    vi.stubGlobal('fetch', vi.fn(async (url) => (
      url.includes('site_drafts')
        ? { ok: false, status: 401, text: async () => '{"message":"Unauthorized"}' }
        : { ok: true, status: 200, text: async () => '[]' }
    )))

    const response = createResponse()
    await handler(createRequest(), response)

    expect(response.statusCode).toBe(200)
    expect(response.payload.succeeded).toBe(1)
  })

  it('fails clearly when the environment is incomplete', async () => {
    vi.stubEnv('SUPABASE_URL', '')
    vi.stubEnv('SUPABASE_SERVICE_ROLE_KEY', '')

    const response = createResponse()
    await handler(createRequest(), response)

    expect(response.statusCode).toBe(503)
    expect(response.payload.ok).toBe(false)
  })

  it('rejects anonymous callers once CRON_SECRET is set', async () => {
    vi.stubEnv('CRON_SECRET', 'top-secret')
    const fetchMock = vi.fn(async () => ({ ok: true, status: 200, text: async () => '[]' }))
    vi.stubGlobal('fetch', fetchMock)

    const anonymous = createResponse()
    await handler(createRequest(), anonymous)
    expect(anonymous.statusCode).toBe(401)
    expect(fetchMock).not.toHaveBeenCalled()

    const authorized = createResponse()
    await handler(createRequest({ authorization: 'Bearer top-secret' }), authorized)
    expect(authorized.statusCode).toBe(200)
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('rejects unsupported methods', async () => {
    const response = createResponse()
    await handler(createRequest({ method: 'POST' }), response)

    expect(response.statusCode).toBe(405)
    expect(response.headers.Allow).toBe('GET, HEAD')
  })
})
