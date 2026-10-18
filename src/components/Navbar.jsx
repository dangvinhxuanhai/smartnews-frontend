import { Link, NavLink, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <header className="site-header">
      <nav className="navbar">
        <Link className="brand" to="/">
          Smart<span>News</span>
        </Link>

        <div className="nav-links">
          <NavLink to="/" end>
            Trang chủ
          </NavLink>

          {user ? (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/profile">Tài khoản</NavLink>
              <span className="user-badge">{user.name}</span>
              <button className="button button-small button-ghost" onClick={handleLogout}>
                Đăng xuất
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login">Đăng nhập</NavLink>
              <Link className="button button-small" to="/register">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
