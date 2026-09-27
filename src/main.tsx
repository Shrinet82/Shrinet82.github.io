import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { webglAvailable } from './gl/registry'
import './styles.css'

const gl = webglAvailable()
document.documentElement.classList.add(gl ? 'has-gl' : 'no-gl')

// The WebGL layers load separately so the content paints first.
const Background = lazy(() => import('./gl/Background'))
const Stage = lazy(() => import('./gl/Stage'))

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {gl && (
      <Suspense fallback={null}>
        <Background />
        <Stage />
      </Suspense>
    )}
    <App />
  </StrictMode>,
)
