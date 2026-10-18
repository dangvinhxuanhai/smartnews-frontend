import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <div className="status-card not-found">
      <p className="eyebrow">404</p>
      <h1>Không tìm thấy trang</h1>
      <Link className="button" to="/">
        Về trang chủ
      </Link>
    </div>
  )
}
