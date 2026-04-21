import React from 'react'
import type { PublisherBiasPoint } from '../utils/newsTrust'

interface BiasHeatmapProps {
  data: PublisherBiasPoint[]
  loading?: boolean
}

const getBiasColorClass = (score: number): string => {
  if (score <= 30) return 'bg-green-500'
  if (score <= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

const BiasHeatmap: React.FC<BiasHeatmapProps> = ({ data, loading = false }) => {
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">Bias Heatmap</h2>
          <p className="text-xs text-slate-500">Framing differences across publishers in your current feed</p>
        </div>
      </div>

      {loading && (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 w-full rounded bg-slate-200"></div>
          <div className="h-3 w-11/12 rounded bg-slate-200"></div>
          <div className="h-3 w-10/12 rounded bg-slate-200"></div>
        </div>
      )}

      {!loading && data.length === 0 && (
        <p className="text-sm text-slate-500">Not enough verified publisher data yet.</p>
      )}

      {!loading && data.length > 0 && (
        <div className="space-y-3">
          {data.map((entry) => (
            <div key={entry.sourceName} className="rounded-lg border border-slate-100 p-3">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{entry.sourceName}</p>
                  <p className="text-xs text-slate-500">
                    {entry.articleCount} article{entry.articleCount > 1 ? 's' : ''} · {entry.framing}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Bias</p>
                  <p className="text-sm font-bold text-slate-800">{Math.round(entry.averageBiasScore)} / 100</p>
                </div>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${getBiasColorClass(entry.averageBiasScore)}`}
                  style={{ width: `${Math.max(4, Math.min(100, entry.averageBiasScore))}%` }}
                ></div>
              </div>
              <p className="mt-2 text-[11px] text-slate-500">
                Avg credibility: {Math.round(entry.averageCredibilityScore)} / 100
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default BiasHeatmap
