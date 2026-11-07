import { Link } from 'react-router'
import { formatDate, getExcerpt } from '../utils/formatters.js'

export default function StoryCard({ story }) {
  const sources = story.sourceNames ?? []

  return (
    <article className="news-card story-card">
      <Link
        className="news-card-media"
        to={`/stories/${story.storyId}`}
        aria-label={story.title}
      >
        {story.heroImageUrl ? (
          <img
            src={story.heroImageUrl}
            alt=""
            loading="lazy"
          />
        ) : (
          <div
            className="news-image-fallback"
            aria-hidden="true"
          >
            <span>STORY</span>
          </div>
        )}

        <span className="news-category">
          {story.categoryName || 'Multi-source'}
        </span>
      </Link>

      <div className="news-card-content">
        <div className="news-card-meta">
          <span>{formatDate(story.publishedDate)}</span>
          <span className="meta-dot" />
          <span>{story.sourceCount ?? 0} nguồn tin</span>
        </div>

        <h3>
          <Link to={`/stories/${story.storyId}`}>
            {story.title}
          </Link>
        </h3>

        <p>
          {getExcerpt(story.summary || '', 160)}
        </p>

        {sources.length > 0 && (
          <div className="story-card-sources">
            Nguồn: {sources.join(' · ')}
          </div>
        )}

        <div className="news-card-bottom">
          <span>
            {(story.viewCount ?? 0).toLocaleString('vi-VN')}
            {' '}lượt xem
          </span>

          <Link
            className="read-link"
            to={`/stories/${story.storyId}`}
          >
            Xem các nguồn <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </div>
    </article>
  )
}
