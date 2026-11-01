import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App.jsx'
import { createInitialContent } from '../content/profileSchema.js'

const DRAFT_KEY = 'personal-explorer-cms-draft-v1'

describe('future goals editor', () => {
  beforeEach(() => {
    history.replaceState(null, '', '/admin')
    localStorage.clear()
  })

  async function openGoals(user) {
    const view = render(<App />)
    await user.click(await screen.findByRole('button', { name: /进入本地演示/ }, { timeout: 20000 }))
    await user.click(await screen.findByRole('button', { name: '目标', exact: true }))
    return view
  }

  it('pastes an individual goal link, saves it and restores it in the goals section', async () => {
    const content = createInitialContent()
    content.cards = [content.cards.find((card) => card.id === 'goals')]
    content.goals = ['原有目标']
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, revision: 1 }))
    const user = userEvent.setup()
    const view = await openGoals(user)

    expect(screen.getByLabelText('目标 1')).toHaveValue('原有目标')
    const url = screen.getByLabelText('目标链接 1（可选）')
    await user.click(url)
    await user.paste('https://example.com/goal')
    await user.click(screen.getByRole('button', { name: /expand future goals/i }))
    expect(screen.getByRole('link', { name: /^原有目标/ })).toHaveAttribute('href', 'https://example.com/goal')
    await waitFor(() => {
      expect(JSON.parse(localStorage.getItem(DRAFT_KEY)).content.goals[0]).toMatchObject({ text: '原有目标', url: 'https://example.com/goal' })
    }, { timeout: 2500 })

    view.unmount()
    await openGoals(user)
    expect(screen.getByLabelText('目标 1')).toHaveValue('原有目标')
    expect(screen.getByLabelText('目标链接 1（可选）')).toHaveValue('https://example.com/goal')
  })

  it('keeps each goal paired with its URL when reordering, deleting and adding goals', async () => {
    const content = createInitialContent()
    content.goals = [
      { _id: 'goal-first', text: '第一目标', url: 'https://example.com/first' },
      { _id: 'goal-second', text: '第二目标', url: 'https://example.com/second' },
    ]
    localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, revision: 1 }))
    const user = userEvent.setup()
    await openGoals(user)

    const goals = screen.getByRole('region', { name: '未来目标' })
    await user.click(within(goals).getAllByRole('button', { name: '上移', exact: true })[1])
    expect(screen.getByLabelText('目标 1')).toHaveValue('第二目标')
    expect(screen.getByLabelText('目标链接 1（可选）')).toHaveValue('https://example.com/second')
    await user.click(within(goals).getByRole('button', { name: '删除未来目标第 1 项' }))
    await user.click(within(goals).getByRole('button', { name: '确认删除' }))
    expect(screen.getByLabelText('目标 1')).toHaveValue('第一目标')
    expect(screen.getByLabelText('目标链接 1（可选）')).toHaveValue('https://example.com/first')
    await user.click(within(goals).getByRole('button', { name: '添加目标' }))
    expect(screen.getByLabelText('目标链接 2（可选）')).toHaveValue('')
    expect(screen.getByLabelText('目标 1')).toHaveValue('第一目标')
  })
})
