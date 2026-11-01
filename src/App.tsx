import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { RequireAuth } from './components/layout/RequireAuth'
import { AuthProvider } from './lib/auth/AuthProvider'
import Explore from './pages/Explore'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import PresetDetail from './pages/PresetDetail'
import Presets from './pages/Presets'
import Register from './pages/Register'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Explore />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route element={<RequireAuth />}>
                <Route path="/presets" element={<Presets />} />
                <Route path="/presets/:id" element={<PresetDetail />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="border-t border-line/70 px-4 py-4 text-center text-[11px] text-mist/60">
            Delay Resonance Explorer · Web Audio API · Supabase
          </footer>
        </div>
      </AuthProvider>
    </BrowserRouter>
  )
}
