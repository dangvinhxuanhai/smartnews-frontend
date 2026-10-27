import { useAuth } from '../context/AuthContext.jsx'

export default function ProfilePage() {
  const { user } = useAuth()

  return (
    <section className="page-shell profile-page">
      <div className="profile-hero">
        <div className="profile-avatar-large">{user.name?.charAt(0)?.toUpperCase() || 'U'}</div>
        <div><p className="eyebrow">MY ACCOUNT</p><h1>{user.name}</h1><p>Thông tin tài khoản đang được sử dụng trong SmartNews Newsroom.</p></div>
      </div>

      <div className="profile-card modern-profile-card">
        <div><span>Tên hiển thị</span><strong>{user.name}</strong></div>
        <div><span>Email</span><strong>{user.email}</strong></div>
        <div><span>Vai trò</span><strong><i className="role-dot" />{user.role}</strong></div>
      </div>
    </section>
  )
}
