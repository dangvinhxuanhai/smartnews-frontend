import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import { getApiError } from '../utils/apiError.js'

export default function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  if (isAuthenticated) return <Navigate to="/dashboard" replace />

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await login(form.email, form.password)
      const destination = location.state?.from?.pathname || '/dashboard'
      navigate(destination, { replace: true })
    } catch (err) {
      setError(getApiError(err, 'Đăng nhập thất bại. Kiểm tra email và mật khẩu.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-visual">
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
        <div className="auth-visual-content">
          <Link className="brand brand-light" to="/">
            <span className="brand-mark">S</span>
            <span className="brand-word">SmartNews</span>
          </Link>
          <div>
            <p className="eyebrow eyebrow-light">NEWSROOM ACCESS</p>
            <h1>Nơi câu chuyện<br />được bắt đầu.</h1>
            <p>Quản lý nội dung, nguồn tin và những story sẽ xuất hiện trước độc giả SmartNews.</p>
          </div>
          <div className="auth-visual-note">
            <span>01</span>
            <p>Write clearly. Verify carefully. Publish with context.</p>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <form className="auth-card modern-auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-heading">
            <span className="auth-kicker">Welcome back</span>
            <h2>Đăng nhập Newsroom</h2>
            <p>Tiếp tục quản lý nội dung SmartNews.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <label className="form-field">
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>

          <label className="form-field">
            <span>Mật khẩu</span>
            <div className="password-field">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Nhập mật khẩu"
                autoComplete="current-password"
                required
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)}>
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
          </label>

          <button className="button button-full button-large" disabled={submitting} type="submit">
            {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <p className="form-note">Chưa có tài khoản? <Link to="/register">Tạo tài khoản</Link></p>
          <Link className="auth-back-link" to="/">← Trở lại SmartNews</Link>
        </form>
      </div>
    </section>
  )
}
