import { describe, expect, it } from 'vitest'
import { createInitialContent, normalizeProfileContent, updateAtPath, validateProfileContent } from './profileSchema.js'

describe('profile content schema', () => {
  it('accepts the initial centralized profile', () => {
    expect(validateProfileContent(createInitialContent()).isValid).toBe(true)
  })

  it('updates nested values without mutating the source', () => {
    const source = createInitialContent()
    const updated = updateAtPath(source, 'about.paragraphs.0', 'A new introduction')

    expect(updated.about.paragraphs[0]).toBe('A new introduction')
    expect(source.about.paragraphs[0]).not.toBe('A new introduction')
  })

  it('preserves legacy custom text and links as editable paragraphs', () => {
    const legacy = { cards: [{ id: 'custom', customContent: { body: '第一行\n第二行\r\n\r\n另一段', links: [{ label: '链接', url: 'https://example.com' }] } }] }
    const content = normalizeProfileContent(legacy)

    expect(content.cards[0].customContent.paragraphs).toEqual(['第一行\n第二行', '另一段'])
    expect(content.cards[0].customContent.links[0]).toMatchObject(legacy.cards[0].customContent.links[0])
    expect(legacy.cards[0].customContent.body).toBe('第一行\n第二行\r\n\r\n另一段')
  })

  it('keeps blank, multiline and deliberately removed custom paragraphs on reload', () => {
    for (const paragraphs of [[], ['', '一段\n\n仍在同一格', '重复', '重复']]) {
      const content = normalizeProfileContent({ cards: [{ id: 'custom', customContent: { body: '旧正文', paragraphs } }] })
      expect(normalizeProfileContent(JSON.parse(JSON.stringify(content))).cards[0].customContent.paragraphs).toEqual(paragraphs)
    }
  })

  it('reports required identity and card fields', () => {
    let content = updateAtPath(createInitialContent(), 'name', '')
    content = updateAtPath(content, 'cards.0.title', '')
    const result = validateProfileContent(content)

    expect(result.isValid).toBe(false)
    expect(result.errors.name).toBeTruthy()
    expect(result.errors['cards.0.title']).toBeTruthy()
  })

  it('migrates old goal text without losing order, duplicates or blank entries', () => {
    const content = normalizeProfileContent({ schemaVersion: 3, goals: ['第一项', '', '第一项'] })
    expect(content.schemaVersion).toBe(4)
    expect(content.goals.map(({ text, url }) => ({ text, url }))).toEqual([
      { text: '第一项', url: '' }, { text: '', url: '' }, { text: '第一项', url: '' },
    ])
    expect(new Set(content.goals.map((goal) => goal._id)).size).toBe(3)
    expect(normalizeProfileContent(JSON.parse(JSON.stringify(content))).goals).toEqual(content.goals)
    expect(normalizeProfileContent({ goals: [] }).goals).toEqual([])
  })

  it('preserves linked goals alongside legacy text on reload', () => {
    const content = normalizeProfileContent({ goals: ['旧目标', { _id: 'saved-goal', text: '新目标', url: 'https://example.com/goal' }] })
    expect(content.goals[0]).toMatchObject({ text: '旧目标', url: '' })
    expect(content.goals[1]).toEqual({ _id: 'saved-goal', text: '新目标', url: 'https://example.com/goal' })
    expect(normalizeProfileContent(JSON.parse(JSON.stringify(content))).goals).toEqual(content.goals)
  })

  it('still validates version three publications with raw text goals', () => {
    const content = { ...createInitialContent(), schemaVersion: 3, goals: ['原目标', '重复', '重复', ''] }
    expect(validateProfileContent(content).isValid).toBe(true)
    expect(content.goals).toEqual(['原目标', '重复', '重复', ''])
  })

  it.each(['', '   ', 'https://example.com/goal', ' http://example.com/goal '])('accepts an optional goal URL: %s', (url) => {
    const content = normalizeProfileContent({ goals: [{ text: '目标', url }] })
    expect(validateProfileContent(content).isValid).toBe(true)
  })

  it.each(['https://', 'https:example.com', 'https:/example.com', 'example.com', '/goal', '//example.com', 'javascript:alert(1)', 'data:text/html,test'])('rejects an invalid goal URL: %s', (url) => {
    const content = normalizeProfileContent({ goals: [{ text: '目标', url }] })
    expect(validateProfileContent(content).errors['goals.0.url']).toBeTruthy()
  })
})
