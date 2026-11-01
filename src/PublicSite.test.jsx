import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import { PublicSite } from './PublicSite'
import { createInitialContent, normalizeProfileContent } from './content/profileSchema'

const published = (id = '大風歌') => normalizeProfileContent({
  cards: [{ id, title: '大風歌', contentType: 'custom', customContent: { paragraphs: ['大風起兮雲飛揚'] } }],
})

describe('published card navigation', () => {
  beforeEach(() => {
    history.replaceState(null, '', '/')
    localStorage.clear()
  })

  it.each(['Catchphrase ', '大風歌', '大風歌 / 100%'])('opens, closes and reopens a card with ID %s', async (id) => {
    const user = userEvent.setup()
    render(<PublicSite profileData={published(id)} />)

    await user.click(screen.getByRole('button', { name: 'Open 大風歌' }))
    expect(await screen.findByRole('dialog', { name: '大風歌' })).toHaveTextContent('大風起兮雲飛揚')
    expect(window.location.hash).toBe(`#${encodeURIComponent(id)}`)
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Open 大風歌' }))
    expect(await screen.findByRole('dialog', { name: '大風歌' })).toBeInTheDocument()
  })

  it('opens an encoded Chinese card link on initial render', () => {
    history.replaceState(null, '', `/#${encodeURIComponent('大風歌')}`)
    render(<PublicSite profileData={published()} />)
    expect(screen.getByRole('dialog', { name: '大風歌' })).toBeInTheDocument()
  })

  it('opens a shared card link after published content finishes loading', () => {
    history.replaceState(null, '', `/#${encodeURIComponent('大風歌')}`)
    const { rerender } = render(<PublicSite profileData={createInitialContent()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    rerender(<PublicSite profileData={published()} />)
    expect(screen.getByRole('dialog', { name: '大風歌' })).toBeInTheDocument()
  })

  it('ignores a malformed encoded fragment without breaking the page', () => {
    history.replaceState(null, '', '/#%E0%A4%A')
    render(<PublicSite profileData={published()} />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Open 大風歌' })).toBeInTheDocument()
  })
})
