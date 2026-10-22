import { lazy } from 'react'

/**
 * Utility to lazy load a component with an optional artificial minimum delay
 * to demonstrate fallback UI and prevent rapid UI flickering on fast connections.
 * 
 * @param {Function} importFactory - Dynamic import function, e.g. () => import('./MyComponent')
 * @param {number} minDelay - Minimum delay in milliseconds (default: 300ms)
 * @returns {React.LazyExoticComponent} Lazy loaded React component
 */
export function lazyWithMinDelay(importFactory, minDelay = 300) {
  return lazy(() =>
    Promise.all([
      importFactory(),
      new Promise((resolve) => setTimeout(resolve, minDelay)),
    ]).then(([moduleExports]) => moduleExports)
  )
}
