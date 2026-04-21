import type { Article } from '../types'

export interface ContextBrief {
  summary: string
  whyItMatters: string
  keyPoints: string[]
  keyEntities: string[]
}

const briefCache = new Map<string, ContextBrief>()

const normalizeWhitespace = (value: string): string => value.replace(/\s+/g, ' ').trim()
const stripMarkup = (value: string): string => value.replace(/<[^>]*>/g, ' ').replace(/\[[^\]]*]/g, ' ')

const toSentences = (text: string): string[] =>
  text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => normalizeWhitespace(sentence))
    .filter((sentence) => sentence.length > 35)

const sentenceScore = (sentence: string): number => {
  const lowered = sentence.toLowerCase()
  let score = 0

  if (/\d/.test(sentence)) score += 0.2
  if (/(will|expected|announced|agreement|policy|report|confirmed|impact)/.test(lowered)) score += 0.35
  if (/(government|market|economy|security|technology|science|health|global)/.test(lowered)) score += 0.35
  if (sentence.length > 90 && sentence.length < 260) score += 0.2

  return score
}

const topSentences = (text: string, count: number): string[] =>
  toSentences(text)
    .map((sentence) => ({ sentence, score: sentenceScore(sentence) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((item) => item.sentence)

const extractEntities = (title: string, description: string): string[] => {
  const sourceText = `${title} ${description}`
  const matches = sourceText.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}|[A-Z]{2,}(?:\s+[A-Z]{2,})?)\b/g) || []
  const blocked = new Set(['The', 'A', 'An', 'And', 'But', 'For', 'With', 'In', 'On', 'At', 'Of'])

  const unique: string[] = []
  for (const match of matches) {
    if (blocked.has(match)) continue
    if (!unique.includes(match)) unique.push(match)
    if (unique.length === 4) break
  }

  return unique
}

const buildWhyItMatters = (text: string): string => {
  const lowered = text.toLowerCase()

  if (/(economy|market|inflation|interest rate|trade|gdp)/.test(lowered)) {
    return 'This can influence prices, jobs, and business confidence in the near term.'
  }
  if (/(policy|government|election|regulation|court|law)/.test(lowered)) {
    return 'This could shape public policy decisions and affect how institutions operate.'
  }
  if (/(security|war|conflict|military|cyber)/.test(lowered)) {
    return 'This may affect national stability, international relations, and risk exposure.'
  }
  if (/(health|medicine|disease|hospital|clinical)/.test(lowered)) {
    return 'This matters because it can impact public health outcomes and healthcare planning.'
  }
  if (/(technology|ai|software|chip|data|internet)/.test(lowered)) {
    return 'This may change how organizations adopt technology and how people use digital tools.'
  }

  return 'This story is relevant because it may influence decisions, priorities, or public understanding.'
}

export const generateContextBrief = (article: Pick<Article, 'id' | 'title' | 'description' | 'content'>): ContextBrief => {
  const cacheKey = article.id || article.title
  const cached = briefCache.get(cacheKey)
  if (cached) return cached

  const title = normalizeWhitespace(stripMarkup(article.title || ''))
  const description = normalizeWhitespace(stripMarkup(article.description || ''))
  const content = normalizeWhitespace(stripMarkup(article.content || ''))
  const fullText = normalizeWhitespace(`${title}. ${description}. ${content}`)

  const points = topSentences(fullText, 3)
  const summary = points[0] || description || title || 'Context summary unavailable.'

  const brief: ContextBrief = {
    summary,
    whyItMatters: buildWhyItMatters(fullText),
    keyPoints: points.length ? points : [summary],
    keyEntities: extractEntities(title, description)
  }

  briefCache.set(cacheKey, brief)
  return brief
}
