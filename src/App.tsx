import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SessionProvider } from '@/stores/use-session-store'
import { AuthProvider, useAuth } from '@/hooks/use-auth'

import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import Sentir from './pages/Sentir'
import Estruturar from './pages/Estruturar'
import Escalar from './pages/Escalar'
import Resumo from './pages/Resumo'
import NotFound from './pages/NotFound'

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <SessionProvider>
          <Toaster />
          <Sonner />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<Dashboard />} />
              <Route path="/nova" element={<Index />} />
              <Route path="/sentir" element={<Sentir />} />
              <Route path="/estruturar" element={<Estruturar />} />
              <Route path="/escalar" element={<Escalar />} />
              <Route path="/resumo" element={<Resumo />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </SessionProvider>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
