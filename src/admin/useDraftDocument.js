import { useCallback, useEffect, useRef, useState } from 'react'
import { updateAtPath } from '../content/profileSchema'

export function useDraftDocument(repository, enabled) {
  const [draft, setDraft] = useState(null)
  const [revision, setRevision] = useState(0)
  const [saveStatus, setSaveStatus] = useState('loading')
  const [lastSavedAt, setLastSavedAt] = useState(null)
  const [error, setError] = useState(null)
  const [conflict, setConflict] = useState(false)
  const revisionRef = useRef(0)
  const contentRef = useRef(null)
  const lastSavedRef = useRef('')
  const timerRef = useRef(null)
  const pendingRef = useRef(null)
  const savingPromiseRef = useRef(null)

  const load = useCallback(async () => {
    if (!enabled) return
    setSaveStatus('loading')
    setError(null)
    try {
      const result = await repository.loadDraft()
      setDraft(result.content)
      contentRef.current = result.content
      revisionRef.current = result.revision
      setRevision(result.revision)
      lastSavedRef.current = JSON.stringify(result.content)
      setSaveStatus('saved')
      setConflict(false)
    } catch (loadError) {
      setError(loadError.message || '无法读取草稿。')
      setSaveStatus('error')
    }
  }, [enabled, repository])

  useEffect(() => { load() }, [load])

  async function processQueue() {
    if (savingPromiseRef.current) return savingPromiseRef.current
    savingPromiseRef.current = (async () => {
      while (pendingRef.current) {
        const snapshot = pendingRef.current
        pendingRef.current = null
        setSaveStatus('saving')
        setError(null)
        try {
          const result = await repository.saveDraft(snapshot, revisionRef.current)
          revisionRef.current = result.revision
          setRevision(result.revision)
          lastSavedRef.current = JSON.stringify(snapshot)
          setLastSavedAt(result.updatedAt ?? new Date().toISOString())
        } catch (saveError) {
          pendingRef.current = null
          if (saveError.code === 'CONTENT_CONFLICT') {
            setConflict(true)
            setError('这份内容已在另一个标签页中更新。')
          } else {
            setError(saveError.message || '草稿保存失败。')
          }
          setSaveStatus('error')
          throw saveError
        }
      }
      const currentSerialized = JSON.stringify(contentRef.current)
      setSaveStatus(currentSerialized === lastSavedRef.current ? 'saved' : 'unsaved')
    })().finally(() => { savingPromiseRef.current = null })
    return savingPromiseRef.current
  }

  const enqueueSave = useCallback((snapshot) => {
    pendingRef.current = structuredClone(snapshot)
    return processQueue()
  }, [])

  useEffect(() => {
    if (!draft || !enabled || conflict) return undefined
    contentRef.current = draft
    if (JSON.stringify(draft) === lastSavedRef.current) return undefined
    setSaveStatus('unsaved')
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => { enqueueSave(draft).catch(() => {}) }, 800)
    return () => clearTimeout(timerRef.current)
  }, [conflict, draft, enabled, enqueueSave])

  const updateField = useCallback((path, value) => {
    setDraft((current) => updateAtPath(current, path, value))
  }, [])

  const saveNow = useCallback(async (snapshot = contentRef.current) => {
    clearTimeout(timerRef.current)
    if (!snapshot || JSON.stringify(snapshot) === lastSavedRef.current) return revisionRef.current
    contentRef.current = snapshot
    await enqueueSave(snapshot)
    return revisionRef.current
  }, [enqueueSave])

  return {
    draft,
    revision,
    saveStatus,
    lastSavedAt,
    error,
    conflict,
    updateField,
    saveNow,
    reload: load,
  }
}
