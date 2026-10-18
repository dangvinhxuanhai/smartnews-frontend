import { useEffect, useState } from 'react'
import { dashboardApi } from '../api/dashboardApi.js'
import { useAuth } from '../context/AuthContext.jsx'
import { getApiError } from '../utils/apiError.js'

const ADMIN_STATS = [
  ['Tổng bài viết', 'totalArticles'],
  ['Đã xuất bản', 'publishedArticles'],
  ['Bản nháp', 'draftArticles'],
  ['Tổng người dùng', 'totalUsers'],
  ['Người dùng hoạt động', 'activeUsers'],
  ['Danh mục', 'totalCategories'],
  ['Tags', 'totalTags'],
  ['Lượt xem', 'totalViews'],
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
    <section>
      <div className="section-heading">
        <div>
          <p className="eyebrow">DASHBOARD</p>
          <h1>Xin chào, {user.name}</h1>
          <p className="muted">Bạn đang đăng nhập với role {user.role}.</p>
        </div>
      </div>

      {user.role === 'Staff' && (
        <div className="status-card">
          <h3>Staff area đã sẵn sàng</h3>
          <p>
            Bước frontend tiếp theo sẽ là màn hình quản lý bài viết: xem bài của hệ thống, tạo Draft, sửa, xoá và upload ảnh.
          </p>
        </div>
      )}

      {user.role === 'Admin' && loading && <div className="status-card">Đang tải thống kê...</div>}
      {user.role === 'Admin' && error && <div className="alert alert-error">{error}</div>}

      {user.role === 'Admin' && stats && (
        <div className="stats-grid">
          {ADMIN_STATS.map(([label, key]) => (
            <div className="stat-card" key={key}>
              <span>{label}</span>
              <strong>{stats[key] ?? 0}</strong>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
