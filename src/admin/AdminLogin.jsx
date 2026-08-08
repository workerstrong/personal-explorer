import { ArrowLeft, KeyRound, Laptop, Mail } from 'lucide-react'
import { useState } from 'react'

export function AdminLogin({ cloudEnabled, onDemo, onMagicLink }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle')
  const [message, setMessage] = useState('')

  async function submit(event) {
    event.preventDefault()
    setStatus('sending')
    setMessage('')
    try {
      await onMagicLink(email)
      setStatus('sent')
      setMessage('登录链接已发送，请检查邮箱。')
    } catch (error) {
      setStatus('error')
      setMessage(error.message || '登录邮件发送失败。')
    }
  }

  return (
    <main className="admin-login-shell">
      <a className="admin-back-link" href="/"><ArrowLeft size={18} />返回公开网站</a>
      <section className="admin-login-card" aria-labelledby="login-title">
        <div className="admin-login-mark"><KeyRound aria-hidden="true" /></div>
        <p className="admin-kicker">PERSONAL EXPLORER / CMS</p>
        <h1 id="login-title">内容工作台</h1>
        <p className="admin-login-intro">编辑个人资料、实时预览草稿，并在确认后发布完整网站。</p>

        {cloudEnabled ? (
          <form onSubmit={submit} className="admin-login-form">
            <label htmlFor="admin-email">管理员邮箱</label>
            <div className="admin-input-with-icon"><Mail size={18} aria-hidden="true" /><input id="admin-email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} /></div>
            <p className="admin-help">系统只会向 Supabase 白名单中的邮箱发送登录链接。</p>
            <button className="admin-primary-button" type="submit" disabled={status === 'sending'}>
              {status === 'sending' ? '正在发送…' : '发送 Magic Link'}
            </button>
            <div className={`admin-inline-message is-${status}`} aria-live="polite">{message}</div>
          </form>
        ) : (
          <div className="admin-demo-panel">
            <Laptop aria-hidden="true" />
            <div><strong>本地演示模式</strong><p>尚未配置 Supabase。草稿只保存在当前浏览器，适合先体验编辑流程。</p></div>
            <button className="admin-primary-button" type="button" onClick={onDemo}>进入本地演示</button>
          </div>
        )}
      </section>
    </main>
  )
}
