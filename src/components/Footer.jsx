import { Link } from 'react-router'

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="site-footer">
      <div className="footer-shell">
        <div className="footer-top">
          <div className="footer-brand-block">
            <Link className="brand brand-light" to="/">
              <span className="brand-mark">S</span>
              <span className="brand-word">SmartNews</span>
            </Link>
            <p>
              Một không gian đọc tin tập trung vào sự rõ ràng, nguồn tin và bối cảnh — để bạn dành ít thời gian lướt hơn và nhiều thời gian hiểu hơn.
            </p>
          </div>

          <div className="footer-links-group">
            <div>
              <strong>Khám phá</strong>
              <Link to="/">Trang chủ</Link>
              <a href="/#latest">Tin mới</a>
              <a href="/#why-smartnews">Cách hoạt động</a>
            </div>
            <div>
              <strong>Sản phẩm</strong>
              <Link to="/login">Newsroom</Link>
              <span>Multi-source stories</span>
              <span>Personalized reading</span>
            </div>
            <div>
              <strong>Kết nối</strong>
              <span>About SmartNews</span>
              <span>Privacy</span>
              <span>Contact</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© {year} SmartNews. All rights reserved.</span>
          <span className="footer-status"><i /> Built for a clearer news experience</span>
        </div>
      </div>
    </footer>
  )
}
