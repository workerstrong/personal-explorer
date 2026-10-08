import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { normalizeProfileContent } from '../content/profileSchema.js'
import { ProfileContent } from './ProfileContent.jsx'

describe('ProfileContent', () => {
  it('renders each nonempty custom box as one paragraph, retaining line breaks and links', () => {
    const content = normalizeProfileContent({ cards: [{ id: 'custom', contentType: 'custom', customContent: { paragraphs: ['', '第一句\n\n第二句', '另一格', '  '], links: [{ label: '链接', url: 'https://example.com' }] } }] })
    const { container, getByRole } = render(<ProfileContent card={content.cards[0]} profileData={content} />)

    expect([...container.querySelectorAll('.custom-paragraph')].map((node) => node.textContent)).toEqual(['第一句\n\n第二句', '另一格'])
    expect(getByRole('link', { name: /^链接/ })).toHaveAttribute('href', 'https://example.com')
  })

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
