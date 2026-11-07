import { useEffect, useState } from 'react'
import {
  Button,
  ConfigProvider,
  Input,
  Pagination,
  Select,
  theme,
} from 'antd'

import { publicStoryApi } from '../api/publicStoryApi.js'
import { taxonomyApi } from '../api/taxonomyApi.js'
import StoryCard from '../components/StoryCard.jsx'
import { getApiError } from '../utils/apiError.js'

const INITIAL_FILTERS = {
  keyword: '',
  categoryId: undefined,
  sortBy: 'newest',
  page: 0,
  size: 9,
}

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Cũ nhất', value: 'oldest' },
  { label: 'Nhiều lượt xem', value: 'mostViewed' },
]

function normalize(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
}

function PublicStoriesContent() {
  const [filters, setFilters] = useState({
    ...INITIAL_FILTERS,
  })
  const [searchInput, setSearchInput] = useState('')

  const [categories, setCategories] = useState([])
  const [categoryError, setCategoryError] = useState('')

  const [stories, setStories] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  // Lấy Category cho bộ lọc.
  useEffect(() => {
    let active = true

    taxonomyApi.getCategories()
      .then(({ data }) => {
        if (!active) return

        if (!Array.isArray(data)) {
          throw new Error('Invalid Category response')
        }

        setCategories(data)
      })
      .catch(() => {
        if (active) {
          setCategoryError(
            'Không tải được danh mục. Bạn vẫn có thể tìm Stories.'
          )
        }
      })

    return () => {
      active = false
    }
  }, [])

  // Search, filter, sort và pagination qua backend.
  useEffect(() => {
    let active = true

    const loadStories = async () => {
      setLoading(true)
      setError('')

      try {
        const { data } = await publicStoryApi.search(filters)

        if (!active) return

        if (!Array.isArray(data?.content)) {
          throw new Error('Invalid Story response')
        }

        setStories(data.content)
        setTotal(data.totalElements ?? 0)
      } catch (err) {
        if (!active) return

        setStories([])
        setTotal(0)
        setError(
          getApiError(err, 'Không tải được Stories.')
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    loadStories()

    return () => {
      active = false
    }
  }, [filters, reload])

  const updateFilters = (changes) => {
    setFilters(current => ({
      ...current,
      ...changes,
      page: 0,
    }))
  }

  const resetFilters = () => {
    setSearchInput('')
    setFilters({ ...INITIAL_FILTERS })
  }

  const categoryOptions = categories
    .filter(item => item.categoryId != null)
    .map(item => ({
      label: item.categoryName,
      value: Number(item.categoryId),
    }))

  return (
    <section className="content-section page-shell public-stories-page">
      <div className="section-header-row">
        <div>
          <p className="eyebrow">MULTI-SOURCE STORIES</p>
          <h2>Khám phá câu chuyện</h2>
          <p className="section-description">
            Một sự kiện, nhiều nguồn thông tin để đối chiếu.
          </p>
        </div>

        {!loading && !error && (
          <span className="article-count">
            {total} Stories
          </span>
        )}
      </div>

      <div className="public-story-filters">
        <Input.Search
          value={searchInput}
          placeholder="Tìm câu chuyện..."
          allowClear
          enterButton="Tìm kiếm"
          onChange={event => {
            setSearchInput(event.target.value)

            if (event.target.value === '') {
              updateFilters({ keyword: '' })
            }
          }}
          onSearch={value => {
            updateFilters({
              keyword: value.trim(),
            })
          }}
        />

        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          filterOption={(input, option) =>
            normalize(option?.label).includes(
              normalize(input)
            )
          }
          placeholder="Tìm Category..."
          options={categoryOptions}
          value={filters.categoryId}
          onChange={categoryId =>
            updateFilters({ categoryId })
          }
        />

        <Select
          value={filters.sortBy}
          options={SORT_OPTIONS}
          onChange={sortBy =>
            updateFilters({ sortBy })
          }
        />

        <Button onClick={resetFilters}>
          Xóa bộ lọc
        </Button>
      </div>

      {categoryError && (
        <div className="story-notice">{categoryError}</div>
      )}

      {error && (
        <div className="error-panel">
          <p>{error}</p>
          <button
            className="button"
            onClick={() => setReload(n => n + 1)}
          >
            Thử lại
          </button>
        </div>
      )}

      {loading && (
        <div className="article-grid">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              className="news-card skeleton-card"
              key={index}
            >
              <div className="skeleton skeleton-image" />
              <div className="news-card-content">
                <div className="skeleton skeleton-line" />
                <div className="skeleton skeleton-line-title" />
                <div className="skeleton skeleton-line" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && stories.length === 0 && (
        <div className="empty-news-state">
          <h3>Chưa tìm thấy câu chuyện</h3>
          <p>
            Hãy thử từ khóa khác hoặc thay đổi bộ lọc.
          </p>
        </div>
      )}

      {!loading && !error && stories.length > 0 && (
        <>
          <div className="article-grid">
            {stories.map(story => (
              <StoryCard
                key={story.storyId}
                story={story}
              />
            ))}
          </div>

          <div className="story-pagination">
            <Pagination
              current={filters.page + 1}
              total={total}
              pageSize={filters.size}
              showSizeChanger
              pageSizeOptions={[9, 18, 36]}
              onChange={(page, size) => {
                setFilters(current => ({
                  ...current,
                  page:
                    size === current.size
                      ? page - 1
                      : 0,
                  size,
                }))
              }}
            />
          </div>
        </>
      )}
    </section>
  )
}

export default function PublicStoriesPage() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#58a6ff',
          colorBgContainer: '#1b3556',
          colorBgElevated: '#203958',
          colorText: '#edf5ff',
          borderRadius: 12,
          fontFamily: '"Be Vietnam Pro", sans-serif',
        },
      }}
    >
      <PublicStoriesContent />
    </ConfigProvider>
  )
}
