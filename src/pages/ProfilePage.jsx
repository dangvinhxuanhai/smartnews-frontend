import { useAuth } from '../context/AuthContext.jsx'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">MY ACCOUNT</p>
          <h1>Thông tin đăng nhập</h1>
        </div>
      </div>

      <div className="profile-card">
        <div>
          <span>Tên</span>
          <strong>{user.name}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{user.email}</strong>
        </div>
        <div>
          <span>Role</span>
          <strong>{user.role}</strong>
        </div>
      </div>
    </section>
  )
}
