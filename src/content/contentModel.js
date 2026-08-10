import { normalizeProfileContent, updateAtPath } from './profileSchema.js'

function id(prefix) {
  const cryptoApi = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined
  const suffix = typeof cryptoApi?.randomUUID === 'function'
    ? cryptoApi.randomUUID().slice(0, 8)
    : `${Date.now()}-${Math.random().toString(16).slice(2, 6)}`
  return `${prefix}-${suffix}`
}

const factories = {
  paragraph: () => 'Write a new paragraph here.',
  fact: () => ({ _id: id('fact'), label: 'New fact', value: 'Add a value' }),
  education: () => ({ _id: id('education'), school: 'School name', program: 'Programme', period: 'Year — Year', description: 'Add a short description.' }),
  skillGroup: () => ({ _id: id('skill'), title: 'New skill group', items: ['New skill'] }),
  interest: () => ({ _id: id('interest'), title: 'New interest', note: 'Why this matters to you.' }),
  project: () => ({ _id: id('project'), title: 'New project', type: 'Project type', description: 'What did you make or learn?', tags: ['New tag'], link: 'https://', linkLabel: 'View project' }),
  gallery: () => ({ _id: id('image'), src: '', alt: '', caption: 'New image', focusX: 50, focusY: 50 }),
  social: () => ({ _id: id('social'), platform: 'Platform', handle: '@username', url: 'https://' }),
  goal: () => 'Add a future goal',
  customLink: () => ({ _id: id('link'), label: 'Open link', url: 'https://' }),
}

export function createCollectionItem(type) {
  if (!factories[type]) throw new Error(`Unknown content item type: ${type}`)
  return factories[type]()
}

export function createCard() {
  const cardId = id('custom')
  return {
    id: cardId,
    eyebrow: 'Discover',
    title: 'New card',
    summary: 'Add a short introduction.',
    icon: 'sparkles',
    tone: 'cream',
    size: 'standard',
    interaction: 'modal',
    contentType: 'custom',
    visible: true,
    customContent: { body: 'Write the full content for this card.', links: [] },
  }
}

export function addItem(content, path, item) {
  const list = getAtPath(content, path)
  return updateAtPath(content, path, [...list, structuredClone(item)])
}

export function removeItem(content, path, index) {
  const list = getAtPath(content, path)
  return updateAtPath(content, path, list.filter((_, itemIndex) => itemIndex !== index))
}

export function duplicateItem(content, path, index) {
  const list = getAtPath(content, path)
  const copy = structuredClone(list[index])
  if (copy && typeof copy === 'object') copy._id = id('copy')
  if (path === 'cards') copy.id = id('custom')
  return updateAtPath(content, path, [...list.slice(0, index + 1), copy, ...list.slice(index + 1)])
}

export function moveItem(content, path, from, to) {
  const list = [...getAtPath(content, path)]
  if (from < 0 || to < 0 || from >= list.length || to >= list.length || from === to) return content
  const [item] = list.splice(from, 1)
  list.splice(to, 0, item)
  return updateAtPath(content, path, list)
}

export function importContent(json) {
  const parsed = typeof json === 'string' ? JSON.parse(json) : json
  return normalizeProfileContent(parsed)
}

function getAtPath(source, path) {
  return path.split('.').reduce((value, segment) => value[Number.isNaN(Number(segment)) ? segment : Number(segment)], source)
}
