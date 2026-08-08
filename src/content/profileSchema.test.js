import { describe, expect, it } from 'vitest'
import { createInitialContent, updateAtPath, validateProfileContent } from './profileSchema.js'

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

  it('reports required identity and card fields', () => {
    let content = updateAtPath(createInitialContent(), 'name', '')
    content = updateAtPath(content, 'cards.0.title', '')
    const result = validateProfileContent(content)

    expect(result.isValid).toBe(false)
    expect(result.errors.name).toBeTruthy()
    expect(result.errors['cards.0.title']).toBeTruthy()
  })
})
