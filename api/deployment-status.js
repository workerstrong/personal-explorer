import { createClient } from '@supabase/supabase-js'

export default async function handler(request, response) {
  if (request.method !== 'GET') return response.status(405).json({ error: 'Method not allowed' })
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase()
  const projectId = process.env.VERCEL_PROJECT_ID
  const createdAt = Number(request.query?.createdAt)
  const deployHookId = request.query?.deployHookId

  if (!supabaseUrl || !serviceRoleKey || !process.env.VERCEL_TOKEN || !projectId || !createdAt || !deployHookId) {
    return response.status(503).json({ error: '部署状态服务尚未配置。' })
  }

  try {
    const client = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
    const token = request.headers.authorization?.replace(/^Bearer\s+/i, '')
    const { data, error } = await client.auth.getUser(token)
    if (error || !data.user || data.user.email?.toLowerCase() !== adminEmail) {
      return response.status(401).json({ error: '没有权限读取部署状态。' })
    }

    const query = new URLSearchParams({
      projectId,
      since: String(Math.max(0, createdAt - 2000)),
      limit: '20',
    })
    if (process.env.VERCEL_TEAM_ID) query.set('teamId', process.env.VERCEL_TEAM_ID)

    const vercelResponse = await fetch(`https://api.vercel.com/v6/deployments?${query}`, {
      headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` },
    })
    const result = await vercelResponse.json()
    if (!vercelResponse.ok) throw new Error(result.error?.message ?? 'Vercel 状态查询失败。')

    const deployment = result.deployments?.find((item) => item.meta?.deployHookId === deployHookId)
    if (!deployment) return response.status(200).json({ status: 'QUEUED', url: null })

    return response.status(200).json({
      status: deployment.readyState,
      url: deployment.url ? `https://${deployment.url}` : null,
    })
  } catch (error) {
    return response.status(500).json({ error: error.message || '部署状态查询失败。' })
  }
}
