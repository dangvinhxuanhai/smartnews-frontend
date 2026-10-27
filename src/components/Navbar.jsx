import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <nav className="navbar" aria-label="Main navigation">
        <Link className="brand" to="/">
          <span className="brand-mark">S</span>
          <span className="brand-word">SmartNews</span>
        </Link>

        <button
          className="mobile-menu-button"
          type="button"
          aria-label="Mở menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((current) => !current)}
        >
          <span />
          <span />
        </button>

        <div className={`nav-panel ${menuOpen ? 'is-open' : ''}`}>
          <div className="nav-links">
            <NavLink to="/" end>
              Trang chủ
            </NavLink>
            <a href="/#latest">Tin mới</a>
            <a href="/#why-smartnews">Khám phá</a>

            {user && <NavLink to="/dashboard">Newsroom</NavLink>}
          </div>

          <div className="nav-actions">
            {user ? (
              <>
                <Link className="user-chip" to="/profile">
                  <span className="user-avatar">{user.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  <span>{user.name}</span>
                </Link>
                <button className="button button-small button-ghost" type="button" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <NavLink className="nav-login" to="/login">Đăng nhập</NavLink>
                <Link className="button button-small" to="/register">Bắt đầu</Link>
              </>
            )}
          </div>
        </div>
      </nav>
    </header>
  )
}
