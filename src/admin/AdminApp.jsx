import { useEffect, useState } from 'react'
import { AdminEditor } from './AdminEditor'
import { AdminLogin } from './AdminLogin'
import { contentRepository, isCloudConfigured } from './contentRepository'
import { useDraftDocument } from './useDraftDocument'
import './admin.css'

export default function AdminApp() {
  const [session, setSession] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(isCloudConfigured)
  const [demoActive, setDemoActive] = useState(false)
  const authenticated = isCloudConfigured ? Boolean(session) : demoActive
  const documentState = useDraftDocument(contentRepository, authenticated)

  useEffect(() => {
    if (!isCloudConfigured) return undefined
    contentRepository.getSession().then(setSession).finally(() => setCheckingAuth(false))
    return contentRepository.onAuthStateChange((nextSession) => {
      setSession(nextSession)
      setCheckingAuth(false)
    })
  }, [])

  async function signOut() {
    await contentRepository.signOut()
    setSession(null)
    setDemoActive(false)
  }

  if (checkingAuth) return <div className="admin-route-loading" role="status">正在验证安全会话…</div>

  if (!authenticated) {
    return (
      <AdminLogin
        cloudEnabled={isCloudConfigured}
        onDemo={() => { setDemoActive(true); setSession({ user: { email: 'demo@local.test' } }) }}
        onMagicLink={(email) => contentRepository.signInWithMagicLink(email)}
      />
    )
  }

  if (documentState.saveStatus === 'loading' || !documentState.draft) {
    return <div className="admin-route-loading" role="status">正在准备你的内容工作台…</div>
  }

  return <AdminEditor repository={contentRepository} session={session} documentState={documentState} onSignOut={signOut} />
}
