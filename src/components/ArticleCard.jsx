import { Link } from 'react-router'
import { formatDate, getExcerpt, getReadingTime } from '../utils/formatters.js'

export default function ArticleCard({ article, compact = false }) {
  return (
    <article className={`news-card ${compact ? 'news-card-compact' : ''}`}>
      <Link className="news-card-media" to={`/articles/${article.articleId}`} aria-label={article.title}>
        {article.imageUrl ? (
          <img src={article.imageUrl} alt="" loading="lazy" />
        ) : (
          <div className="news-image-fallback" aria-hidden="true">
            <span>SN</span>
          </div>
        )}
        <span className="news-category">{article.categoryName || 'News'}</span>
      </Link>

      <div className="news-card-content">
        <div className="news-card-meta">
          <span>{formatDate(article.createdDate)}</span>
          <span className="meta-dot" />
          <span>{getReadingTime(article.content)} phút đọc</span>
        </div>

        <h3>
          <Link to={`/articles/${article.articleId}`}>{article.title}</Link>
        </h3>

        {!compact && <p>{getExcerpt(article.content)}</p>}

        <div className="news-card-bottom">
          <span>{article.authorName || 'SmartNews'}</span>
          <Link className="read-link" to={`/articles/${article.articleId}`}>
            Đọc bài <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
