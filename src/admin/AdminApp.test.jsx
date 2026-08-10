import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App.jsx'

describe('content workspace', () => {
  beforeEach(() => {
    history.replaceState(null, '', '/admin')
    localStorage.clear()
  })

  async function enterDemo(user) {
    render(<App />)
    await user.click(await screen.findByRole('button', { name: /进入本地演示/ }))
  }

  it('enters local demo mode and previews edits immediately', async () => {
    const user = userEvent.setup()
    await enterDemo(user)
    const nameField = await screen.findByLabelText(/公开姓名/)
    await user.clear(nameField)
    await user.type(nameField, 'Ving Yap')
    expect(screen.getByText('Ving Yap')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/已保存|草稿已保存/)).toBeInTheDocument(), { timeout: 2500 })
  })

  it('blocks publishing invalid content with a visible error summary', async () => {
    const user = userEvent.setup()
    await enterDemo(user)
    await user.clear(await screen.findByLabelText(/公开姓名/))
    await user.click(screen.getByRole('button', { name: /^发布$/ }))
    expect(await screen.findByText(/请先修复以下内容/)).toBeInTheDocument()
  })

  it('adds projects and custom Bento cards from the visual editor', async () => {
    const user = userEvent.setup()
    await enterDemo(user)
    await user.click(screen.getByRole('button', { name: '项目' }))
    await user.click(await screen.findByRole('button', { name: '添加项目' }))
    expect(await screen.findByDisplayValue('New project')).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '页面构建器' }))
    await user.click(await screen.findByRole('button', { name: '新增卡片' }))
    expect(await screen.findByDisplayValue('New card')).toBeInTheDocument()
    expect(screen.getByText('自定义详情')).toBeInTheDocument()
  })
})
