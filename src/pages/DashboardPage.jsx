import { useEffect, useState } from 'react'
import { dashboardApi } from '../api/dashboardApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getApiError } from '../utils/apiError.js'

const ADMIN_STATS = [
  ['Tổng bài viết', 'totalArticles', '01'],
  ['Đã xuất bản', 'publishedArticles', '02'],
  ['Bản nháp', 'draftArticles', '03'],
  ['Tổng người dùng', 'totalUsers', '04'],
  ['Người dùng hoạt động', 'activeUsers', '05'],
  ['Danh mục', 'totalCategories', '06'],
  ['Tags', 'totalTags', '07'],
  ['Lượt xem', 'totalViews', '08'],
]

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(user.role === 'Admin')
  const [error, setError] = useState('')

  useEffect(() => {
    if (user.role !== 'Admin') return

    const loadDashboard = async () => {
      try {
        const response = await dashboardApi.getAdminDashboard()
        setStats(response.data)
      } catch (err) {
        setError(getApiError(err, 'Không thể tải dashboard Admin.'))
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [user.role])

  return (
    <section className="page-shell dashboard-page">
      <div className="dashboard-hero">
        <div>
          <p className="eyebrow">NEWSROOM</p>
          <h1>Chào {user.name},</h1>
          <p>Đây là không gian điều hành nội dung SmartNews của bạn.</p>
        </div>
        <span className="role-badge">{user.role}</span>
      </div>

      {user.role === 'Staff' && (
        <div className="workspace-grid">
          <article className="workspace-card workspace-card-primary">
            <span className="workspace-index">01</span>
            <div><p className="eyebrow eyebrow-light">CONTENT</p><h2>Articles</h2><p>Tạo, chỉnh sửa và chuẩn bị bài viết trước khi xuất bản.</p></div>
            <span className="coming-soon-badge coming-soon-dark">UI tiếp theo</span>
          </article>
          <article className="workspace-card"><span className="workspace-index">02</span><h3>Stories</h3><p>Nhóm nhiều bài viết và nguồn thành một câu chuyện có bối cảnh.</p></article>
          <article className="workspace-card"><span className="workspace-index">03</span><h3>Sources</h3><p>Theo dõi các nguồn bên ngoài phục vụ quy trình multi-source.</p></article>
        </div>
      )}

      {user.role === 'Admin' && loading && (
        <div className="stats-grid">{Array.from({ length: 8 }).map((_, i) => <div className="stat-card" key={i}><div className="skeleton skeleton-line" /><div className="skeleton skeleton-stat" /></div>)}</div>
      )}
      {user.role === 'Admin' && error && <div className="alert alert-error">{error}</div>}

      {user.role === 'Admin' && stats && (
        <>
          <div className="dashboard-section-title"><h2>Tổng quan hệ thống</h2><span>Live data</span></div>
          <div className="stats-grid">
            {ADMIN_STATS.map(([label, key, index]) => (
              <div className="stat-card" key={key}>
                <div className="stat-top"><span>{label}</span><i>{index}</i></div>
                <strong>{stats[key] ?? 0}</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  )
}
