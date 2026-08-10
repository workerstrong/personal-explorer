import { ImageUp, LoaderCircle } from 'lucide-react'
import { useState } from 'react'
import { CollectionEditor } from './CollectionEditor.jsx'
import { Field, StringListField, TextAreaField } from './AdminFields.jsx'

function UploadField({ label, path, value, updateField, repository, alt }) {
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  async function upload(event) {
    const file = event.target.files?.[0]
    if (!file) return
    setStatus('uploading'); setError('')
    try { updateField(path, await repository.uploadImage(file)); setStatus('ready') }
    catch (uploadError) { setError(uploadError.message); setStatus('error') }
    event.target.value = ''
  }
  return (
    <div className="admin-upload-field">
      {value ? <img src={value} alt={alt || ''} /> : <div className="admin-upload-placeholder"><ImageUp aria-hidden="true" /><span>尚未选择图片</span></div>}
      <div>
        <label className="admin-upload-button">{status === 'uploading' ? <LoaderCircle className="is-spinning" /> : <ImageUp />} {status === 'uploading' ? '上传中…' : label}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={upload} disabled={status === 'uploading'} /></label>
        <p className="admin-help">云端最高 8 MB；建议使用 WebP，图片会保存到 Supabase Storage。</p>
        {error && <p className="admin-field-error" role="alert">{error}</p>}
      </div>
    </div>
  )
}

export function ContentEditor({ section, draft, errors, updateField, replaceDraft, repository }) {
  const common = { draft, replaceDraft }
  if (section === 'about') return (
    <fieldset className="admin-form-section"><legend>关于我</legend><p className="admin-section-intro">段落和个人事实都可以自由增删及排序。</p>
      <Field label="弹窗标题" path="about.title" value={draft.about.title} onChange={updateField} />
      <CollectionEditor {...common} title="介绍段落" path="about.paragraphs" type="paragraph" items={draft.about.paragraphs} addLabel="添加段落" minimum={1}>
        {(item, index) => <TextAreaField label={`段落 ${index + 1}`} path={`about.paragraphs.${index}`} value={item} onChange={updateField} error={index === 0 ? errors.about : undefined} rows={5} />}
      </CollectionEditor>
      <CollectionEditor {...common} title="个人事实" path="about.facts" type="fact" items={draft.about.facts} addLabel="添加事实">
        {(_, index) => <div className="admin-field-row"><Field label="标签" path={`about.facts.${index}.label`} value={draft.about.facts[index].label} onChange={updateField} /><Field label="内容" path={`about.facts.${index}.value`} value={draft.about.facts[index].value} onChange={updateField} /></div>}
      </CollectionEditor>
    </fieldset>
  )

  if (section === 'education') return <CollectionEditor {...common} title="教育经历" description="拖动手柄排序，也可以使用上移/下移按钮。" path="education" type="education" items={draft.education} addLabel="添加教育经历">
    {(_, index) => <><div className="admin-field-row"><Field label="学校" path={`education.${index}.school`} value={draft.education[index].school} onChange={updateField} /><Field label="时期" path={`education.${index}.period`} value={draft.education[index].period} onChange={updateField} /></div><Field label="课程 / 专业" path={`education.${index}.program`} value={draft.education[index].program} onChange={updateField} /><TextAreaField label="说明" path={`education.${index}.description`} value={draft.education[index].description} onChange={updateField} rows={3} /></>}
  </CollectionEditor>

  if (section === 'projects') return <CollectionEditor {...common} title="项目" description="每个项目支持标签和外部链接。" path="projects" type="project" items={draft.projects} addLabel="添加项目">
    {(_, index) => <><div className="admin-field-row"><Field label="项目名称" path={`projects.${index}.title`} value={draft.projects[index].title} onChange={updateField} /><Field label="项目类型" path={`projects.${index}.type`} value={draft.projects[index].type} onChange={updateField} /></div><TextAreaField label="项目说明" path={`projects.${index}.description`} value={draft.projects[index].description} onChange={updateField} rows={4} /><StringListField label="标签" path={`projects.${index}.tags`} items={draft.projects[index].tags} onChange={updateField} itemLabel="标签" /><div className="admin-field-row"><Field label="链接" type="url" path={`projects.${index}.link`} value={draft.projects[index].link} onChange={updateField} /><Field label="链接文字" path={`projects.${index}.linkLabel`} value={draft.projects[index].linkLabel} onChange={updateField} /></div></>}
  </CollectionEditor>

  if (section === 'skills') return <CollectionEditor {...common} title="技能组" path="skillGroups" type="skillGroup" items={draft.skillGroups} addLabel="添加技能组">
    {(_, index) => <><Field label="组名" path={`skillGroups.${index}.title`} value={draft.skillGroups[index].title} onChange={updateField} /><StringListField label="技能" path={`skillGroups.${index}.items`} items={draft.skillGroups[index].items} onChange={updateField} itemLabel="技能" /></>}
  </CollectionEditor>

  if (section === 'interests') return <CollectionEditor {...common} title="兴趣" path="interests" type="interest" items={draft.interests} addLabel="添加兴趣">
    {(_, index) => <><Field label="名称" path={`interests.${index}.title`} value={draft.interests[index].title} onChange={updateField} /><TextAreaField label="说明" path={`interests.${index}.note`} value={draft.interests[index].note} onChange={updateField} rows={3} /></>}
  </CollectionEditor>

  if (section === 'socials') return <CollectionEditor {...common} title="社交链接" path="socials" type="social" items={draft.socials} addLabel="添加链接">
    {(_, index) => <><div className="admin-field-row"><Field label="平台" path={`socials.${index}.platform`} value={draft.socials[index].platform} onChange={updateField} /><Field label="账号显示" path={`socials.${index}.handle`} value={draft.socials[index].handle} onChange={updateField} /></div><Field label="网址" type="url" path={`socials.${index}.url`} value={draft.socials[index].url} onChange={updateField} /></>}
  </CollectionEditor>

  if (section === 'goals') return <CollectionEditor {...common} title="未来目标" path="goals" type="goal" items={draft.goals} addLabel="添加目标">
    {(item, index) => <Field label={`目标 ${index + 1}`} path={`goals.${index}`} value={item} onChange={updateField} />}
  </CollectionEditor>

  return <CollectionEditor {...common} title="图片库" description="上传图片后可用滑杆选择卡片和画廊中的视觉焦点。" path="gallery" type="gallery" items={draft.gallery} addLabel="添加图片">
    {(image, index) => <><UploadField label="上传或替换图片" path={`gallery.${index}.src`} value={image.src} updateField={updateField} repository={repository} alt={image.alt} /><Field label="图片网址" type="url" path={`gallery.${index}.src`} value={image.src} onChange={updateField} /><Field label="替代文字" path={`gallery.${index}.alt`} value={image.alt} onChange={updateField} error={errors[`gallery.${index}.alt`]} helper="描述图片内容，供屏幕阅读器使用。" /><Field label="图片说明" path={`gallery.${index}.caption`} value={image.caption} onChange={updateField} /><div className="admin-field-row"><Field label={`水平焦点 ${image.focusX ?? 50}%`} type="range" min="0" max="100" path={`gallery.${index}.focusX`} value={image.focusX ?? 50} onChange={updateField} /><Field label={`垂直焦点 ${image.focusY ?? 50}%`} type="range" min="0" max="100" path={`gallery.${index}.focusY`} value={image.focusY ?? 50} onChange={updateField} /></div></>}
  </CollectionEditor>
}

export { UploadField }
