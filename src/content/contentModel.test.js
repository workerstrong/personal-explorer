import { describe, expect, it } from 'vitest'
import { addItem, createCard, createCollectionItem, duplicateItem, importContent, moveItem, removeItem } from './contentModel.js'
import { CONTENT_SCHEMA_VERSION, createInitialContent, normalizeProfileContent } from './profileSchema.js'

describe('content model', () => {
  it('migrates version one arrays to stable version two identities', () => {
    const migrated = normalizeProfileContent({ schemaVersion: 1, projects: [{ title: 'Legacy project' }] })
    expect(migrated.schemaVersion).toBe(CONTENT_SCHEMA_VERSION)
    expect(migrated.projects[0]._id).toBe('project-1')
    expect(migrated.cards.every((card) => card.contentType && card.interaction && card.visible)).toBe(true)
  })

  it('adds, moves, duplicates and removes collection items immutably', () => {
    const original = createInitialContent()
    const added = addItem(original, 'projects', createCollectionItem('project'))
    const moved = moveItem(added, 'projects', added.projects.length - 1, 0)
    const duplicated = duplicateItem(moved, 'projects', 0)
    const removed = removeItem(duplicated, 'projects', 1)

    expect(original.projects).toHaveLength(3)
    expect(added.projects).toHaveLength(4)
    expect(moved.projects[0].title).toBe('New project')
    expect(duplicated.projects[0]._id).not.toBe(duplicated.projects[1]._id)
    expect(removed.projects).toHaveLength(4)
  })

  it('creates and imports a custom Bento card', () => {
    const content = addItem(createInitialContent(), 'cards', createCard())
    const imported = importContent(JSON.stringify(content))
    const card = imported.cards.at(-1)

    expect(card.contentType).toBe('custom')
    expect(card.customContent.body).toBeTruthy()
    expect(card.visible).toBe(true)
  })
})
