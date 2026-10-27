import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router'
import { articleApi } from '../api/articleApi.js'
import ArticleCard from '../components/ArticleCard.jsx'
import { getApiError } from '../utils/apiError.js'
import { formatDate, getReadingTime } from '../utils/formatters.js'

export default function ArticleDetailPage() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [relatedArticles, setRelatedArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [shareLabel, setShareLabel] = useState('Chia sẻ')

  useEffect(() => {
    const loadPage = async () => {
      setLoading(true)
      setError('')

      try {
        const [articleResponse, relatedResponse] = await Promise.all([
          articleApi.getPublicArticleById(id),
          articleApi.getPublicArticles({ page: 0, size: 4, sortBy: 'newest' }),
        ])

        setArticle(articleResponse.data)
        setRelatedArticles(
          (relatedResponse.data.content ?? [])
            .filter((item) => String(item.articleId) !== String(id))
            .slice(0, 3),
        )
      } catch (err) {
        setError(getApiError(err, 'Không thể tải bài viết.'))
      } finally {
        setLoading(false)
      }
    }

    loadPage()
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [id])

  const readingTime = useMemo(() => getReadingTime(article?.content), [article?.content])

  const handleShare = async () => {
    if (!article) return

    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, url: window.location.href })
        return
      }

      await navigator.clipboard.writeText(window.location.href)
      setShareLabel('Đã sao chép')
      window.setTimeout(() => setShareLabel('Chia sẻ'), 1800)
    } catch {
      // The native share dialog can be cancelled by the user. No error UI is needed.
    }
  }

  if (loading) {
    return (
      <div className="page-shell article-loading-page">
        <div className="skeleton skeleton-line skeleton-line-short" />
        <div className="skeleton skeleton-heading" />
        <div className="skeleton skeleton-heading skeleton-heading-small" />
        <div className="skeleton skeleton-hero" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="page-shell narrow-state-page">
        <div className="error-panel">
          <div><strong>Không thể mở bài viết.</strong><p>{error}</p></div>
          <Link className="button button-ghost" to="/">Về trang chủ</Link>
        </div>
      </div>
    )
  }

  if (!article) return null

  return (
    <>
      <article className="article-page page-shell">
        <div className="article-breadcrumb">
          <Link to="/">Trang chủ</Link>
          <span>/</span>
          <span>{article.categoryName || 'News'}</span>
        </div>

        <header className="article-header">
          <div className="article-kicker-row">
            <span className="news-category static-category">{article.categoryName || 'News'}</span>
            <span>{formatDate(article.createdDate)}</span>
          </div>
          <h1>{article.title}</h1>
          <div className="article-byline-row">
            <div className="author-lockup">
              <span className="author-avatar">{article.authorName?.charAt(0)?.toUpperCase() || 'S'}</span>
              <div>
                <strong>{article.authorName || 'SmartNews'}</strong>
                <span>{readingTime} phút đọc · {article.viewCount ?? 0} lượt xem</span>
              </div>
            </div>
            <button className="share-button" type="button" onClick={handleShare}>
              <span aria-hidden="true">↗</span> {shareLabel}
            </button>
          </div>
        </header>

        {article.imageUrl ? (
          <figure className="article-hero-image">
            <img src={article.imageUrl} alt={article.title} />
          </figure>
        ) : (
          <div className="article-hero-placeholder"><span>SMARTNEWS</span></div>
        )}

        <div className="article-layout">
          <aside className="article-rail">
            <span className="rail-label">Bài viết</span>
            <div className="rail-line" />
            <span>{readingTime} phút đọc</span>
            <span>{article.viewCount ?? 0} lượt xem</span>
          </aside>

          <div className="article-main-column">
            <div className="article-content">{article.content}</div>

            {article.tags?.length > 0 && (
              <div className="tag-list article-tags">
                {article.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}
              </div>
            )}

            <div className="article-end-mark"><span>S</span></div>

            <section className="future-engagement" aria-label="Future community features">
              <div className="engagement-heading">
                <div>
                  <p className="eyebrow">COMMUNITY</p>
                  <h2>Thảo luận & đánh giá</h2>
                </div>
                <span className="coming-soon-badge">Coming soon</span>
              </div>

              <div className="engagement-grid">
                <div className="engagement-card">
                  <div className="engagement-icon">☆</div>
                  <h3>Đánh giá bài viết</h3>
                  <p>Rating sẽ xuất hiện khi hệ thống có API lưu và tổng hợp đánh giá thật từ người dùng.</p>
                  <div className="disabled-rating" aria-label="Rating chưa khả dụng">
                    <span>☆</span><span>☆</span><span>☆</span><span>☆</span><span>☆</span>
                  </div>
                </div>
                <div className="engagement-card">
                  <div className="engagement-icon">◌</div>
                  <h3>Bình luận</h3>
                  <p>Khu vực thảo luận đã được chừa sẵn trong thiết kế và sẽ kết nối backend ở giai đoạn sau.</p>
                  <button className="button button-disabled" type="button" disabled>Viết bình luận</button>
                </div>
              </div>
            </section>
          </div>

          <aside className="article-side-note">
            <div className="side-note-card">
              <span className="side-note-mark">S</span>
              <h3>Read beyond the headline.</h3>
              <p>SmartNews đang hướng tới việc nhóm nhiều nguồn quanh cùng một story để người đọc có thêm bối cảnh trước khi kết luận.</p>
              <a href="/#why-smartnews">Cách SmartNews hoạt động →</a>
            </div>
          </aside>
        </div>
      </article>

      {relatedArticles.length > 0 && (
        <section className="related-section">
          <div className="page-shell">
            <div className="section-header-row">
              <div><p className="eyebrow">KEEP READING</p><h2>Đọc tiếp</h2></div>
              <Link className="text-button" to="/">Xem tất cả <span>↗</span></Link>
            </div>
            <div className="article-grid related-grid">
              {relatedArticles.map((item) => <ArticleCard key={item.articleId} article={item} compact />)}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
