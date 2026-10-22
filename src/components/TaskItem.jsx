import React, { memo, useRef } from 'react'

/**
 * Memoized TaskItem Component to avoid unnecessary re-renders when parent form state changes.
 */
const TaskItem = memo(function TaskItem({ task, onToggle, onDelete }) {
  const renderCountRef = useRef(0)
  renderCountRef.current += 1

  return (
    <li className="task-item">
      <div>
        <strong>{task.title}</strong>
        <p>{task.description || 'No description provided.'}</p>
        <small className="render-counter-badge" title="Tracked for React Profiler Re-render Optimization">
          ⚡ Rendered {renderCountRef.current} time{renderCountRef.current > 1 ? 's' : ''}
        </small>
      </div>
      <div className="task-meta">
        <span className={`badge priority-${task.priority}`}>{task.priority}</span>
        <span>{task.completed ? 'Completed' : 'Pending'}</span>
        <div className="task-actions">
          <button
            type="button"
            className="mini-button success"
            onClick={() => onToggle(task._id, task.completed)}
          >
            {task.completed ? 'Mark Pending' : 'Mark Done'}
          </button>
          <button
            type="button"
            className="mini-button danger"
            onClick={() => onDelete(task._id)}
          >
            Delete
          </button>
        </div>
      </div>
    </li>
  )
})

export default TaskItem
