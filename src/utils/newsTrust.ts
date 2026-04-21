import type { Article } from '../types'
import type { VerificationResult } from '../services/verificationService'

export type TrustLevel = 'likely_real' | 'needs_verification' | 'potentially_fake'

export interface TrustPresentation {
  level: TrustLevel
  label: string
  badgeClass: string
}

export interface PublisherBiasPoint {
  sourceName: string
  articleCount: number
  averageBiasScore: number
  averageCredibilityScore: number
  framing: 'Balanced' | 'Moderate Framing' | 'Strong Framing'
}

const TRUST_STYLES: Record<TrustLevel, TrustPresentation> = {
  likely_real: {
    level: 'likely_real',
    label: 'Likely Real',
    badgeClass: 'bg-green-100 text-green-800'
  },
  needs_verification: {
    level: 'needs_verification',
    label: 'Needs Verification',
    badgeClass: 'bg-yellow-100 text-yellow-800'
  },
  potentially_fake: {
    level: 'potentially_fake',
    label: 'Potentially Fake',
    badgeClass: 'bg-red-100 text-red-800'
  }
}

export const getTrustLevel = (verification?: VerificationResult | null): TrustLevel => {
  if (!verification) return 'needs_verification'

  if (verification.riskLevel === 'high' || verification.credibilityScore < 45) {
    return 'potentially_fake'
  }

  if (verification.riskLevel === 'low' && verification.credibilityScore >= 70) {
    return 'likely_real'
  }

  return 'needs_verification'
}

export const getTrustPresentation = (verification?: VerificationResult | null): TrustPresentation => {
  const level = getTrustLevel(verification)
  return TRUST_STYLES[level]
}

export const getTrustDistribution = (verifications: VerificationResult[]) => {
  const counts = {
    likelyReal: 0,
    needsVerification: 0,
    potentiallyFake: 0
  }

  for (const verification of verifications) {
    const level = getTrustLevel(verification)
    if (level === 'likely_real') counts.likelyReal += 1
    else if (level === 'potentially_fake') counts.potentiallyFake += 1
    else counts.needsVerification += 1
  }

  return counts
}

const getFramingLabel = (biasScore: number): PublisherBiasPoint['framing'] => {
  if (biasScore <= 30) return 'Balanced'
  if (biasScore <= 60) return 'Moderate Framing'
  return 'Strong Framing'
}

export const buildPublisherBiasHeatmap = (
  articles: Article[],
  verificationById: Record<string, VerificationResult>
): PublisherBiasPoint[] => {
  const sourceMap = new Map<string, { count: number; totalBias: number; totalCredibility: number }>()

  for (const article of articles) {
    const verification = verificationById[article.id]
    if (!verification) continue

    const sourceName = article.source?.name || 'Unknown Source'
    const sourceEntry = sourceMap.get(sourceName) || { count: 0, totalBias: 0, totalCredibility: 0 }

    sourceEntry.count += 1
    sourceEntry.totalBias += verification.contentAnalysis.biasScore
    sourceEntry.totalCredibility += verification.credibilityScore

    sourceMap.set(sourceName, sourceEntry)
  }

  return Array.from(sourceMap.entries())
    .map(([sourceName, entry]) => {
      const averageBiasScore = entry.totalBias / entry.count
      const averageCredibilityScore = entry.totalCredibility / entry.count

      return {
        sourceName,
        articleCount: entry.count,
        averageBiasScore,
        averageCredibilityScore,
        framing: getFramingLabel(averageBiasScore)
      }
    })
    .sort((a, b) => {
      if (b.articleCount !== a.articleCount) return b.articleCount - a.articleCount
      return b.averageBiasScore - a.averageBiasScore
    })
    .slice(0, 8)
}
