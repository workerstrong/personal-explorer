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

  it('opens a link card through a native external link without a dialog or hash change', async () => {
    const user = userEvent.setup()
    const content = normalizeProfileContent({ cards: [{ id: 'goals', title: 'Future goals', interaction: 'link', linkUrl: 'https://example.com/goals' }] })
    render(<PublicSite profileData={content} />)

    const link = screen.getByRole('link', { name: /Future goals/ })
    expect(link).toHaveAttribute('href', 'https://example.com/goals')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noreferrer'))
    expect(screen.queryByRole('button', { name: /Future goals/ })).not.toBeInTheDocument()
    await user.click(link)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(window.location.hash).toBe('')
  })

  it('does not open a link card as a dialog from an old card hash', () => {
    history.replaceState(null, '', '/#goals')
    const content = normalizeProfileContent({ cards: [{ id: 'goals', title: 'Future goals', interaction: 'link', linkUrl: 'https://example.com/goals' }] })
    render(<PublicSite profileData={content} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Future goals/ })).toHaveAttribute('href', 'https://example.com/goals')
  })

  it('removes an open preview dialog when its card switches to a direct link', async () => {
    const user = userEvent.setup()
    const content = published()
    const { rerender } = render(<PublicSite profileData={content} embedded />)
    await user.click(screen.getByRole('button', { name: 'Open 大風歌' }))
    expect(screen.getByRole('dialog', { name: '大風歌' })).toBeInTheDocument()

    const next = normalizeProfileContent({ ...content, cards: [{ ...content.cards[0], interaction: 'link', linkUrl: 'https://example.com/goals' }] })
    rerender(<PublicSite profileData={next} embedded />)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: /大風歌/ })).toHaveAttribute('href', 'https://example.com/goals')
  })

  it.each(['javascript:alert(1)', 'data:text/html,test', 'https:example.com', '/relative', ''])('does not expose an unsafe or missing card URL: %s', (linkUrl) => {
    const content = normalizeProfileContent({ cards: [{ id: 'goals', title: 'Future goals', interaction: 'link', linkUrl }] })
    render(<PublicSite profileData={content} />)

    expect(screen.queryByRole('link', { name: /Future goals/ })).not.toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.querySelector('a[href^="javascript:"], a[href^="data:"]')).not.toBeInTheDocument()
  })
})
