function errorId(path) { return `error-${path.replaceAll('.', '-')}` }

export function Field({ label, path, value, onChange, error, helper, type = 'text', required = false, min, max }) {
  return (
    <div className="admin-field">
      <label htmlFor={path}>{label}{required && <span className="admin-required" aria-hidden="true"> *</span>}</label>
      <input id={path} type={type} value={value ?? ''} min={min} max={max} onChange={(event) => onChange(path, type === 'range' ? Number(event.target.value) : event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? errorId(path) : helper ? `${path}-help` : undefined} required={required} />
      {helper && !error && <p className="admin-help" id={`${path}-help`}>{helper}</p>}
      {error && <p className="admin-field-error" id={errorId(path)}>{error}</p>}
    </div>
  )
}

export function TextAreaField({ label, path, value, onChange, error, helper, rows = 4, required = false }) {
  return (
    <div className="admin-field">
      <label htmlFor={path}>{label}{required && <span className="admin-required" aria-hidden="true"> *</span>}</label>
      <textarea id={path} rows={rows} value={value ?? ''} onChange={(event) => onChange(path, event.target.value)} aria-invalid={Boolean(error)} aria-describedby={error ? errorId(path) : helper ? `${path}-help` : undefined} required={required} />
      {helper && !error && <p className="admin-help" id={`${path}-help`}>{helper}</p>}
      {error && <p className="admin-field-error" id={errorId(path)}>{error}</p>}
    </div>
  )
}

export function SelectField({ label, path, value, onChange, options, helper }) {
  return (
    <div className="admin-field">
      <label htmlFor={path}>{label}</label>
      <select id={path} value={value} onChange={(event) => onChange(path, event.target.value)}>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      {helper && <p className="admin-help">{helper}</p>}
    </div>
  )
}

export function ToggleField({ label, path, checked, onChange, helper }) {
  return (
    <div className="admin-toggle-field">
      <input id={path} type="checkbox" checked={checked} onChange={(event) => onChange(path, event.target.checked)} />
      <label htmlFor={path}><strong>{label}</strong>{helper && <span>{helper}</span>}</label>
    </div>
  )
}

export function StringListField({ label, path, items = [], onChange, itemLabel = '项目' }) {
  function update(index, value) { onChange(path, items.map((item, itemIndex) => itemIndex === index ? value : item)) }
  function remove(index) { onChange(path, items.filter((_, itemIndex) => itemIndex !== index)) }
  function move(index, offset) {
    const next = [...items]
    const target = index + offset
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(path, next)
  }
  return (
    <fieldset className="admin-inline-list">
      <legend>{label}</legend>
      {items.map((item, index) => (
        <div className="admin-inline-list-row" key={`${index}-${item}`}>
          <label className="sr-only" htmlFor={`${path}.${index}`}>{itemLabel} {index + 1}</label>
          <input id={`${path}.${index}`} value={item} onChange={(event) => update(index, event.target.value)} />
          <button type="button" onClick={() => move(index, -1)} disabled={index === 0} aria-label={`上移${itemLabel} ${index + 1}`}>↑</button>
          <button type="button" onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label={`下移${itemLabel} ${index + 1}`}>↓</button>
          <button type="button" className="is-danger" onClick={() => remove(index)} aria-label={`删除${itemLabel} ${index + 1}`}>×</button>
        </div>
      ))}
      <button className="admin-add-compact" type="button" onClick={() => onChange(path, [...items, `New ${itemLabel}`])}>＋ 添加{itemLabel}</button>
    </fieldset>
  )
}
