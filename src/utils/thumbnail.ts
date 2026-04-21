import type { Article } from '../types'
import type { SyntheticEvent } from 'react'

const FALLBACK_WIDTH = 1200
const FALLBACK_HEIGHT = 675

const buildSeed = (article: Partial<Article>): string => {
  const rawSeed = article.id || article.url || article.title || 'news'
  return String(rawSeed).slice(0, 120)
}

const sanitizeLabel = (value: string): string =>
  value.replace(/[<>&'"]/g, '').trim().slice(0, 48) || 'News'

const buildInlineThumbnail = (label: string, width: number, height: number): string => {
  const safeLabel = sanitizeLabel(label)
  const fontSize = Math.max(16, Math.floor(width / 22))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#dbeafe"/><stop offset="100%" stop-color="#bfdbfe"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#bg)"/><rect x="18" y="18" width="${Math.max(100, width - 36)}" height="${Math.max(64, height - 36)}" rx="18" fill="rgba(255,255,255,0.5)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#1e3a8a" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="700">${safeLabel}</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export const getArticleThumbnail = (
  article: Partial<Article>,
  width: number = FALLBACK_WIDTH,
  height: number = FALLBACK_HEIGHT
): string => {
  const candidate = article.imageUrl?.trim()
  if (candidate) {
    return candidate
  }

  return buildInlineThumbnail(buildSeed(article), width, height)
}

export const applyThumbnailFallback = (
  event: SyntheticEvent<HTMLImageElement, Event>,
  width: number = FALLBACK_WIDTH,
  height: number = FALLBACK_HEIGHT
) => {
  const image = event.currentTarget
  if (image.dataset.fallbackApplied === 'true') {
    return
  }

  image.dataset.fallbackApplied = 'true'
  image.src = buildInlineThumbnail(image.alt || 'News', width, height)
}
