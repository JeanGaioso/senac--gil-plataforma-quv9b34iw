import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { SessionProvider } from '@/stores/use-session-store'

import Layout from './components/Layout'
import Index from './pages/Index'
import Sentir from './pages/Sentir'
import Estruturar from './pages/Estruturar'
import Escalar from './pages/Escalar'
import Resumo from './pages/Resumo'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <TooltipProvider>
      <SessionProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/sentir" element={<Sentir />} />
            <Route path="/estruturar" element={<Estruturar />} />
            <Route path="/escalar" element={<Escalar />} />
            <Route path="/resumo" element={<Resumo />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SessionProvider>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
