import { createCard, createCollectionItem } from '../content/contentModel.js'
import { CollectionEditor } from './CollectionEditor.jsx'
import { Field, SelectField, TextAreaField, ToggleField } from './AdminFields.jsx'
import { UploadField } from './ContentEditor.jsx'

const contentTypes = [
  ['about', '关于我'], ['projects', '项目'], ['education', '教育'], ['skills', '技能'], ['gallery', '图片库'],
  ['interests', '兴趣'], ['socials', '社交链接'], ['goals', '未来目标'], ['contact', '联系'], ['custom', '自定义内容'],
].map(([value, label]) => ({ value, label }))
const tones = ['ink', 'blue', 'cream', 'violet', 'yellow', 'mint', 'orange', 'black', 'photo'].map((value) => ({ value, label: value }))
const sizes = [['standard', '标准 1×1'], ['wide', '宽 2×1'], ['tall', '高 1×2'], ['hero', '主角 2×2'], ['full', '全宽 4×1']].map(([value, label]) => ({ value, label }))
const icons = ['user', 'folder', 'graduation', 'sparkles', 'image', 'heart', 'share', 'compass', 'mail'].map((value) => ({ value, label: value }))
const interactions = [{ value: 'modal', label: '打开弹窗' }, { value: 'expand', label: '原位展开' }]

export function CardBuilder({ draft, errors, updateField, replaceDraft, repository }) {
  return (
    <fieldset className="admin-form-section"><legend>Bento 页面构建器</legend><p className="admin-section-intro">拖动卡片排序，选择尺寸、颜色、图标和展开方式。所有拖拽操作都有键盘按钮替代。</p>
      <CollectionEditor title="首页卡片" path="cards" items={draft.cards} draft={draft} replaceDraft={replaceDraft} create={createCard} addLabel="新增卡片" minimum={1}>
        {(card, index) => (
          <details className="admin-card-details" open={index === 0 || card.contentType === 'custom'}>
            <summary><span className={`admin-tone-dot tone-${card.tone}`} /> <strong>{card.title || '未命名卡片'}</strong><span>{card.visible ? card.size : '已隐藏'}</span></summary>
            <div className="admin-card-settings">
              <ToggleField label="在公开网站显示" path={`cards.${index}.visible`} checked={card.visible !== false} onChange={updateField} helper="隐藏不会删除内容。" />
              <div className="admin-field-row"><Field label="唯一 ID" path={`cards.${index}.id`} value={card.id} onChange={updateField} error={errors[`cards.${index}.id`]} helper="发布后尽量不要修改，以免旧链接失效。" /><SelectField label="内容来源" path={`cards.${index}.contentType`} value={card.contentType} onChange={updateField} options={contentTypes} /></div>
              <div className="admin-field-row"><Field label="眉题" path={`cards.${index}.eyebrow`} value={card.eyebrow} onChange={updateField} /><Field label="标题" path={`cards.${index}.title`} value={card.title} onChange={updateField} error={errors[`cards.${index}.title`]} required /></div>
              <TextAreaField label="卡片摘要" path={`cards.${index}.summary`} value={card.summary} onChange={updateField} error={errors[`cards.${index}.summary`]} required rows={3} />
              <div className="admin-field-grid-3"><SelectField label="尺寸" path={`cards.${index}.size`} value={card.size} onChange={updateField} options={sizes} /><SelectField label="色调" path={`cards.${index}.tone`} value={card.tone} onChange={updateField} options={tones} /><SelectField label="图标" path={`cards.${index}.icon`} value={card.icon} onChange={updateField} options={icons} /></div>
              <SelectField label="点击交互" path={`cards.${index}.interaction`} value={card.interaction} onChange={updateField} options={interactions} helper="弹窗适合长内容；原位展开适合清单和短内容。" />
              <UploadField label="上传卡片封面" path={`cards.${index}.image`} value={card.image} updateField={updateField} repository={repository} alt="" />
              <Field label="封面网址（可选）" type="url" path={`cards.${index}.image`} value={card.image || ''} onChange={updateField} />
              {card.image && <><button type="button" className="admin-add-compact" onClick={() => updateField(`cards.${index}.image`, '')}>移除封面</button><div className="admin-field-row"><Field label={`水平焦点 ${card.focusX ?? 50}%`} type="range" min="0" max="100" path={`cards.${index}.focusX`} value={card.focusX ?? 50} onChange={updateField} /><Field label={`垂直焦点 ${card.focusY ?? 50}%`} type="range" min="0" max="100" path={`cards.${index}.focusY`} value={card.focusY ?? 50} onChange={updateField} /></div></>}
              {card.contentType === 'custom' && <section className="admin-custom-content"><h3>自定义详情</h3><TextAreaField label="正文" path={`cards.${index}.customContent.body`} value={card.customContent.body} onChange={updateField} rows={7} helper="用空行分隔段落。" />
                {card.customContent.links.map((link, linkIndex) => <div className="admin-custom-link" key={link._id}><Field label="链接文字" path={`cards.${index}.customContent.links.${linkIndex}.label`} value={link.label} onChange={updateField} /><Field label="网址" type="url" path={`cards.${index}.customContent.links.${linkIndex}.url`} value={link.url} onChange={updateField} /><button type="button" className="is-danger" onClick={() => updateField(`cards.${index}.customContent.links`, card.customContent.links.filter((_, itemIndex) => itemIndex !== linkIndex))}>删除链接</button></div>)}
                <button type="button" className="admin-add-compact" onClick={() => updateField(`cards.${index}.customContent.links`, [...card.customContent.links, createCollectionItem('customLink')])}>＋ 添加外部链接</button>
              </section>}
            </div>
          </details>
        )}
      </CollectionEditor>
    </fieldset>
  )
}
