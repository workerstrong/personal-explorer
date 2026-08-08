import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'
import { profile } from './data/profile'

describe('personal explorer', () => {
  beforeEach(() => {
    history.replaceState(null, '', '/')
    localStorage.clear()
  })

  it('renders the centralized profile and every exploration card', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: /choose what you want to discover/i })).toBeInTheDocument()
    expect(screen.getByText(profile.name)).toBeInTheDocument()
    profile.cards.forEach((card) => {
      expect(screen.getByRole('button', { name: new RegExp(card.title, 'i') })).toBeInTheDocument()
    })
  })

  it('opens a card as an accessible dialog and closes with Escape', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /open about me/i }))
    expect(screen.getByRole('dialog', { name: /about me/i })).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('expands future goals without opening a dialog', async () => {
    const user = userEvent.setup()
    render(<App />)
    const button = screen.getByRole('button', { name: /expand future goals/i })
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(profile.goals[0])).toBeVisible()
  })
})
