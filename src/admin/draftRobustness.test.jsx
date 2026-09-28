import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from '../App.jsx'
import { ErrorBoundary } from '../components/ErrorBoundary.jsx'
import { normalizeProfileContent, validateProfileContent } from '../content/profileSchema.js'

const DRAFT_KEY = 'personal-explorer-cms-draft-v1'

function seedDraft(mutate) {
  const content = normalizeProfileContent({})
  mutate(content)
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ content, revision: 1 }))
}

async function openSection(user, section) {
  render(<App />)
  await user.click(await screen.findByRole('button', { name: /进入本地演示/ }, { timeout: 20000 }))
  await user.click(await screen.findByRole('button', { name: section, exact: true }, { timeout: 20000 }))
}

describe('normalizeProfileContent repairs malformed drafts', () => {
  it('coerces non-array skill items, project tags, paragraphs and goals into arrays', () => {
    const content = normalizeProfileContent({
      about: { paragraphs: 'single paragraph stored as a string' },
      goals: 'one goal',
      skillGroups: [{ title: '數碼', items: 'w, Storytelling' }, { title: 'Build' }],
      projects: [{ title: 'P', tags: 'a,b' }],
    })

    expect(content.about.paragraphs).toEqual(['single paragraph stored as a string'])
    expect(content.goals).toEqual(['one goal'])
    expect(content.skillGroups[0].items).toEqual(['w, Storytelling'])
    expect(content.skillGroups[1].items).toEqual([])
    expect(content.projects[0].tags).toEqual(['a,b'])
    expect(validateProfileContent(content).errors.about).toBeUndefined()
  })

  it('drops non-object collection entries instead of crashing on them', () => {
    const content = normalizeProfileContent({ education: ['oops', { school: 'Real school' }], skillGroups: [null, { title: 'Ok' }] })

    expect(content.education).toHaveLength(1)
    expect(content.education[0].school).toBe('Real school')
    expect(content.skillGroups).toHaveLength(1)
    expect(content.skillGroups[0].items).toEqual([])
  })
})

describe('the workspace survives malformed stored drafts', () => {
  beforeEach(() => {
    history.replaceState(null, '', '/admin')
    localStorage.clear()
  })

  it('keeps rendering the skills editor when a group items field is a bare string', async () => {
    seedDraft((content) => {
      content.skillGroups = [
        { _id: 'skill-1', title: '數碼', items: 'w,Storytelling' },
        { _id: 'skill-2', title: 'Build', items: undefined },
      ]
    })
    const user = userEvent.setup()
    await openSection(user, '技能')

    expect(document.querySelector('.admin-workspace')).toBeTruthy()
    expect(document.getElementById('skillGroups.0.items.0')).toHaveValue('w,Storytelling')
    expect(document.querySelectorAll('[id^="skillGroups.1.items"]').length).toBe(0)
  })

  it('keeps rendering the projects editor when tags are a bare string', async () => {
    seedDraft((content) => {
      content.projects = [{ _id: 'project-1', title: 'P', type: 't', description: 'd', tags: 'a,b', link: 'https://', linkLabel: 'x' }]
    })
    const user = userEvent.setup()
    await openSection(user, '项目')

    expect(document.querySelector('.admin-workspace')).toBeTruthy()
    expect(document.getElementById('projects.0.tags.0')).toHaveValue('a,b')
  })
})

describe('ErrorBoundary', () => {
  it('shows a recoverable message instead of a blank page', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    function Broken() { throw new Error('boom') }
    render(<ErrorBoundary title="网站载入失败"><Broken /></ErrorBoundary>)

    expect(screen.getByRole('alert')).toHaveTextContent('网站载入失败')
    expect(screen.getByText('boom')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '重新载入' })).toBeInTheDocument()
    spy.mockRestore()
  })
})
