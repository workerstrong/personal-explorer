import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../App.jsx'
import { profile } from '../data/profile.js'
import { createInitialContent } from '../content/profileSchema.js'

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

  it('offers a removable cover for every Bento card', async () => {
    const user = userEvent.setup()
    await enterDemo(user)
    await user.click(screen.getByRole('button', { name: '页面构建器' }))

    const coverUrls = await screen.findAllByLabelText('封面网址（可选）')
    expect(coverUrls).toHaveLength(profile.cards.length)
    await user.type(coverUrls[0], 'https://example.com/cover.webp')
    await user.click(screen.getAllByRole('button', { name: '移除封面' })[0])
    expect(coverUrls[0]).toHaveValue('')
  })

  it('adds, edits, saves and deletes custom text boxes while keeping legacy content', async () => {
    const content = createInitialContent()
    content.cards.push({ id: 'custom-text', title: '旧卡片', summary: '简介', contentType: 'custom', customContent: { body: '长路迢迢路漫漫', links: [] } })
    localStorage.setItem('personal-explorer-cms-draft-v1', JSON.stringify({ content, revision: 1 }))
    const user = userEvent.setup()
    const view = render(<App />)
    await user.click(await screen.findByRole('button', { name: /进入本地演示/ }))
    await user.click(await screen.findByRole('button', { name: '页面构建器' }))
    expect(await screen.findByLabelText('文字格 1')).toHaveValue('长路迢迢路漫漫')

    await user.click(screen.getByRole('button', { name: '添加文字格' }))
    await user.click(screen.getByRole('button', { name: '添加文字格' }))
    const second = screen.getByLabelText('文字格 2')
    await user.type(second, '第一句{enter}{enter}第二句')
    expect(second).toHaveValue('第一句\n\n第二句')
    expect(second).toHaveFocus()
    expect(screen.getAllByLabelText(/^文字格 \d$/)).toHaveLength(3)
    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('personal-explorer-cms-draft-v1'))
      expect(saved.content.cards.at(-1).customContent.paragraphs).toEqual(['长路迢迢路漫漫', '第一句\n\n第二句', ''])
    }, { timeout: 2500 })

    view.unmount()
    await enterDemo(user)
    await user.click(await screen.findByRole('button', { name: '页面构建器' }))
    expect(await screen.findByLabelText('文字格 2')).toHaveValue('第一句\n\n第二句')
    expect(screen.getByLabelText('文字格 3')).toHaveValue('')
    const paragraphs = screen.getByRole('region', { name: '正文' })
    for (let remaining = 3; remaining > 0; remaining -= 1) {
      await user.click(within(paragraphs).getByRole('button', { name: '删除正文第 1 项' }))
      await user.click(within(paragraphs).getByRole('button', { name: '确认删除' }))
      expect(within(paragraphs).queryAllByRole('textbox')).toHaveLength(remaining - 1)
    }
    await user.click(within(paragraphs).getByRole('button', { name: '添加文字格' }))
    expect(screen.getByLabelText('文字格 1')).toHaveValue('')
  }, 15000)
})
