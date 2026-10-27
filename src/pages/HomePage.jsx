import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { articleApi } from '../api/articleApi.js'
import ArticleCard from '../components/ArticleCard.jsx'
import { getApiError } from '../utils/apiError.js'
import { formatDate, getExcerpt, getReadingTime } from '../utils/formatters.js'

function FeaturedStory({ article }) {
  if (!article) return null

  return (
    <article className="featured-story">
      <Link className="featured-media" to={`/articles/${article.articleId}`}>
        {article.imageUrl ? (
          <img src={article.imageUrl} alt="" />
        ) : (
          <div className="featured-fallback" aria-hidden="true"><span>SMARTNEWS</span></div>
        )}
        <div className="featured-overlay" />
        <div className="featured-content">
          <span className="featured-label">Nổi bật</span>
          <h2>{article.title}</h2>
          <div className="featured-meta">
            <span>{article.categoryName || 'News'}</span>
            <span>•</span>
            <span>{getReadingTime(article.content)} phút đọc</span>
          </div>
        </div>
      </Link>
    </article>
  )
}

function ArticleSkeleton() {
  return (
    <div className="news-card skeleton-card" aria-hidden="true">
      <div className="skeleton skeleton-image" />
      <div className="news-card-content">
        <div className="skeleton skeleton-line skeleton-line-short" />
        <div className="skeleton skeleton-line skeleton-line-title" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line skeleton-line-medium" />
      </div>
    </div>
  )
}

export default function HomePage() {
  const [articles, setArticles] = useState([])
  const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, totalElements: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadArticles = async (page = 0) => {
    setLoading(true)
    setError('')

    try {
      const response = await articleApi.getPublicArticles({
        page,
        size: 9,
        sortBy: 'newest',
      })

      setArticles(response.data.content ?? [])
      setPageInfo({
        number: response.data.number ?? page,
        totalPages: response.data.totalPages ?? 0,
        totalElements: response.data.totalElements ?? 0,
      })

      if (page > 0) {
        requestAnimationFrame(() => {
          document.getElementById('latest')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        })
      }
    } catch (err) {
      setError(getApiError(err, 'Không thể tải danh sách bài viết.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticles(0)
  }, [])

  const featured = pageInfo.number === 0 ? articles[0] : null
  const latestArticles = featured ? articles.slice(1) : articles

  return (
    <>
      <section className="home-hero">
        <div className="page-shell hero-grid">
          <div className="hero-copy reveal-up">
            <div className="live-pill"><span /> News, with context</div>
            <h1>
              Đừng chỉ đọc <em>headline.</em><br />
              Hãy hiểu câu chuyện.
            </h1>
            <p className="hero-description">
              SmartNews gom nội dung vào một trải nghiệm đọc sạch, nhanh và tập trung — đồng thời chuẩn bị cho cách nhìn một câu chuyện từ nhiều nguồn khác nhau.
            </p>
            <div className="hero-actions">
              <a className="button button-large" href="#latest">Đọc tin mới <span>↓</span></a>
              <a className="text-button" href="#why-smartnews">Khám phá SmartNews <span>↗</span></a>
            </div>

            <div className="hero-proof">
              <div>
                <strong>Clear</strong>
                <span>Trải nghiệm đọc ít nhiễu</span>
              </div>
              <div>
                <strong>Context</strong>
                <span>Thiết kế cho multi-source</span>
              </div>
              <div>
                <strong>Fast</strong>
                <span>Đi thẳng vào nội dung</span>
              </div>
            </div>
          </div>

          <div className="hero-feature reveal-up reveal-delay-1">
            {loading ? (
              <div className="featured-story featured-loading"><div className="skeleton skeleton-full" /></div>
            ) : featured ? (
              <FeaturedStory article={featured} />
            ) : (
              <div className="hero-empty-card">
                <span className="hero-empty-icon">S</span>
                <p className="eyebrow">SMARTNEWS</p>
                <h2>Những câu chuyện đáng đọc sẽ xuất hiện ở đây.</h2>
                <p>Khi có bài Published, tin mới nhất sẽ tự động trở thành câu chuyện nổi bật.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="signal-strip" aria-label="SmartNews principles">
        <div className="signal-track">
          <span>Independent reading</span><i>✦</i>
          <span>Multi-source ready</span><i>✦</i>
          <span>Clean interface</span><i>✦</i>
          <span>Newsroom workflow</span><i>✦</i>
          <span>Independent reading</span><i>✦</i>
          <span>Multi-source ready</span><i>✦</i>
        </div>
      </section>

      <section className="content-section page-shell" id="latest">
        <div className="section-header-row">
          <div>
            <p className="eyebrow">LATEST STORIES</p>
            <h2>Tin mới nhất</h2>
            <p className="section-description">Những bài viết vừa được xuất bản trên SmartNews.</p>
          </div>
          {!loading && !error && pageInfo.totalElements > 0 && (
            <span className="article-count">{pageInfo.totalElements} bài viết</span>
          )}
        </div>

        {error && (
          <div className="error-panel">
            <div>
              <strong>Không thể tải tin lúc này.</strong>
              <p>{error}</p>
            </div>
            <button className="button button-ghost" type="button" onClick={() => loadArticles(pageInfo.number)}>Thử lại</button>
          </div>
        )}

        {loading && (
          <div className="article-grid">
            {Array.from({ length: 6 }).map((_, index) => <ArticleSkeleton key={index} />)}
          </div>
        )}

        {!loading && !error && latestArticles.length === 0 && !featured && (
          <div className="empty-news-state">
            <div className="empty-news-symbol">⌁</div>
            <h3>Chưa có bài viết được xuất bản</h3>
            <p>Trang này sẽ tự động cập nhật khi newsroom xuất bản bài viết đầu tiên.</p>
          </div>
        )}

        {!loading && !error && latestArticles.length > 0 && (
          <div className="article-grid">
            {latestArticles.map((article) => <ArticleCard key={article.articleId} article={article} />)}
          </div>
        )}

        {pageInfo.totalPages > 1 && (
          <div className="pagination modern-pagination">
            <button
              className="pagination-button"
              disabled={pageInfo.number === 0 || loading}
              onClick={() => loadArticles(pageInfo.number - 1)}
            >
              <span>←</span> Trang trước
            </button>
            <div className="page-indicator">
              <strong>{pageInfo.number + 1}</strong>
              <span>/</span>
              <span>{pageInfo.totalPages}</span>
            </div>
            <button
              className="pagination-button"
              disabled={pageInfo.number + 1 >= pageInfo.totalPages || loading}
              onClick={() => loadArticles(pageInfo.number + 1)}
            >
              Trang sau <span>→</span>
            </button>
          </div>
        )}
      </section>

      <section className="context-section" id="why-smartnews">
        <div className="page-shell">
          <div className="context-heading">
            <p className="eyebrow eyebrow-light">BEYOND THE HEADLINE</p>
            <h2>Một câu chuyện.<br />Nhiều góc nhìn.</h2>
            <p>
              SmartNews được thiết kế để tiến xa hơn một danh sách bài viết: cùng một sự kiện có thể được gom thành story, so sánh nguồn và bổ sung bối cảnh khi backend hoàn thiện các tính năng đó.
            </p>
          </div>

          <div className="context-grid">
            <article className="context-card">
              <span className="context-number">01</span>
              <div className="context-icon">◎</div>
              <h3>Collect</h3>
              <p>Tập hợp bài viết nội bộ và nguồn bên ngoài quanh cùng một câu chuyện.</p>
            </article>
            <article className="context-card context-card-accent">
              <span className="context-number">02</span>
              <div className="context-icon">≋</div>
              <h3>Compare</h3>
              <p>Đưa nhiều nguồn về cùng một nơi để người đọc có thể đối chiếu thay vì mở hàng loạt tab.</p>
            </article>
            <article className="context-card">
              <span className="context-number">03</span>
              <div className="context-icon">◇</div>
              <h3>Understand</h3>
              <p>Ưu tiên summary, nguồn và bối cảnh trước các tín hiệu tương tác dễ gây nhiễu.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="editorial-section page-shell">
        <div className="editorial-card">
          <div>
            <p className="eyebrow">A CALMER NEWS EXPERIENCE</p>
            <h2>Ít nhiễu hơn.<br />Nhiều thông tin hơn.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              Không follower count, không số comment giả, không rating được dựng sẵn. Những tín hiệu cộng đồng chỉ xuất hiện khi chúng có dữ liệu thật và backend hỗ trợ đầy đủ.
            </p>
            <Link className="text-button" to="/register">Tham gia newsroom <span>↗</span></Link>
          </div>
        </div>
      </section>
    </>
  )
}
