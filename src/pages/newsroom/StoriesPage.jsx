
import { useEffect, useState } from 'react'
import {
  Alert, App as AntdApp, Button, Card, Col,
  ConfigProvider, Input, Popconfirm, Row,
  Select, Space, Table, Tag, theme, Typography,
} from 'antd'
import {
  DeleteOutlined, EditOutlined, PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'

import { storyApi } from '../../api/storyApi.js'
import { taxonomyApi } from '../../api/taxonomyApi.js'
import { getApiError } from '../../utils/apiError.js'
import { formatDate } from '../../utils/formatters.js'
import StoryEditorDrawer from '../../components/newsroom/StoryEditorDrawer.jsx'

const { Text, Title } = Typography

const INITIAL_FILTERS = {
  keyword: '',
  status: undefined,
  categoryId: undefined,
  sortBy: 'newest',
  page: 0,
  size: 10,
}

const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Cũ nhất', value: 'oldest' },
  { label: 'Nhiều lượt xem', value: 'mostViewed' },
]

const STATUS_OPTIONS = [
  { label: 'Draft', value: 'Draft' },
  { label: 'Published', value: 'Published' },
]

const normalize = value =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()

function StoriesContent() {
  const { message } = AntdApp.useApp()

  const [filters, setFilters] = useState({
    ...INITIAL_FILTERS,
  })
  const [keywordInput, setKeywordInput] = useState('')

  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [metadataError, setMetadataError] = useState('')

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reload, setReload] = useState(0)

  const [editor, setEditor] = useState({
    open: false,
    id: null,
  })

  const [deletingId, setDeletingId] = useState(null)

  // Tải Category và Tags độc lập.
  useEffect(() => {
    let active = true

    Promise.allSettled([
      taxonomyApi.getCategories(),
      taxonomyApi.getTags(),
    ]).then(([categoryResult, tagResult]) => {
      if (!active) return

      const errors = []

      if (
        categoryResult.status === 'fulfilled' &&
        Array.isArray(categoryResult.value.data)
      ) {
        setCategories(categoryResult.value.data)
      } else {
        setCategories([])
        errors.push('Không tải được Categories.')
      }

      if (
        tagResult.status === 'fulfilled' &&
        Array.isArray(tagResult.value.data)
      ) {
        setTags(tagResult.value.data)
      } else {
        setTags([])
        errors.push('Không tải được Tags.')
      }

      setMetadataError(errors.join(' '))
    })

    return () => {
      active = false
    }
  }, [])

  // Load Story List từ Spring Boot.
  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')

    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) =>
        value !== undefined &&
        value !== null &&
        value !== ''
      )
    )

    storyApi.search(params)
      .then(({ data }) => {
        if (!active) return

        setRows(
          Array.isArray(data?.content)
            ? data.content
            : []
        )

        setTotal(data?.totalElements ?? 0)
      })
      .catch(err => {
        if (!active) return

        setRows([])
        setTotal(0)

        setError(
          getApiError(err, 'Không tải được Stories.')
        )
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filters, reload])

  const refresh = () => {
    setReload(value => value + 1)
  }

  const updateFilters = changes => {
    setFilters(current => ({
      ...current,
      ...changes,
      page: 0,
    }))
  }

  const resetFilters = () => {
    setKeywordInput('')
    setFilters({ ...INITIAL_FILTERS })
  }

  const deleteStory = async (storyId) => {
    setDeletingId(storyId)

    try {
      await storyApi.remove(storyId)
      message.success('Đã xóa Story.')

      if (rows.length === 1 && filters.page > 0) {
        setFilters(current => ({
          ...current,
          page: current.page - 1,
        }))
      } else {
        refresh()
      }
    } catch (err) {
      message.error(
        getApiError(err, 'Không thể xóa Story.')
      )
    } finally {
      setDeletingId(null)
    }
  }

  const columns = [
    {
      title: 'Story',
      key: 'story',
      width: 340,
      render: (_, row) => (
        <Space align="start" size="middle">
          {row.heroImageUrl ? (
            <img
              src={row.heroImageUrl}
              alt=""
              style={{
                width: 72,
                height: 60,
                objectFit: 'cover',
                borderRadius: 10,
              }}
            />
          ) : (
            <div
              style={{
                width: 72,
                height: 60,
                borderRadius: 10,
                background: '#244469',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Text>STORY</Text>
            </div>
          )}

          <Space
            orientation="vertical"
            size={3}
            style={{ maxWidth: 250 }}
          >
            <Text
              strong
              ellipsis={{ tooltip: row.title }}
            >
              {row.title}
            </Text>

            <Text
              type="secondary"
              style={{ fontSize: 12 }}
            >
              #{row.storyId} · {row.createdByName}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'categoryName',
      width: 145,
      render: value => value || '—',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: value => (
        <Tag
          color={
            value === 'Published'
              ? 'green'
              : 'default'
          }
        >
          {value}
        </Tag>
      ),
    },
    {
      title: 'Sources',
      width: 95,
      render: (_, row) => {
        const count = new Set(
          (row.sources ?? [])
            .map(item => item.sourceId)
            .filter(id => id != null)
        ).size

        return count
      },
    },
    {
      title: 'Articles',
      width: 105,
      render: (_, row) =>
        (row.sources?.length ?? 0) +
        (row.smartNewsArticles?.length ?? 0),
    },
    {
      title: 'Views',
      dataIndex: 'viewCount',
      width: 100,
      render: value =>
        (value ?? 0).toLocaleString('vi-VN'),
    },
    {
      title: 'Created',
      dataIndex: 'createdDate',
      width: 145,
      render: value => formatDate(value),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 165,
      fixed: 'right',
      render: (_, row) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() =>
              setEditor({
                open: true,
                id: row.storyId,
              })
            }
          >
            Mở
          </Button>

          <Popconfirm
            title="Xóa Story?"
            description="Thao tác không thể hoàn tác."
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={() =>
              deleteStory(row.storyId)
            }
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              disabled={deletingId !== null}
              loading={deletingId === row.storyId}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <section style={{ padding: '32px 0 56px' }}>
      <Row
        align="middle"
        justify="space-between"
        gutter={[16, 16]}
        style={{ marginBottom: 24 }}
      >
        <Col>
          <Text
            type="secondary"
            style={{
              fontSize: 12,
              letterSpacing: 2,
            }}
          >
            SMARTNEWS / NEWSROOM
          </Text>

          <Title
            level={2}
            style={{ margin: '6px 0' }}
          >
            Story Management
          </Title>

          <Text type="secondary">
            Tạo và quản lý những câu chuyện
            được tổng hợp từ nhiều nguồn.
          </Text>
        </Col>

        <Col>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() =>
              setEditor({
                open: true,
                id: null,
              })
            }
          >
            Create Story
          </Button>
        </Col>
      </Row>

      {metadataError && (
        <Alert
          type="warning"
          showIcon
          message={metadataError}
          style={{ marginBottom: 16 }}
        />
      )}

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          style={{ marginBottom: 16 }}
          action={
            <Button onClick={refresh}>
              Thử lại
            </Button>
          }
        />
      )}

      {/* Search / Filter / Sort */}
      <Card style={{ marginBottom: 18 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} lg={8}>
            <Input.Search
              value={keywordInput}
              allowClear
              placeholder="Tìm Story theo tiêu đề..."
              enterButton="Tìm"
              onChange={event => {
                setKeywordInput(event.target.value)

                if (!event.target.value) {
                  updateFilters({ keyword: '' })
                }
              }}
              onSearch={value =>
                updateFilters({
                  keyword: value.trim(),
                })
              }
            />
          </Col>

          <Col xs={12} md={8} lg={5}>
            <Select
              allowClear
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              value={filters.status}
              options={STATUS_OPTIONS}
              onChange={status =>
                updateFilters({ status })
              }
            />
          </Col>

          <Col xs={12} md={8} lg={5}>
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
              style={{ width: '100%' }}
              value={filters.categoryId}
              options={categories.map(category => ({
                label: category.categoryName,
                value: Number(category.categoryId),
              }))}
              onChange={categoryId =>
                updateFilters({ categoryId })
              }
            />
          </Col>

          <Col xs={12} md={8} lg={4}>
            <Select
              style={{ width: '100%' }}
              value={filters.sortBy}
              options={SORT_OPTIONS}
              onChange={sortBy =>
                updateFilters({ sortBy })
              }
            />
          </Col>

          <Col xs={12} md={8} lg={2}>
            <Button
              icon={<ReloadOutlined />}
              title="Reset bộ lọc"
              onClick={resetFilters}
            />
          </Col>
        </Row>
      </Card>

      {/* Story Table */}
      <Card
        title={`Stories (${total})`}
        extra={
          <Button
            size="small"
            icon={<ReloadOutlined />}
            onClick={refresh}
          >
            Refresh
          </Button>
        }
      >
        <Table
          rowKey="storyId"
          columns={columns}
          dataSource={rows}
          loading={loading}
          size="middle"
          scroll={{ x: 1100 }}
          locale={{
            emptyText: 'Không có Story phù hợp.',
          }}
          pagination={{
            current: filters.page + 1,
            pageSize: filters.size,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: value =>
              `Tổng ${value} Stories`,
            onChange: (page, size) =>
              setFilters(current => ({
                ...current,
                page:
                  size === current.size
                    ? page - 1
                    : 0,
                size,
              })),
          }}
        />
      </Card>

      {/* Editor */}
      <StoryEditorDrawer
        open={editor.open}
        storyId={editor.id}
        categories={categories}
        tags={tags}
        onClose={() =>
          setEditor({
            open: false,
            id: null,
          })
        }
        onCreated={storyId => {
          setEditor({
            open: true,
            id: storyId,
          })
          refresh()
        }}
        onSaved={refresh}
      />
    </section>
  )
}

export default function StoriesPage() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#58a6ff',
          colorBgBase: '#0c1a30',
          colorBgContainer: '#172b49',
          colorBgElevated: '#203958',
          colorText: '#edf5ff',
          borderRadius: 12,
          fontFamily:
            '"Be Vietnam Pro", sans-serif',
        },
      }}
    >
      <AntdApp>
        <StoriesContent />
      </AntdApp>
    </ConfigProvider>
  )
}
