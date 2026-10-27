import { useState } from 'react'
import { Link } from 'react-router'
import { authApi } from '../api/authApi.js'
import { getApiError } from '../utils/apiError.js'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

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
    <section className="auth-page auth-page-register">
      <div className="auth-visual auth-visual-register">
        <div className="auth-orb auth-orb-one" />
        <div className="auth-orb auth-orb-two" />
        <div className="auth-visual-content">
          <Link className="brand brand-light" to="/">
            <span className="brand-mark">S</span>
            <span className="brand-word">SmartNews</span>
          </Link>
          <div>
            <p className="eyebrow eyebrow-light">JOIN THE NEWSROOM</p>
            <h1>Biến thông tin<br />thành câu chuyện.</h1>
            <p>Tạo tài khoản để bắt đầu làm việc trong newsroom và xây dựng nội dung cho SmartNews.</p>
          </div>
          <div className="auth-visual-note">
            <span>02</span>
            <p>Every useful story starts with a reliable source.</p>
          </div>
        </div>
      </div>

      <div className="auth-form-side">
        <form className="auth-card modern-auth-card" onSubmit={handleSubmit}>
          <div className="auth-card-heading">
            <span className="auth-kicker">Create account</span>
            <h2>Tham gia SmartNews</h2>
            <p>Bắt đầu với một tài khoản newsroom mới.</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <label className="form-field">
            <span>Họ tên</span>
            <input name="name" value={form.name} onChange={handleChange} placeholder="Nguyễn Văn A" maxLength={100} required />
          </label>

          <label className="form-field">
            <span>Email</span>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" autoComplete="email" required />
          </label>

          <label className="form-field">
            <span>Mật khẩu</span>
            <div className="password-field">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                placeholder="Tối thiểu 6 ký tự"
                minLength={6}
                maxLength={100}
                autoComplete="new-password"
                required
              />
              <button type="button" onClick={() => setShowPassword((value) => !value)}>{showPassword ? 'Ẩn' : 'Hiện'}</button>
            </div>
          </label>

          <button className="button button-full button-large" disabled={submitting} type="submit">
            {submitting ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>

          <p className="form-note">Đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
          <Link className="auth-back-link" to="/">← Trở lại SmartNews</Link>
        </form>
      </div>
    </section>
  )
}
