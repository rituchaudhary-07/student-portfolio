import { Link } from 'react-router-dom'

const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Projects', href: '/projects' },
  { label: 'Skills', href: '/skills' },
  { label: 'Contact', href: '/contact' },
  { label: 'Tasks', href: '/tasks' },
]

function Header() {
  const token = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/signin'
  }

  return (
    <header className="site-header">
      <Link className="brand" to="/">
        Ritu Chaudhari
      </Link>
      <nav className="nav-links" aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link key={item.label} to={item.href}>
            {item.label}
          </Link>
        ))}

        {token ? (
          <button
            type="button"
            className="auth-link mini-button danger"
            onClick={handleLogout}
            style={{ marginLeft: '0.5rem', cursor: 'pointer' }}
          >
            Sign Out
          </button>
        ) : (
          <>
            <Link to="/signin" className="auth-link">
              Sign In
            </Link>
            <Link to="/register" className="auth-link">
              Register
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header
