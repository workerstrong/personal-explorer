import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { normalizeProfileContent } from '../content/profileSchema.js'
import { ProfileContent } from './ProfileContent.jsx'

describe('ProfileContent', () => {
  it('renders duplicated skill labels without React key errors', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const content = normalizeProfileContent({ skillGroups: [{ title: '數碼', items: ['w', 'Storytelling', 'w'] }] })

    render(<ProfileContent card={{ id: 'skills', contentType: 'skills' }} profileData={content} />)

    expect(document.querySelectorAll('.tag-list li')).toHaveLength(3)
    expect(spy).not.toHaveBeenCalled()
    spy.mockRestore()
  })

  it('survives a list stored as a non-array value', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const content = normalizeProfileContent({})
    content.skillGroups = [{ title: 'Broken', items: 'not-an-array' }]

    render(<ProfileContent card={{ id: 'skills', contentType: 'skills' }} profileData={content} />)

    expect(document.querySelector('.skill-groups h3')?.textContent).toBe('Broken')
    expect(document.querySelectorAll('.tag-list li')).toHaveLength(0)
    spy.mockRestore()
  })
})
