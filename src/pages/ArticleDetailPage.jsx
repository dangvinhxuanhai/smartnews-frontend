import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { articleApi } from '../api/articleApi.js'
import { getApiError } from '../utils/apiError.js'

export default function ArticleDetailPage() {
  const { id } = useParams()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadArticle = async () => {
      try {
        const response = await articleApi.getPublicArticleById(id)
        setArticle(response.data)
      } catch (err) {
        setError(getApiError(err, 'Không thể tải bài viết.'))
      } finally {
        setLoading(false)
      }
    }

    loadArticle()
  }, [id])

  if (loading) return <div className="status-card">Đang tải bài viết...</div>
  if (error) return <div className="alert alert-error">{error}</div>
  if (!article) return null

  return (
    <article className="article-detail">
      <Link className="back-link" to="/">
        ← Quay lại trang chủ
      </Link>

      <p className="eyebrow">{article.categoryName}</p>
      <h1>{article.title}</h1>

      <div className="article-detail-meta">
        <span>Tác giả: {article.authorName}</span>
        <span>{article.viewCount ?? 0} lượt xem</span>
      </div>

      {article.imageUrl && <img className="article-detail-image" src={article.imageUrl} alt={article.title} />}

      <div className="article-content">{article.content}</div>

      {article.tags?.length > 0 && (
        <div className="tag-list">
          {article.tags.map((tag) => (
            <span className="tag" key={tag}>
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
