
import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import { publicStoryApi } from '../api/publicStoryApi.js'
import StoryCard from './StoryCard.jsx'

export default function HomeStorySection() {
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true

    publicStoryApi.search({
      page: 0,
      size: 3,
      sortBy: 'newest',
    })
      .then(({ data }) => {
        if (!active) return
        setStories(
          Array.isArray(data?.content)
            ? data.content
            : []
        )
      })
      .catch(() => {
        if (active) setError(true)
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  if (loading || error || stories.length === 0) {
    return null
  }

  return (
    <section className="content-section page-shell home-story-section">
      <div className="section-header-row">
        <div>
          <p className="eyebrow">MULTI-SOURCE</p>
          <h2>Câu chuyện từ nhiều nguồn</h2>
          <p className="section-description">
            Khám phá cách các nguồn tin đưa tin
            về cùng một câu chuyện.
          </p>
        </div>

        <Link className="text-button" to="/stories">
          Xem tất cả <span>↗</span>
        </Link>
      </div>

      <div className="article-grid">
        {stories.map(story => (
          <StoryCard
            key={story.storyId}
            story={story}
          />
        ))}
      </div>
    </section>
  )
}
