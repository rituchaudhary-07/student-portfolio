import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { loginUser } from '../api'

function SignIn() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const data = await loginUser(form.email, form.password)
      localStorage.setItem('token', data.token)
      navigate('/tasks')
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="auth-section">
      <div className="auth-card">
        <p className="eyebrow">Welcome back</p>
        <h2>Sign in</h2>

        {error && <p className="task-message toast-error" style={{ marginBottom: '1rem' }}>{error}</p>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Email address</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </label>

          <button type="submit" className="cta-button auth-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="auth-switch">
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </section>
  )
}

export default SignIn
