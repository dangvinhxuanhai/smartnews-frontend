
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'

import { publicStoryApi } from '../api/publicStoryApi.js'
import { getApiError } from '../utils/apiError.js'
import { formatDate } from '../utils/formatters.js'

function safeExternalUrl(value) {
  try {
    const url = new URL(value)

    return ['http:', 'https:'].includes(url.protocol)
      ? url.href
      : null
  } catch {
    return null
  }
}

export default function PublicStoryDetailPage() {
  const { id } = useParams()

  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')
    setStory(null)

    publicStoryApi.getById(id)
      .then(({ data }) => {
        if (active) setStory(data)
      })
      .catch(err => {
        if (active) {
          setError(
            getApiError(err, 'Không tải được Story.')
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [id, reload])

  const sources = story?.sources ?? []
  const internalArticles = story?.smartNewsArticles ?? []

  const sourceCount = new Set(
    sources
      .map(article => article.sourceName)
      .filter(Boolean)
  ).size

  return (
    <section className="page-shell article-page story-detail-page">
      <nav className="article-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span>/</span>
        <Link to="/stories">Multi-source Stories</Link>
        <span>/</span>
        <span>Chi tiết</span>
      </nav>

      {loading && (
        <div className="status-card">
          Đang tải câu chuyện...
        </div>
      )}

      {error && (
        <div className="error-panel">
          <div>
            <strong>Không thể mở Story.</strong>
            <p>{error}</p>
          </div>

          <button
            className="button"
            onClick={() => setReload(n => n + 1)}
          >
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && story && (
        <>
          <header className="article-header story-detail-header">
            <div className="article-kicker-row">
              <span className="news-category static-category">
                {story.categoryName || 'Multi-source'}
              </span>
              <span>{sourceCount} nguồn tin</span>
            </div>

            <h1>{story.title}</h1>

            <div className="story-detail-meta">
              <span>
                Xuất bản: {formatDate(story.publishedDate)}
              </span>

              <span>
                {(story.viewCount ?? 0).toLocaleString('vi-VN')}
                {' '}lượt xem
              </span>
            </div>
          </header>

          {story.heroImageUrl && (
            <figure className="article-hero-image">
              <img src={story.heroImageUrl} alt="" />
            </figure>
          )}

          <div className="story-detail-body">
            <section className="story-detail-panel">
              <p className="eyebrow">OVERVIEW</p>
              <h2>Tổng quan câu chuyện</h2>

              <p className="story-detail-summary">
                {story.summary ||
                  'Story này chưa có phần tóm tắt.'}
              </p>

              {story.tags?.length > 0 && (
                <div className="tag-list">
                  {story.tags.map(tag => (
                    <span className="tag" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className="story-detail-panel">
              <p className="eyebrow">SOURCE COVERAGE</p>
              <h2>Bài viết từ các nguồn bên ngoài</h2>

              <p className="story-section-description">
                {sources.length} bài báo được liên kết,
                thuộc {sourceCount} nguồn tin.
              </p>

              {sources.length === 0 ? (
                <p>Chưa có nguồn bài viết để hiển thị.</p>
              ) : (
                <div className="story-source-list">
                  {sources.map(article => {
                    const url = safeExternalUrl(article.url)

                    return (
                      <article
                        className="story-source-item"
                        key={article.externalArticleId}
                      >
                        <div className="story-source-meta">
                          <strong>
                            {article.sourceName}
                          </strong>

                          {article.publishedAt && (
                            <span>
                              {formatDate(article.publishedAt)}
                            </span>
                          )}
                        </div>

                        <h3>{article.title}</h3>

                        {url ? (
                          <a
                            className="story-external-link"
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Đọc bài gốc ↗
                          </a>
                        ) : (
                          <span className="story-muted">
                            Không có URL bài gốc hợp lệ.
                          </span>
                        )}
                      </article>
                    )
                  })}
                </div>
              )}
            </section>

            {internalArticles.length > 0 && (
              <section className="story-detail-panel">
                <p className="eyebrow">SMARTNEWS COVERAGE</p>
                <h2>Bài viết SmartNews liên quan</h2>

                <div className="story-source-list">
                  {internalArticles.map(article => (
                    <article
                      className="story-source-item"
                      key={article.articleId}
                    >
                      <div className="story-source-meta">
                        <strong>SmartNews</strong>
                        <span>
                          {article.authorName}
                        </span>
                      </div>

                      <h3>{article.title}</h3>

                      <Link
                        className="story-external-link"
                        to={`/articles/${article.articleId}`}
                      >
                        Đọc bài viết ↗
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <Link className="button button-ghost" to="/stories">
              ← Quay lại danh sách Stories
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
