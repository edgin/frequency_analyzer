export function SupabaseNotice() {
  return (
    <div className="rounded-lg border border-amber-glow/35 bg-amber-glow/10 p-3 text-xs leading-relaxed text-amber-100">
      <p className="font-semibold text-amber-200">Supabase is not configured</p>
      <p className="mt-1">
        Create <code className="readout text-amber-100">.env.local</code> with{' '}
        <code className="readout text-amber-100">VITE_SUPABASE_URL</code> and{' '}
        <code className="readout text-amber-100">VITE_SUPABASE_ANON_KEY</code>, then run the SQL in{' '}
        <code className="readout text-amber-100">supabase/migrations/0001_init.sql</code> in the
        Supabase SQL Editor. Restart the dev server after adding the variables.
      </p>
    </div>
  )
}
