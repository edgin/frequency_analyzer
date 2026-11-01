import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/layout/PageHeader'
import { PresetCard } from '../components/presets/PresetCard'
import { Loading } from '../components/ui/Loading'
import { useAuth } from '../lib/auth/useAuth'
import { listPresets } from '../lib/presetsApi'
import type { Preset } from '../types'

export default function Presets() {
  const { user } = useAuth()
  const [presets, setPresets] = useState<Preset[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!user) return
    let active = true

    const load = async () => {
      try {
        const rows = await listPresets(user.id)
        if (!active) return
        setPresets(rows)
        setError(null)
      } catch (caught) {
        if (active) {
          setError(caught instanceof Error ? caught.message : 'Could not load presets.')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    void load()
    return () => {
      active = false
    }
  }, [user, refreshKey])

  const refresh = () => {
    setLoading(true)
    setRefreshKey((current) => current + 1)
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-8">
      <PageHeader
        eyebrow="Private library"
        title="Your presets"
        description="Saved parameter sets and audio snapshots. Only you can see these presets."
        actions={
          <>
            <button type="button" className="btn" onClick={refresh} disabled={loading}>
              Refresh
            </button>
            <Link to="/" className="btn btn-primary">
              New preset
            </Link>
          </>
        }
      />

      {loading ? <Loading label="Loading your presets…" /> : null}

      {!loading && error ? (
        <div className="panel p-6">
          <p className="text-sm font-semibold text-red-200">Could not load presets</p>
          <p className="mt-1 text-xs text-mist">{error}</p>
          <button type="button" className="btn mt-4" onClick={refresh}>
            Try again
          </button>
        </div>
      ) : null}

      {!loading && !error && presets.length === 0 ? (
        <div className="panel p-10 text-center">
          <p className="text-base font-semibold text-white">No presets yet</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-mist">
            Open the explorer, dial in a resonance, and use “Save preset” to add it here. You can
            also attach an 8-second audio snapshot.
          </p>
          <Link to="/" className="btn btn-primary mt-5">
            Open the explorer
          </Link>
        </div>
      ) : null}

      {!loading && !error && presets.length > 0 ? (
        <>
          <p className="mb-3 text-xs text-mist">
            {presets.length} {presets.length === 1 ? 'preset' : 'presets'}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {presets.map((preset) => (
              <PresetCard key={preset.id} preset={preset} />
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
