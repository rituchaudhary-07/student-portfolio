import React from 'react'

function PageFallback({ title = 'Loading Module...' }) {
  return (
    <div className="page-fallback-container" role="status" aria-live="polite">
      <div className="fallback-card">
        <div className="fallback-spinner">
          <div className="pulse-ring" />
          <div className="core-dot" />
        </div>
        <h4 className="fallback-title">{title}</h4>
        <p className="fallback-subtitle">Fetching code split chunk on demand...</p>
        <div className="fallback-skeleton-bars">
          <div className="skeleton-bar bar-long" />
          <div className="skeleton-bar bar-medium" />
          <div className="skeleton-bar bar-short" />
        </div>
      </div>
    </div>
  )
}

export default PageFallback
