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
})
