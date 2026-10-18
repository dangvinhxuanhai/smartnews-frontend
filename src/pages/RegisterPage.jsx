import { useState } from 'react'
import { Link } from 'react-router'
import { authApi } from '../api/authApi.js'
import { getApiError } from '../utils/apiError.js'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setSubmitting(true)

    try {
      const response = await authApi.register(form)
      setSuccess(`${response.data.message}. Hãy kiểm tra email để xác minh tài khoản.`)
      setForm({ name: '', email: '', password: '' })
    } catch (err) {
      setError(getApiError(err, 'Đăng ký thất bại.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-intro">
        <p className="eyebrow">NEW ACCOUNT</p>
        <h1>Tạo tài khoản Staff</h1>
        <p>
          Backend hiện tự gán tài khoản đăng ký mới thành role Staff và yêu cầu xác minh email trước khi đăng nhập.
        </p>
      </section>

      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Đăng ký</h2>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <label className="form-field">
          <span>Họ tên</span>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            maxLength={100}
            required
          />
        </label>

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
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Tối thiểu 6 ký tự"
            minLength={6}
            maxLength={100}
            autoComplete="new-password"
            required
          />
        </label>

        <button className="button button-full" disabled={submitting} type="submit">
          {submitting ? 'Đang tạo tài khoản...' : 'Đăng ký'}
        </button>

        <p className="form-note">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </form>
    </div>
  )
}
