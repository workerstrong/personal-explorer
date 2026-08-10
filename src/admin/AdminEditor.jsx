import { AlertTriangle, Check, Cloud, Database, Download, Eye, FileText, FolderKanban, GalleryHorizontal, Globe2, GraduationCap, Heart, LayoutGrid, LogOut, Monitor, RefreshCw, Search, Send, Share2, Smartphone, Sparkles, Tablet, Upload, UserRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { PublicSite } from '../PublicSite.jsx'
import { importContent } from '../content/contentModel.js'
import { validateProfileContent } from '../content/profileSchema.js'
import { Field, TextAreaField } from './AdminFields.jsx'
import { CardBuilder } from './CardBuilder.jsx'
import { ContentEditor } from './ContentEditor.jsx'

const sections = [
  { id: 'identity', label: '基本资料', icon: UserRound }, { id: 'about', label: '关于我', icon: FileText },
  { id: 'projects', label: '项目', icon: FolderKanban }, { id: 'education', label: '教育', icon: GraduationCap },
  { id: 'skills', label: '技能', icon: Sparkles }, { id: 'interests', label: '兴趣', icon: Heart },
  { id: 'gallery', label: '图片', icon: GalleryHorizontal }, { id: 'socials', label: '社交', icon: Share2 },
  { id: 'goals', label: '目标', icon: Check }, { id: 'cards', label: '页面构建器', icon: LayoutGrid },
  { id: 'seo', label: 'SEO / 备份', icon: Search },
]
const devices = {
  desktop: { label: '桌面', icon: Monitor, width: 1440, zoom: 0.46 },
  tablet: { label: '平板', icon: Tablet, width: 768, zoom: 0.72 },
  mobile: { label: '手机', icon: Smartphone, width: 375, zoom: 0.92 },
}

function IdentityEditor({ draft, errors, updateField }) {
  return <fieldset className="admin-form-section"><legend>基本资料</legend><p className="admin-section-intro">这些内容会出现在页首、简介和联系入口。</p>
    <div className="admin-field-row"><Field label="公开姓名" path="name" value={draft.name} onChange={updateField} error={errors.name} required /><Field label="姓名缩写" path="initials" value={draft.initials} onChange={updateField} helper="建议使用 2–3 个字母。" /></div>
    <Field label="身份定位" path="role" value={draft.role} onChange={updateField} error={errors.role} required />
    <TextAreaField label="首页简介" path="introduction" value={draft.introduction} onChange={updateField} error={errors.introduction} required rows={5} />
    <div className="admin-field-row"><Field label="所在地" path="location" value={draft.location} onChange={updateField} error={errors.location} required /><Field label="当前状态" path="availability" value={draft.availability} onChange={updateField} /></div>
    <Field label="联系邮箱" path="email" type="email" value={draft.email} onChange={updateField} error={errors.email} required />
  </fieldset>
}

function SeoBackupEditor({ draft, errors, updateField, replaceDraft }) {
  const [importError, setImportError] = useState('')
  function download() {
    const blob = new Blob([JSON.stringify(draft, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob); const anchor = document.createElement('a')
    anchor.href = url; anchor.download = `personal-explorer-backup-${new Date().toISOString().slice(0, 10)}.json`; anchor.click(); URL.revokeObjectURL(url)
  }
  async function upload(event) {
    const file = event.target.files?.[0]; if (!file) return
    try { replaceDraft(importContent(await file.text())); setImportError('') }
    catch { setImportError('无法导入：文件不是有效的 Personal Explorer JSON。') }
    event.target.value = ''
  }
  return <fieldset className="admin-form-section"><legend>SEO 与备份</legend><p className="admin-section-intro">控制搜索摘要，并可导出或恢复完整内容。</p>
    <Field label="浏览器标题" path="seo.title" value={draft.seo.title} onChange={updateField} error={errors['seo.title']} required />
    <TextAreaField label="网站描述" path="seo.description" value={draft.seo.description} onChange={updateField} error={errors['seo.description']} helper={`${draft.seo.description.length}/160 个字符`} required rows={4} />
    <Field label="分享图片网址" path="seo.shareImage" type="url" value={draft.seo.shareImage} onChange={updateField} />
    <section className="admin-backup-panel"><h2>内容备份</h2><p>导出包括卡片布局、图片网址和全部资料。导入后会先成为草稿，仍需点击发布。</p><div><button type="button" onClick={download}><Download size={17} />导出 JSON</button><label><Upload size={17} />导入 JSON<input type="file" accept="application/json,.json" onChange={upload} /></label></div>{importError && <p role="alert" className="admin-field-error">{importError}</p>}</section>
  </fieldset>
}

export function AdminEditor({ repository, session, documentState, onSignOut }) {
  const [activeSection, setActiveSection] = useState('identity')
  const [device, setDevice] = useState('desktop')
  const [mobileMode, setMobileMode] = useState('edit')
  const [publishState, setPublishState] = useState({ status: 'idle', message: '' })
  const validation = useMemo(() => validateProfileContent(documentState.draft), [documentState.draft])
  const currentDevice = devices[device]

  async function publish() {
    if (!validation.isValid) { setPublishState({ status: 'error', message: `发布前需要修复 ${Object.keys(validation.errors).length} 个问题。` }); return }
    try {
      setPublishState({ status: 'saving', message: '正在保存最后修改…' })
      const savedRevision = await documentState.saveNow(documentState.draft)
      setPublishState({ status: 'publishing', message: repository.mode === 'local' ? '正在创建本地发布快照…' : '正在验证并触发 Vercel 部署…' })
      const result = await repository.publish(documentState.draft, savedRevision)
      if (repository.mode === 'local' || !result.deploymentReference) { setPublishState({ status: 'ready', message: repository.mode === 'local' ? '本地发布快照已创建。连接云端后可真正上线。' : '发布已提交。' }); return }
      for (let attempt = 0; attempt < 25; attempt += 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        const deployment = await repository.getDeploymentStatus(result.deploymentReference)
        if (deployment.status === 'READY') { setPublishState({ status: 'ready', message: '新版本已经上线。', url: deployment.url }); return }
        if (['ERROR', 'CANCELED'].includes(deployment.status)) throw new Error('Vercel 部署失败，公开网站仍保留旧版本。')
        setPublishState({ status: 'publishing', message: `部署进行中：${deployment.status || 'QUEUED'}` })
      }
      setPublishState({ status: 'queued', message: '部署仍在进行，可稍后通过 Vercel 查看状态。' })
    } catch (error) { setPublishState({ status: 'error', message: error.message || '发布失败，公开网站仍保留旧版本。' }) }
  }

  const saveLabel = { loading: '正在读取草稿…', unsaved: '有未保存修改', saving: '正在自动保存…', saved: documentState.lastSavedAt ? `已保存 ${new Date(documentState.lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : '草稿已保存', error: '保存遇到问题' }[documentState.saveStatus]
  const editorProps = { draft: documentState.draft, errors: validation.errors, updateField: documentState.updateField, replaceDraft: documentState.replaceDraft, repository }

  return <div className="admin-workspace" data-mobile-mode={mobileMode}>
    <header className="admin-topbar"><div className="admin-brand"><span>PE</span><div><strong>内容工作台</strong><small>Visual Builder</small></div></div><div className="admin-topbar-actions"><div className={`admin-save-status is-${documentState.saveStatus}`} aria-live="polite">{documentState.saveStatus === 'saved' ? <Check size={16} /> : documentState.saveStatus === 'error' ? <AlertTriangle size={16} /> : <Cloud size={16} />}{saveLabel}</div><button className="admin-publish-button" type="button" onClick={publish} disabled={['saving', 'publishing'].includes(publishState.status)}><Send size={17} />发布</button></div></header>
    <aside className="admin-sidebar" aria-label="编辑区域"><div className="admin-connection-badge"><Database size={16} /><span>{repository.mode === 'cloud' ? 'Supabase 已连接' : '本地演示模式'}</span></div><nav>{sections.map((section) => { const SectionIcon = section.icon; return <button type="button" key={section.id} className={activeSection === section.id ? 'is-active' : ''} onClick={() => { setActiveSection(section.id); setMobileMode('edit') }}><SectionIcon size={18} />{section.label}</button> })}</nav><div className="admin-sidebar-footer"><a href="/" target="_blank" rel="noreferrer"><Globe2 size={17} />查看公开网站<span className="sr-only">（在新标签页打开）</span></a><button type="button" onClick={onSignOut}><LogOut size={17} />退出登录</button><small>{session?.user?.email}</small></div></aside>
    <main className="admin-editor-pane" id="admin-main">
      {documentState.conflict && <section className="admin-conflict" role="alert"><AlertTriangle /><div><strong>检测到编辑冲突</strong><p>另一标签页保存了新版本。请重新加载云端草稿。</p><button type="button" onClick={documentState.reload}><RefreshCw size={15} />重新加载</button></div></section>}
      {publishState.message && <section className={`admin-publish-message is-${publishState.status}`} role={publishState.status === 'error' ? 'alert' : 'status'}><strong>{publishState.status === 'ready' ? '发布完成' : publishState.status === 'error' ? '发布未完成' : '发布状态'}</strong><span>{publishState.message}</span>{publishState.url && <a href={publishState.url} target="_blank" rel="noreferrer">打开线上网站</a>}</section>}
      {!validation.isValid && publishState.status === 'error' && <section className="admin-error-summary" role="alert"><strong>请先修复以下内容：</strong><ul>{Object.entries(validation.errors).map(([path, message]) => <li key={path}>{message}</li>)}</ul></section>}
      {activeSection === 'identity' && <IdentityEditor {...editorProps} />}
      {['about', 'projects', 'education', 'skills', 'interests', 'gallery', 'socials', 'goals'].includes(activeSection) && <ContentEditor section={activeSection} {...editorProps} />}
      {activeSection === 'cards' && <CardBuilder {...editorProps} />}
      {activeSection === 'seo' && <SeoBackupEditor {...editorProps} />}
    </main>
    <section className="admin-preview-pane" aria-label="网站草稿预览"><header className="admin-preview-toolbar"><div><Eye size={18} /><strong>实时预览</strong></div><div className="admin-device-switcher" role="group" aria-label="预览尺寸">{Object.entries(devices).map(([id, config]) => { const DeviceIcon = config.icon; return <button type="button" key={id} className={device === id ? 'is-active' : ''} onClick={() => setDevice(id)} aria-label={`${config.label}预览`}><DeviceIcon size={17} /><span>{config.label}</span></button> })}</div></header><div className="admin-preview-scroll"><div className="admin-preview-page" style={{ width: currentDevice.width, zoom: currentDevice.zoom }}><PublicSite profileData={documentState.draft} embedded /></div></div></section>
    <nav className="admin-mobile-tabs" aria-label="移动端工作区"><button type="button" className={mobileMode === 'edit' ? 'is-active' : ''} onClick={() => setMobileMode('edit')}><FileText size={18} />编辑</button><button type="button" className={mobileMode === 'preview' ? 'is-active' : ''} onClick={() => setMobileMode('preview')}><Eye size={18} />预览</button></nav>
  </div>
}
