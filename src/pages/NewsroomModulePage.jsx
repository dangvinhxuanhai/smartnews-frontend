import { Navigate, useParams } from 'react-router'
import { useAuth } from '../context/AuthContext.jsx'
import { newsroomMenus } from '../layouts/NewsroomLayout.jsx'

const descriptions = {
  articles: 'Quản lý bài viết nội bộ, tìm kiếm, tạo mới, chỉnh sửa và xóa bài viết.',
  stories: 'Quản lý Story, trạng thái xuất bản và liên kết bài viết từ nhiều nguồn.',
  'external-articles': 'Tìm kiếm tin tức từ nguồn bên ngoài và nhập bài viết bằng URL.',
  sources: 'Theo dõi và quản lý những nguồn tin bên ngoài của SmartNews.',
  users: 'Tìm kiếm tài khoản, kiểm tra vai trò và cập nhật trạng thái người dùng.',
  categories: 'Quản lý các danh mục tin tức.',
  tags: 'Quản lý các thẻ phân loại nội dung.',
}

export default function NewsroomModulePage() {
  const { module } = useParams()
  const { user } = useAuth()

  const item = newsroomMenus
    .flatMap((group) => group.items)
    .find((entry) => entry.slug === module)

  if (!item || (item.adminOnly && user?.role !== 'Admin')) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <section className="newsroom-module-page">
      <div className="newsroom-module-header">
        <div>
          <p className="newsroom-module-eyebrow">CONTENT MANAGEMENT</p>
          <h1>{item.label}</h1>
          <p>{descriptions[module]}</p>
        </div>
      </div>

      <div className="newsroom-module-empty">
        <span className="newsroom-module-symbol">S</span>
        <h2>{item.label}</h2>
        <p>
          Giao diện quản lý của module này đang được xây dựng.
          Dữ liệu sẽ được tải trực tiếp từ SmartNews API.
        </p>
      </div>
    </section>
  )
}