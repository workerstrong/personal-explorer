import { Copy, GripVertical, Plus, Trash2, ArrowDown, ArrowUp } from 'lucide-react'
import { useState } from 'react'
import { addItem, createCollectionItem, duplicateItem, moveItem, removeItem } from '../content/contentModel.js'

function ConfirmDelete({ onConfirm, label }) {
  const [armed, setArmed] = useState(false)
  return armed ? (
    <span className="admin-confirm-delete">
      <button type="button" className="is-danger" onClick={() => { onConfirm(); setArmed(false) }}>确认删除</button>
      <button type="button" onClick={() => setArmed(false)}>取消</button>
    </span>
  ) : <button type="button" onClick={() => setArmed(true)} aria-label={`删除${label}`}><Trash2 size={16} /></button>
}

export function CollectionEditor({ title, description, path, type, create, items, draft, replaceDraft, children, addLabel = '添加项目', minimum = 0 }) {
  const [dragIndex, setDragIndex] = useState(null)
  const createItem = () => replaceDraft((current) => addItem(current, path, create ? create() : createCollectionItem(type)))

  function move(from, to) { replaceDraft((current) => moveItem(current, path, from, to)) }

  return (
    <section className="admin-collection" aria-labelledby={`${path}-title`}>
      <div className="admin-collection-heading">
        <div><h2 id={`${path}-title`}>{title}</h2>{description && <p>{description}</p>}</div>
        <button className="admin-add-button" type="button" onClick={createItem}><Plus size={17} />{addLabel}</button>
      </div>
      {!items.length && <div className="admin-empty-state"><p>这里还没有内容。</p><button type="button" onClick={createItem}>创建第一项</button></div>}
      <div className="admin-sortable-list">
        {items.map((item, index) => (
          <article className={`admin-sortable-item ${dragIndex === index ? 'is-dragging' : ''}`} key={item?._id || `${path}-${index}`} onDragOver={(event) => event.preventDefault()} onDrop={() => { if (dragIndex !== null) move(dragIndex, index); setDragIndex(null) }}>
            <header>
              <button className="admin-drag-handle" type="button" draggable onDragStart={() => setDragIndex(index)} onDragEnd={() => setDragIndex(null)} aria-label={`拖动${title}第 ${index + 1} 项`}><GripVertical size={18} /></button>
              <strong>{String(index + 1).padStart(2, '0')}</strong>
              <div className="admin-item-actions">
                <button type="button" onClick={() => move(index, index - 1)} disabled={index === 0} aria-label="上移"><ArrowUp size={16} /></button>
                <button type="button" onClick={() => move(index, index + 1)} disabled={index === items.length - 1} aria-label="下移"><ArrowDown size={16} /></button>
                <button type="button" onClick={() => replaceDraft((current) => duplicateItem(current, path, index))} aria-label="复制"><Copy size={16} /></button>
                {items.length > minimum && <ConfirmDelete label={`${title}第 ${index + 1} 项`} onConfirm={() => replaceDraft((current) => removeItem(current, path, index))} />}
              </div>
            </header>
            <div className="admin-sortable-body">{children(item, index)}</div>
          </article>
        ))}
      </div>
    </section>
  )
}
