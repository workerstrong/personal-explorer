import { createClient } from '@supabase/supabase-js'
import { validateProfileContent } from '../src/content/profileSchema.js'

function getServerConfiguration() {
  return {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    adminEmail: process.env.ADMIN_EMAIL?.toLowerCase(),
    deployHook: process.env.VERCEL_DEPLOY_HOOK_URL,
  }
}

async function authenticate(request, client, adminEmail) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, '')
  if (!token) throw new Error('缺少登录凭证。')
  const { data, error } = await client.auth.getUser(token)
  if (error || !data.user) throw new Error('登录已过期。')
  if (!adminEmail || data.user.email?.toLowerCase() !== adminEmail) throw new Error('当前账户没有发布权限。')
  return data.user
}

async function triggerDeployment(url) {
  let lastError
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const response = await fetch(url, { method: 'POST' })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error?.message ?? `Vercel returned ${response.status}`)
      return result
    } catch (error) {
      lastError = error
    }
  }
  throw lastError
}

export default async function handler(request, response) {
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed' })
  const config = getServerConfiguration()
  if (!config.url || !config.serviceRoleKey || !config.deployHook) {
    return response.status(503).json({ error: '服务器尚未完成 Supabase 或 Vercel 发布配置。' })
  }

  const client = createClient(config.url, config.serviceRoleKey, { auth: { persistSession: false } })

  try {
    const user = await authenticate(request, client, config.adminEmail)
    const expectedRevision = Number(request.body?.expectedRevision)
    const { data: draft, error: draftError } = await client
      .from('site_drafts')
      .select('content, revision')
      .eq('id', 'profile')
      .single()
    if (draftError) throw draftError
    if (draft.revision !== expectedRevision) return response.status(409).json({ error: '草稿已经变化，请重新加载后再发布。' })

    const validation = validateProfileContent(draft.content)
    if (!validation.isValid) return response.status(422).json({ error: '草稿仍有必须修复的内容。', errors: validation.errors })

    await client.from('site_versions').insert({
      site_id: 'profile',
      content: draft.content,
      revision: draft.revision,
      created_by: user.id,
    })

    const { error: publicationError } = await client.from('site_publications').upsert({
      id: 'profile',
      content: draft.content,
      revision: draft.revision,
      published_at: new Date().toISOString(),
      published_by: user.id,
    })
    if (publicationError) throw publicationError

    const deployment = await triggerDeployment(config.deployHook)
    const deployHookId = new URL(config.deployHook).pathname.split('/').filter(Boolean).at(-1)
    return response.status(200).json({
      status: 'QUEUED',
      deploymentReference: {
        createdAt: deployment.job?.createdAt || Date.now(),
        deployHookId,
      },
      publishedAt: new Date().toISOString(),
      warnings: validation.warnings,
    })
  } catch (error) {
    return response.status(500).json({ error: error.message || '发布失败。' })
  }
}
