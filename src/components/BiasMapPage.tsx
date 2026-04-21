import React, { useEffect, useMemo, useState } from 'react'
import { RefreshCw, TrendingUp } from 'lucide-react'
import type { Article } from '../types'
import { useRealtimeNews } from '../hooks/useRealtimeNews'
import { NewsVerificationService, VerificationResult } from '../services/verificationService'
import BiasHeatmap from './BiasHeatmap'
import { buildPublisherBiasHeatmap, getTrustDistribution } from '../utils/newsTrust'

const BiasMapPage: React.FC = () => {
  const { articles, forceRefresh, lastUpdate } = useRealtimeNews()
  const [verificationById, setVerificationById] = useState<Record<string, VerificationResult>>({})
  const [verificationLoading, setVerificationLoading] = useState(false)

  useEffect(() => {
    let active = true

    const verifyArticles = async () => {
      if (articles.length === 0) {
        setVerificationById({})
        return
      }

      setVerificationLoading(true)
      try {
        const sampleArticles = articles.slice(0, 50) as Article[]
        const service = NewsVerificationService.getInstance()
        const results = await service.verifyMultipleArticles(sampleArticles)

        if (!active) return

        const nextMap: Record<string, VerificationResult> = {}
        sampleArticles.forEach((article, index) => {
          const result = results[index]
          if (result) nextMap[article.id] = result
        })

        setVerificationById(nextMap)
      } catch (error) {
        console.error('Bias map verification failed:', error)
      } finally {
        if (active) setVerificationLoading(false)
      }
    }

    verifyArticles()

    return () => {
      active = false
    }
  }, [articles])

  const heatmapData = useMemo(
    () => buildPublisherBiasHeatmap(articles as Article[], verificationById),
    [articles, verificationById]
  )
  const trustDistribution = useMemo(
    () => getTrustDistribution(Object.values(verificationById)),
    [verificationById]
  )

  return (
    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-6">
      <section className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary tracking-tight">Bias Map</h1>
        <p className="text-secondary mt-2">
          Publisher framing differences and trust distribution across current stories.
        </p>
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-green-100 text-green-800">
            Likely Real: {trustDistribution.likelyReal}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-yellow-100 text-yellow-800">
            Needs Verification: {trustDistribution.needsVerification}
          </span>
          <span className="px-2.5 py-1 rounded-full bg-red-100 text-red-800">
            Potentially Fake: {trustDistribution.potentiallyFake}
          </span>
        </div>

        <button
          onClick={forceRefresh}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {lastUpdate && (
        <p className="text-xs text-slate-500 mb-3">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </p>
      )}

      <BiasHeatmap data={heatmapData} loading={verificationLoading} />

      {!verificationLoading && heatmapData.length > 0 && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
            Publisher Snapshot
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {heatmapData.map((entry) => (
              <article key={entry.sourceName} className="rounded-lg border border-slate-100 p-3">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-semibold text-slate-800">{entry.sourceName}</p>
                  <TrendingUp size={14} className="text-slate-400" />
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {entry.articleCount} article{entry.articleCount > 1 ? 's' : ''} · {entry.framing}
                </p>
                <p className="mt-2 text-xs text-slate-600">
                  Bias: <span className="font-semibold text-slate-800">{Math.round(entry.averageBiasScore)}/100</span>
                </p>
                <p className="text-xs text-slate-600">
                  Credibility: <span className="font-semibold text-slate-800">{Math.round(entry.averageCredibilityScore)}/100</span>
                </p>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default BiasMapPage
