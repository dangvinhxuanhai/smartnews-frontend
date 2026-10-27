import { Link } from 'react-router'

export default function NotFoundPage() {
  return (
    <section className="not-found-page page-shell">
      <span className="not-found-number">404</span>
      <p className="eyebrow">PAGE NOT FOUND</p>
      <h1>Có vẻ câu chuyện này<br />không tồn tại.</h1>
      <p>Trang bạn đang tìm có thể đã được di chuyển hoặc đường dẫn không còn chính xác.</p>
      <Link className="button button-large" to="/">Về trang chủ</Link>
    </section>
  )
}
