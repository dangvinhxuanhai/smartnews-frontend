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

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

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
    <div className="auth-layout">
      <section className="auth-intro">
        <p className="eyebrow">WELCOME BACK</p>
        <h1>Đăng nhập SmartNews</h1>
        <p>
          Sau khi Spring Boot trả JWT, React lưu token và dùng nó để gọi các API được bảo vệ.
        </p>
      </section>

      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Đăng nhập</h2>

        {error && <div className="alert alert-error">{error}</div>}

        <label className="form-field">
          <span>Email</span>
          <input
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="staff@example.com"
            autoComplete="email"
            required
          />
        </label>

        <label className="form-field">
          <span>Mật khẩu</span>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Nhập mật khẩu"
            autoComplete="current-password"
            required
          />
        </label>

        <button className="button button-full" disabled={submitting} type="submit">
          {submitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>

        <p className="form-note">
          Chưa có tài khoản? <Link to="/register">Đăng ký</Link>
        </p>
      </form>
    </div>
  )
}
