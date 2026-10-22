import { useEffect, useState } from 'react'
import LoadingSpinner from './LoadingSpinner'
import ErrorMessage from './ErrorMessage'

function RepoList({ username }) {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)


  useEffect(() => {
    if (!username) return
    const controller = new AbortController()
    async function fetchRepos() {
      setLoading(true)
      setError(null)
      try {
        const url = `https://api.github.com/users/${username}/repos?per_page=20&sort=updated`
        const headers = {}
        const token = import.meta.env.VITE_GITHUB_TOKEN
        if (token) headers.Authorization = `token ${token}`
        const res = await fetch(url, { headers, signal: controller.signal })
        if (!res.ok) throw new Error(`GitHub API error: ${res.status}`)
        const data = await res.json()
        setRepos(data)
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message || 'Failed to fetch')
      } finally {
        setLoading(false)
      }
    }

    fetchRepos()
    return () => controller.abort()
  }, [username])

  if (loading) return <LoadingSpinner />
  if (error) return <ErrorMessage message={error} />

  if (!repos.length) return <p>No repositories found.</p>

  return (
    <ul className="repo-list" aria-live="polite">
      {repos.map((r) => (
        <li key={r.id} className="repo-item">
          <a href={r.html_url} target="_blank" rel="noopener noreferrer">
            <strong>{r.name}</strong>
          </a>
          {r.description && <p className="repo-desc">{r.description}</p>}
        </li>
      ))}
    </ul>
  )
}

export default RepoList
