import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './hooks/useAuth.jsx'
import { ToastProvider } from './hooks/useToast.jsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// Forces installed PWAs (notably iOS home-screen installs) to notice a new
// deploy instead of holding onto a stale app shell indefinitely - see sw.js.
// `controllerchange` fires once a new service worker takes control; since
// that only happens after the very first install too, `wasControlled` skips
// the event that first time so freshly-installed clients don't get an
// unnecessary reload prompt.
if ('serviceWorker' in navigator) {
  const wasControlled = Boolean(navigator.serviceWorker.controller)
  navigator.serviceWorker.register('/sw.js')
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (wasControlled) {
      window.dispatchEvent(new CustomEvent('pmg:sw-update-ready'))
    }
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
