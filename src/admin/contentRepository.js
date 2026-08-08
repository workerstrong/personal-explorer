import { createClient } from '@supabase/supabase-js'
import { createInitialContent, normalizeProfileContent, SITE_ID } from '../content/profileSchema'

const LOCAL_DRAFT_KEY = 'personal-explorer-cms-draft-v1'
const LOCAL_PUBLICATION_KEY = 'personal-explorer-cms-publication-v1'

export const cloudConfiguration = {
  url: import.meta.env.VITE_SUPABASE_URL?.trim(),
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY?.trim(),
  publicSiteUrl: import.meta.env.VITE_PUBLIC_SITE_URL?.trim(),
}

export const isCloudConfigured = Boolean(cloudConfiguration.url && cloudConfiguration.anonKey)

function contentConflict() {
  const error = new Error('Content changed in another tab')
  error.code = 'CONTENT_CONFLICT'
  return error
}

function createLocalRepository() {
  return {
    mode: 'local',
    async getSession() { return { user: { email: 'demo@local.test' } } },
    async signInWithMagicLink() { throw new Error('本地演示模式不发送登录邮件。') },
    async signOut() {},
    onAuthStateChange() { return () => {} },
    async loadDraft() {
      const saved = localStorage.getItem(LOCAL_DRAFT_KEY)
      if (!saved) return { content: createInitialContent(), revision: 1 }
      const parsed = JSON.parse(saved)
      return { content: normalizeProfileContent(parsed.content), revision: parsed.revision ?? 1 }
    },
    async saveDraft(content, expectedRevision) {
      const saved = localStorage.getItem(LOCAL_DRAFT_KEY)
      const current = saved ? JSON.parse(saved) : null
      if (current && current.revision !== expectedRevision) throw contentConflict()
      const revision = expectedRevision + 1
      localStorage.setItem(LOCAL_DRAFT_KEY, JSON.stringify({ content, revision, updatedAt: new Date().toISOString() }))
      return { revision, updatedAt: new Date().toISOString() }
    },
    async publish(content, revision) {
      localStorage.setItem(LOCAL_PUBLICATION_KEY, JSON.stringify({ content, revision, publishedAt: new Date().toISOString() }))
      return { mode: 'local', status: 'READY', publishedAt: new Date().toISOString() }
    },
    async getDeploymentStatus() { return { status: 'READY' } },
  }
}

function createCloudRepository() {
  const client = createClient(cloudConfiguration.url, cloudConfiguration.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })

  return {
    mode: 'cloud',
    async getSession() {
      const { data, error } = await client.auth.getSession()
      if (error) throw error
      return data.session
    },
    async signInWithMagicLink(email) {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      })
      if (error) throw error
    },
    async signOut() { await client.auth.signOut() },
    onAuthStateChange(callback) {
      const { data } = client.auth.onAuthStateChange((_event, session) => callback(session))
      return () => data.subscription.unsubscribe()
    },
    async loadDraft() {
      const { data, error } = await client.from('site_drafts').select('content, revision').eq('id', SITE_ID).maybeSingle()
      if (error) throw error
      if (data) return { content: normalizeProfileContent(data.content), revision: data.revision }

      const initial = createInitialContent()
      const { data: inserted, error: insertError } = await client
        .from('site_drafts')
        .insert({ id: SITE_ID, content: initial, revision: 1 })
        .select('content, revision')
        .single()
      if (insertError) throw insertError
      return { content: normalizeProfileContent(inserted.content), revision: inserted.revision }
    },
    async saveDraft(content, expectedRevision) {
      const { data, error } = await client
        .from('site_drafts')
        .update({ content, revision: expectedRevision + 1, updated_at: new Date().toISOString() })
        .eq('id', SITE_ID)
        .eq('revision', expectedRevision)
        .select('revision, updated_at')
      if (error) throw error
      if (!data?.length) throw contentConflict()
      return { revision: data[0].revision, updatedAt: data[0].updated_at }
    },
    async publish(content, revision) {
      const { data: sessionData } = await client.auth.getSession()
      const token = sessionData.session?.access_token
      if (!token) throw new Error('登录已过期，请重新登录。')
      const response = await fetch('/api/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ expectedRevision: revision, content }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? '发布失败。')
      return result
    },
    async getDeploymentStatus(reference) {
      const { data: sessionData } = await client.auth.getSession()
      const token = sessionData.session?.access_token
      const query = new URLSearchParams({
        createdAt: String(reference.createdAt),
        deployHookId: reference.deployHookId,
      })
      const response = await fetch(`/api/deployment-status?${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error ?? '无法读取部署状态。')
      return result
    },
  }
}

export const contentRepository = isCloudConfigured ? createCloudRepository() : createLocalRepository()
