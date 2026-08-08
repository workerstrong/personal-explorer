import { lazy, Suspense, useEffect } from 'react'
import { PublicSite } from './PublicSite'
import { usePublishedProfile } from './content/usePublishedProfile'

const AdminApp = lazy(() => import('./admin/AdminApp'))

function PublishedSite() {
  const content = usePublishedProfile()
  return <PublicSite profileData={content} />
}

export default function App() {
  const isAdminRoute = window.location.pathname === '/admin' || window.location.pathname.startsWith('/admin/')

  useEffect(() => {
    document.documentElement.lang = isAdminRoute ? 'zh-CN' : 'en'
  }, [isAdminRoute])

  if (isAdminRoute) {
    return (
      <Suspense fallback={<div className="route-loading" role="status">正在打开内容工作台…</div>}>
        <AdminApp />
      </Suspense>
    )
  }

  return <PublishedSite />
}
