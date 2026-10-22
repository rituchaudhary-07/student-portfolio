import { useEffect, useState, useCallback, Suspense } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getTasks, createTask, updateTask, deleteTask } from '../api'
import Toast from '../components/Toast'
import TaskItem from '../components/TaskItem'
import PageFallback from '../components/PageFallback'
import { lazyWithMinDelay } from '../utils/lazyWithDelay'

// Supplementary Problem 1 & 2: Lazy load a heavy component with minimum delay fallback
const TaskAnalyticsChart = lazyWithMinDelay(
  () => import('../components/TaskAnalyticsChart'),
  400
)

const emptyForm = {
  title: '',
  description: '',
  completed: false,
  priority: 'medium',
}

function Tasks() {
  const [tasks, setTasks] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showAnalytics, setShowAnalytics] = useState(false)
  const [toast, setToast] = useState({ message: '', type: 'success' })
  const navigate = useNavigate()

  const token = localStorage.getItem('token')

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => {
      setToast({ message: '', type: 'success' })
    }, 4000)
  }, [])

  const fetchTaskList = useCallback(async () => {
    if (!token) {
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const data = await getTasks()
      setTasks(data)
    } catch (error) {
      if (error.message?.includes('token') || error.message?.includes('denied')) {
        showToast('Session expired or unauthorized. Please Sign In.', 'error')
      } else {
        showToast(error.message || 'Unable to connect to the task server.', 'error')
      }
    } finally {
      setLoading(false)
    }
  }, [token, showToast])

  useEffect(() => {
    fetchTaskList()
  }, [fetchTaskList])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!token) {
      showToast('You must be signed in to add tasks.', 'error')
      navigate('/signin')
      return
    }

    if (!form.title.trim()) return

    const tempId = `temp-${Date.now()}`
    const optimisticTask = {
      _id: tempId,
      ...form,
      title: form.title.trim(),
      createdAt: new Date().toISOString(),
    }

    setTasks((prevTasks) => [optimisticTask, ...prevTasks])
    const previousForm = { ...form }
    setForm(emptyForm)
    setSubmitting(true)

    try {
      const createdTask = await createTask(previousForm)
      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === tempId ? createdTask : t))
      )
      showToast('Task added successfully!', 'success')
    } catch (error) {
      setTasks((prevTasks) => prevTasks.filter((t) => t._id !== tempId))
      setForm(previousForm)
      showToast(error.message || 'Task could not be added. Make sure server is running.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  // Supplementary Problem 3: Memoize handlers with useCallback to prevent TaskItem re-renders
  const handleToggleTask = useCallback(async (taskId, currentCompleted) => {
    setTasks((prevTasks) =>
      prevTasks.map((t) =>
        t._id === taskId ? { ...t, completed: !currentCompleted } : t
      )
    )

    try {
      await updateTask(taskId, { completed: !currentCompleted })
      showToast('Task status updated!', 'success')
    } catch (error) {
      setTasks((prevTasks) =>
        prevTasks.map((t) =>
          t._id === taskId ? { ...t, completed: currentCompleted } : t
        )
      )
      showToast(error.message || 'Task update failed.', 'error')
    }
  }, [showToast])

  const handleDeleteTask = useCallback(async (taskId) => {
    const confirmed = window.confirm('Are you sure you want to delete this task?')
    if (!confirmed) return

    setTasks((prevTasks) => prevTasks.filter((t) => t._id !== taskId))

    try {
      await deleteTask(taskId)
      showToast('Task deleted successfully!', 'success')
    } catch (error) {
      // refetch if failed
      fetchTaskList()
      showToast(error.message || 'Task deletion failed.', 'error')
    }
  }, [fetchTaskList, showToast])

  if (!token) {
    return (
      <section className="panel task-page">
        <div className="section-heading">
          <p className="eyebrow">Task Manager</p>
          <h2>Protected Task Routes</h2>
        </div>
        <div className="error-message" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <h3>🔑 Authentication Required</h3>
          <p style={{ margin: '1rem 0 1.5rem 0', color: '#4a5568' }}>
            Practical 7 protects all task endpoints with JWT middleware. Please sign in or create an account to view and manage tasks.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/signin" className="cta-button auth-button" style={{ textDecoration: 'none' }}>
              Sign In
            </Link>
            <Link to="/register" className="cta-button" style={{ textDecoration: 'none', background: '#4a5568' }}>
              Register
            </Link>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="panel task-page">
      <div className="section-heading">
        <p className="eyebrow">Task Manager</p>
        <h2>Full Stack React + Node + MongoDB (Protected)</h2>
      </div>

      <Toast
        type={toast.type}
        message={toast.message}
        onClose={() => setToast({ message: '', type: 'success' })}
      />

      <div className="analytics-toggle-bar">
        <button
          type="button"
          className="cta-button secondary-cta"
          onClick={() => setShowAnalytics((prev) => !prev)}
        >
          {showAnalytics ? '🙈 Hide Heavy Analytics Chart' : '📊 Load Heavy Analytics Chart (Lazy Split Chunk)'}
        </button>
      </div>

      {showAnalytics && (
        <Suspense fallback={<PageFallback title="Loading Analytics Chunk (300ms min delay)..." />}>
          <TaskAnalyticsChart tasks={tasks} />
        </Suspense>
      )}

      <form className="task-form" onSubmit={handleSubmit}>
        <div className="form-info-box">
          <p>
            💡 <strong>Re-render Optimization Active:</strong> Typing in these input fields triggers form state updates. Thanks to <code>React.memo</code> & <code>useCallback</code>, the task items below do NOT re-render on every keystroke!
          </p>
        </div>

        <label>
          <span>Title</span>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter task title"
            required
            disabled={submitting}
          />
        </label>

        <label>
          <span>Description</span>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows="4"
            placeholder="Enter task details"
            disabled={submitting}
          />
        </label>

        <div className="task-row">
          <label>
            <span>Priority</span>
            <select
              name="priority"
              value={form.priority}
              onChange={handleChange}
              disabled={submitting}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>

          <label className="checkbox-field">
            <input
              type="checkbox"
              name="completed"
              checked={form.completed}
              onChange={handleChange}
              disabled={submitting}
            />
            <span>Completed</span>
          </label>
        </div>

        <button type="submit" className="cta-button auth-button" disabled={submitting}>
          {submitting ? 'Adding Task...' : 'Add Task'}
        </button>
      </form>

      <div className="task-list-wrap">
        <h3>Task List</h3>
        {loading ? (
          <p className="empty-state">Loading tasks from database...</p>
        ) : tasks.length === 0 ? (
          <p className="empty-state">No tasks found. Add one above.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <TaskItem
                key={task._id}
                task={task}
                onToggle={handleToggleTask}
                onDelete={handleDeleteTask}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default Tasks
