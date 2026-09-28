import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App.jsx'

async function enterAdmin(user, section) {
  render(<App />)
  await user.click(await screen.findByRole('button', { name: /进入本地演示/ }, { timeout: 20000 }))
  await user.click(await screen.findByRole('button', { name: section, exact: true }, { timeout: 20000 }))
}

describe('skills editor', () => {
  beforeEach(() => {
    history.replaceState(null, '', '/admin')
    localStorage.clear()
  })

  it('keeps every typed character in a skill row and keeps the caret there', async () => {
    const user = userEvent.setup()
    await enterAdmin(user, '技能')

    const input = document.getElementById('skillGroups.0.items.0')
    await user.clear(input)
    await user.type(input, 'React')

    const live = document.getElementById('skillGroups.0.items.0')
    expect(live).toHaveValue('React')
    expect(document.activeElement).toBe(live)
  })

  it('types into a freshly added skill row', async () => {
    const user = userEvent.setup()
    await enterAdmin(user, '技能')
    await user.click(screen.getAllByRole('button', { name: '＋ 添加技能' })[0])

    const rows = [...document.querySelectorAll('[id^="skillGroups.0.items"]')]
    const lastId = rows.at(-1).id
    await user.clear(rows.at(-1))
    await user.type(document.getElementById(lastId), 'TypeScript')

    const live = document.getElementById(lastId)
    expect(live).toHaveValue('TypeScript')
    expect(document.activeElement).toBe(live)
  })

  it('still reorders and deletes rows after typing', async () => {
    const user = userEvent.setup()
    await enterAdmin(user, '技能')

    await user.click(screen.getAllByRole('button', { name: '上移技能 2' })[0])
    expect([...document.querySelectorAll('[id^="skillGroups.0.items"]')].map((node) => node.value)[0]).toBe('Photography')

    await user.click(screen.getAllByRole('button', { name: '删除技能 1' })[0])
    expect(document.querySelectorAll('[id^="skillGroups.0.items"]').length).toBe(3)
  })

  it('types into project tags too', async () => {
    const user = userEvent.setup()
    await enterAdmin(user, '项目')

    const input = document.getElementById('projects.0.tags.0')
    await user.clear(input)
    await user.type(input, 'UI/UX')
    expect(document.getElementById('projects.0.tags.0')).toHaveValue('UI/UX')
  })
})
