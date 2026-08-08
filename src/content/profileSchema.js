import { profile as fallbackProfile } from '../data/profile.js'

export const SITE_ID = 'profile'
export const CONTENT_SCHEMA_VERSION = 1

export function createInitialContent() {
  return structuredClone({
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
  const fallback = createInitialContent()
  if (!value || typeof value !== 'object') return fallback

  return {
    ...fallback,
    ...value,
    schemaVersion: CONTENT_SCHEMA_VERSION,
    about: { ...fallback.about, ...(value.about ?? {}) },
    seo: { ...fallback.seo, ...(value.seo ?? {}) },
    education: Array.isArray(value.education) ? value.education : fallback.education,
    skillGroups: Array.isArray(value.skillGroups) ? value.skillGroups : fallback.skillGroups,
    interests: Array.isArray(value.interests) ? value.interests : fallback.interests,
    projects: Array.isArray(value.projects) ? value.projects : fallback.projects,
    gallery: Array.isArray(value.gallery) ? value.gallery : fallback.gallery,
    socials: Array.isArray(value.socials) ? value.socials : fallback.socials,
    goals: Array.isArray(value.goals) ? value.goals : fallback.goals,
    cards: Array.isArray(value.cards) ? value.cards : fallback.cards,
  }
}

export function validateProfileContent(content) {
  const errors = {}
  const warnings = []

  if (!content.name?.trim()) errors.name = '请输入公开姓名。'
  if (!content.role?.trim()) errors.role = '请输入身份或个人定位。'
  if (!content.introduction?.trim()) errors.introduction = '请输入个人简介。'
  if (!content.location?.trim()) errors.location = '请输入所在地。'

  if (!content.email?.trim()) {
    errors.email = '请输入联系邮箱。'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.email)) {
    errors.email = '邮箱格式不正确。'
  }

  if (!content.about?.paragraphs?.some((paragraph) => paragraph.trim())) {
    errors.about = '至少保留一段 About 内容。'
  }

  if (!content.seo?.title?.trim()) errors['seo.title'] = '请输入浏览器标题。'
  if (!content.seo?.description?.trim()) errors['seo.description'] = '请输入网站描述。'
  if (!content.seo?.shareImage?.trim()) warnings.push('尚未设置社交分享图片。')
  if ((content.seo?.description?.length ?? 0) > 160) warnings.push('网站描述超过 160 个字符，搜索结果可能截断。')

  content.cards?.forEach((card, index) => {
    if (!card.title?.trim()) errors[`cards.${index}.title`] = `第 ${index + 1} 张卡片缺少标题。`
    if (!card.summary?.trim()) errors[`cards.${index}.summary`] = `第 ${index + 1} 张卡片缺少简介。`
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
