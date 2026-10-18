import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { articleApi } from '../api/articleApi.js'
import { getApiError } from '../utils/apiError.js'

export default function HomePage() {
  const [articles, setArticles] = useState([])
  const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadArticles = async (page = 0) => {
    setLoading(true)
    setError('')

    try {
      const response = await articleApi.getPublicArticles({
        page,
        size: 6,
        sortBy: 'newest',
      })

      setArticles(response.data.content ?? [])
      setPageInfo({
        number: response.data.number ?? 0,
        totalPages: response.data.totalPages ?? 0,
      })
    } catch (err) {
      setError(getApiError(err, 'Không thể tải danh sách bài viết.'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadArticles(0)
  }, [])

  return (
    <>
      <section className="hero">
        <p className="eyebrow">SMARTNEWS</p>
        <h1>Tin tức đơn giản, rõ ràng và dễ quản lý.</h1>
        <p>
          Đây là giao diện React đầu tiên kết nối trực tiếp với Spring Boot API của project.
        </p>
      </section>

      <section className="section-heading">
        <div>
          <p className="eyebrow">BÀI VIẾT</p>
          <h2>Tin mới nhất</h2>
        </div>
      </section>

      {loading && <div className="status-card">Đang tải bài viết...</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && articles.length === 0 && (
        <div className="status-card">Chưa có bài viết Published.</div>
      )}

      <div className="article-grid">
        {articles.map((article) => (
          <article className="article-card" key={article.articleId}>
            {article.imageUrl ? (
              <img className="article-image" src={article.imageUrl} alt={article.title} />
            ) : (
              <div className="article-image article-image-placeholder">SmartNews</div>
            )}

            <div className="article-body">
              <div className="article-meta">
                <span>{article.categoryName}</span>
                <span>•</span>
                <span>{article.viewCount ?? 0} lượt xem</span>
              </div>

              <h3>{article.title}</h3>
              <p className="article-excerpt">{article.content}</p>

              <div className="article-footer">
                <span>{article.authorName}</span>
                <Link to={`/articles/${article.articleId}`}>Đọc tiếp →</Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {pageInfo.totalPages > 1 && (
        <div className="pagination">
          <button
            className="button button-ghost"
            disabled={pageInfo.number === 0 || loading}
            onClick={() => loadArticles(pageInfo.number - 1)}
          >
            ← Trang trước
          </button>
          <span>
            Trang {pageInfo.number + 1}/{pageInfo.totalPages}
          </span>
          <button
            className="button button-ghost"
            disabled={pageInfo.number + 1 >= pageInfo.totalPages || loading}
            onClick={() => loadArticles(pageInfo.number + 1)}
          >
            Trang sau →
          </button>
        </div>
      )}
    </>
  )
}
