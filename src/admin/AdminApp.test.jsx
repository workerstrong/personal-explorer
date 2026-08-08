import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App'

describe('content workspace', () => {
  beforeEach(() => {
    history.replaceState(null, '', '/admin')
    localStorage.clear()
  })

  it('enters local demo mode and previews edits immediately', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: /进入本地演示/ }))
    const nameField = await screen.findByLabelText(/公开姓名/)
    await user.clear(nameField)
    await user.type(nameField, 'Ving Yap')

    expect(screen.getByText('Ving Yap')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/已保存|草稿已保存/)).toBeInTheDocument(), { timeout: 2500 })
  })

  it('blocks publishing invalid content with a visible error summary', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(await screen.findByRole('button', { name: /进入本地演示/ }))
    const nameField = await screen.findByLabelText(/公开姓名/)
    await user.clear(nameField)
    await user.click(screen.getByRole('button', { name: /^发布$/ }))

    expect(await screen.findByText(/请先修复以下内容/)).toBeInTheDocument()
  })
})
