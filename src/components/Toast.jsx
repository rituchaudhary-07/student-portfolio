import React from 'react'

function Toast({ type = 'success', message, onClose }) {
  if (!message) return null

  return (
    <div className={`toast-notification toast-${type}`}>
      <span className="toast-message">{message}</span>
      {onClose && (
        <button type="button" className="toast-close" onClick={onClose}>
          &times;
        </button>
      )}
    </div>
  )
}

export default Toast
