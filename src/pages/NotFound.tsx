import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6">
      <p className="readout text-5xl font-semibold text-cyan-glow/70">404</p>
      <h1 className="mt-3 text-2xl font-semibold text-white">This page is out of tune</h1>
      <p className="mt-2 text-sm text-mist">The route does not exist.</p>
      <Link to="/" className="btn btn-primary mt-6">
        Back to the explorer
      </Link>
    </div>
  )
}
