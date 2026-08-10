import { profile as fallbackProfile } from '../data/profile.js'

export const SITE_ID = 'profile'
export const CONTENT_SCHEMA_VERSION = 2

const collections = ['education', 'skillGroups', 'interests', 'projects', 'gallery', 'socials']

function withStableIds(items, prefix) {
  return items.map((item, index) => ({ ...item, _id: item._id || `${prefix}-${index + 1}` }))
}

function normalizeCard(card, index) {
  const id = card.id || `card-${index + 1}`
  return {
    id,
    eyebrow: '',
    title: 'New card',
    summary: 'Add a short introduction.',
    icon: 'sparkles',
    tone: 'cream',
    size: 'standard',
    interaction: 'modal',
    contentType: id,
    visible: true,
    customContent: { body: '', links: [] },
    ...card,
    interaction: card.interaction || 'modal',
    contentType: card.contentType || id,
    visible: card.visible !== false,
    customContent: {
      body: card.customContent?.body || '',
      links: withStableIds(card.customContent?.links || [], `${id}-link`),
    },
  }
}

export function createInitialContent() {
  return normalizeProfileContent({
    ...fallbackProfile,
    schemaVersion: CONTENT_SCHEMA_VERSION,
    seo: fallbackProfile.seo ?? {
      title: `${fallbackProfile.name} — Personal Explorer`,
      description: fallbackProfile.introduction,
      shareImage: fallbackProfile.gallery?.[0]?.src ?? '',
    },
  })
}

export function normalizeProfileContent(value) {
  const source = value && typeof value === 'object' ? value : fallbackProfile
  const base = source === fallbackProfile ? fallbackProfile : { ...fallbackProfile, ...source }
  const normalized = {
    ...base,
    schemaVersion: CONTENT_SCHEMA_VERSION,
    about: {
      ...fallbackProfile.about,
      ...(source.about || {}),
      paragraphs: Array.isArray(source.about?.paragraphs) ? source.about.paragraphs : fallbackProfile.about.paragraphs,
      facts: withStableIds(Array.isArray(source.about?.facts) ? source.about.facts : fallbackProfile.about.facts, 'fact'),
    },
    seo: {
      title: `${source.name || fallbackProfile.name} — Personal Explorer`,
      description: source.introduction || fallbackProfile.introduction,
      shareImage: source.gallery?.[0]?.src || fallbackProfile.gallery?.[0]?.src || '',
      ...(source.seo || {}),
    },
    goals: Array.isArray(source.goals) ? source.goals : fallbackProfile.goals,
    cards: (Array.isArray(source.cards) ? source.cards : fallbackProfile.cards).map(normalizeCard),
  }

  collections.forEach((key) => {
    const items = Array.isArray(source[key]) ? source[key] : fallbackProfile[key]
    normalized[key] = withStableIds(items, key.replace(/s$/, ''))
  })

  return structuredClone(normalized)
}

export function validateProfileContent(content) {
  const errors = {}
  const warnings = []

  if (!content.name?.trim()) errors.name = '请输入公开姓名。'
  if (!content.role?.trim()) errors.role = '请输入身份或个人定位。'
  if (!content.introduction?.trim()) errors.introduction = '请输入个人简介。'
  if (!content.location?.trim()) errors.location = '请输入所在地。'
  if (!content.email?.trim()) errors.email = '请输入联系邮箱。'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.email)) errors.email = '邮箱格式不正确。'

  if (!content.about?.paragraphs?.some((paragraph) => paragraph.trim())) errors.about = '至少保留一段 About 内容。'
  if (!content.seo?.title?.trim()) errors['seo.title'] = '请输入浏览器标题。'
  if (!content.seo?.description?.trim()) errors['seo.description'] = '请输入网站描述。'
  if (!content.seo?.shareImage?.trim()) warnings.push('尚未设置社交分享图片。')
  if ((content.seo?.description?.length || 0) > 160) warnings.push('网站描述超过 160 个字符，搜索结果可能截断。')

  const visibleCards = content.cards?.filter((card) => card.visible !== false) || []
  if (!visibleCards.length) errors.cards = '至少保留一张可见卡片。'
  const seenIds = new Set()
  content.cards?.forEach((card, index) => {
    if (!card.id?.trim()) errors[`cards.${index}.id`] = `第 ${index + 1} 张卡片缺少 ID。`
    if (seenIds.has(card.id)) errors[`cards.${index}.id`] = `卡片 ID “${card.id}” 重复。`
    seenIds.add(card.id)
    if (!card.title?.trim()) errors[`cards.${index}.title`] = `第 ${index + 1} 张卡片缺少标题。`
    if (!card.summary?.trim()) errors[`cards.${index}.summary`] = `第 ${index + 1} 张卡片缺少简介。`
  })

  content.gallery?.forEach((image, index) => {
    if (image.src && !image.alt?.trim()) errors[`gallery.${index}.alt`] = `第 ${index + 1} 张图片需要替代文字。`
  })

  return { errors, warnings, isValid: Object.keys(errors).length === 0 }
}

export function updateAtPath(source, path, value) {
  const next = structuredClone(source)
  const segments = path.split('.')
  let cursor = next
  segments.slice(0, -1).forEach((segment) => {
    cursor = cursor[Number.isNaN(Number(segment)) ? segment : Number(segment)]
  })
  const finalSegment = segments.at(-1)
  cursor[Number.isNaN(Number(finalSegment)) ? finalSegment : Number(finalSegment)] = value
  return next
}
