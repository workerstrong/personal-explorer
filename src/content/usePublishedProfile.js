import { useEffect, useState } from 'react'
import { createInitialContent, normalizeProfileContent } from './profileSchema'

export function usePublishedProfile() {
  const [content, setContent] = useState(() => createInitialContent())

  useEffect(() => {
    let active = true
    fetch('/content/profile.json', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Published content unavailable')))
      .then((value) => active && setContent(normalizeProfileContent(value)))
      .catch(() => {})
    return () => { active = false }
  }, [])

  return content
}
