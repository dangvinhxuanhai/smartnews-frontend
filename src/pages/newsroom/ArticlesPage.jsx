
import { useEffect, useState } from 'react'
import {
  Alert,
  App as AntdApp,
  Button,
  Card,
  Col,
  ConfigProvider,
  DatePicker,
  Empty,
  Input,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  theme,
  Typography,
} from 'antd'
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'

import { articleApi } from '../../api/articleApi.js'
import { taxonomyApi } from '../../api/taxonomyApi.js'
import { getApiError } from '../../utils/apiError.js'
import { formatDate } from '../../utils/formatters.js'
import ArticleEditorDrawer from '../../components/newsroom/ArticleEditorDrawer.jsx'
import NameSearchSelect from '../../components/newsroom/NameSearchSelect.jsx'

const { Text, Title } = Typography
const { RangePicker } = DatePicker

// Các giá trị phải trùng enum backend
const STATUS_OPTIONS = [
  { label: 'Draft', value: 'Draft' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Published', value: 'Published' },
  { label: 'Rejected', value: 'Rejected' },
]

// Phải trùng buildSort() trong ArticleServiceImpl
const SORT_OPTIONS = [
  { label: 'Mới nhất', value: 'newest' },
  { label: 'Cũ nhất', value: 'oldest' },
  { label: 'Nhiều lượt xem', value: 'mostViewed' },
  {
    label: 'Cập nhật gần nhất',
    value: 'recentlyUpdate',
  },
]

const STATUS_COLORS = {
  Draft: 'default',
  Pending: 'gold',
  Published: 'green',
  Rejected: 'red',
}

const INITIAL_FILTERS = {
  keyword: '',
  categoryId: undefined,
  status: undefined,
  tagId: undefined,
  fromDate: undefined,
  toDate: undefined,
  sortBy: 'newest',
  page: 0,
  size: 10,
}

function ArticlesContent() {
  const { message } = AntdApp.useApp()

  const [filters, setFilters] = useState(INITIAL_FILTERS)
  const [keywordDraft, setKeywordDraft] = useState('')
  const [dateRange, setDateRange] = useState(null)

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

  // Load Category và Tag một lần
  useEffect(() => {
    let active = true

    Promise.all([
      taxonomyApi.getCategories(),
      taxonomyApi.getTags(),
    ])
      .then(([categoriesResponse, tagsResponse]) => {
        if (!active) return

        setCategories(categoriesResponse.data ?? [])
        setTags(tagsResponse.data ?? [])
      })
      .catch((err) => {
        if (active) {
          setMetadataError(
            getApiError(
              err,
              'Không tải được danh mục/tags.'
            )
          )
        }
      })

    return () => {
      active = false
    }
  }, [])

  // Load danh sách mỗi khi filter/page/sort thay đổi
  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')

    articleApi.search(filters)
      .then(({ data }) => {
        if (!active) return

        setRows(data.content ?? [])
        setTotal(data.totalElements ?? 0)
      })
      .catch((err) => {
        if (active) {
          setError(
            getApiError(
              err,
              'Không tải được danh sách bài viết.'
            )
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [filters, reload])

  // Khi filter đổi, quay về trang đầu
  const updateFilters = (changes) => {
    setFilters((current) => ({
      ...current,
      ...changes,
      page: 0,
    }))
  }

  const resetFilters = () => {
    setKeywordDraft('')
    setDateRange(null)
    setFilters({ ...INITIAL_FILTERS })
  }

  const deleteArticle = async (row) => {
    setDeletingId(row.articleId)

    try {
      await articleApi.remove(row.articleId)
      message.success('Đã xóa bài viết.')

      // Nếu xóa phần tử cuối trang, quay về trang trước
      if (rows.length === 1 && filters.page > 0) {
        setFilters((current) => ({
          ...current,
          page: current.page - 1,
        }))
      } else {
        setReload((n) => n + 1)
      }
    } catch (err) {
      message.error(
        getApiError(err, 'Không thể xóa bài viết.')
      )
    } finally {
      setDeletingId(null)
    }
  }

  // Cấu hình các cột trong Table
  const columns = [
    {
      title: 'Bài viết',
      key: 'title',
      width: 340,
      render: (_, row) => (
        <Space align="start" size="middle">
          {row.imageUrl ? (
            <img
              src={row.imageUrl}
              alt=""
              style={{
                width: 64,
                height: 56,
                objectFit: 'cover',
                borderRadius: 10,
              }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 56,
                borderRadius: 10,
                background: '#254366',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <Text>NEWS</Text>
            </div>
          )}

          <Space
            orientation="vertical"
            size={2}
            style={{ maxWidth: 245 }}
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
              #{row.articleId} · {row.authorName}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Danh mục',
      dataIndex: 'categoryName',
      width: 140,
      render: (value) => value || '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 125,
      render: (value) => (
        <Tag color={STATUS_COLORS[value] ?? 'default'}>
          {value}
        </Tag>
      ),
    },
    {
      title: 'Lượt xem',
      dataIndex: 'viewCount',
      width: 110,
      render: (value) =>
        (value ?? 0).toLocaleString('vi-VN'),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      width: 150,
      render: (value) => formatDate(value),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 165,
      fixed: 'right',
      render: (_, row) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() =>
              setEditor({
                open: true,
                id: row.articleId,
              })
            }
          >
            Sửa
          </Button>

          <Popconfirm
            title="Xóa bài viết?"
            description="Thao tác này không thể hoàn tác."
            okText="Xóa"
            okButtonProps={{
              danger: true,
              loading: deletingId === row.articleId,
            }}
            cancelText="Hủy"
            onConfirm={() => deleteArticle(row)}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              disabled={deletingId !== null}
              aria-label={`Xóa ${row.title}`}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <section style={{ padding: '32px 0 56px' }}>
      {/* Header */}
      <Row
        gutter={[16, 16]}
        align="middle"
        justify="space-between"
        style={{ marginBottom: 22 }}
      >
        <Col>
          <Text
            type="secondary"
            style={{
              letterSpacing: 2,
              fontSize: 12,
            }}
          >
            SMARTNEWS / NEWSROOM
          </Text>

          <Title
            level={2}
            style={{ margin: '6px 0' }}
          >
            Article Management
          </Title>

          <Text type="secondary">
            Quản lý bài nội bộ, tìm kiếm, chỉnh sửa
            và lưu bản nháp.
          </Text>
        </Col>

        <Col>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            disabled={categories.length === 0}
            onClick={() =>
              setEditor({ open: true, id: null })
            }
          >
            Tạo bài viết
          </Button>
        </Col>
      </Row>

      {metadataError && (
        <Alert
          showIcon
          type="warning"
          message={metadataError}
          style={{ marginBottom: 16 }}
        />
      )}

      {error && (
        <Alert
          showIcon
          type="error"
          message={error}
          action={
            <Button onClick={() => setReload((n) => n + 1)}>
              Thử lại
            </Button>
          }
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Filter toolbar */}
      <Card style={{ marginBottom: 18 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} lg={8}>
            <Input.Search
              allowClear
              value={keywordDraft}
              prefix={<SearchOutlined />}
              placeholder="Tìm theo tiêu đề..."
              enterButton="Tìm"
              onChange={(event) => {
                setKeywordDraft(event.target.value)

                if (event.target.value === '') {
                  updateFilters({ keyword: '' })
                }
              }}
              onSearch={(value) =>
                updateFilters({
                  keyword: value.trim(),
                })
              }
            />
          </Col>

          <Col xs={12} md={8} lg={4}>
            <Select
              allowClear
              placeholder="Trạng thái"
              style={{ width: '100%' }}
              value={filters.status}
              options={STATUS_OPTIONS}
              onChange={(status) =>
                updateFilters({ status })
              }
            />
          </Col>

          <Col xs={12} md={8} lg={4}>
            <NameSearchSelect
              items={categories}
              labelKey="categoryName"
              valueKey="categoryId"
              value={filters.categoryId}
              onChange={(categoryId) =>
                updateFilters({ categoryId })
              }
              placeholder="Tìm danh mục..."
              allowClear
            />
          </Col>

          <Col xs={12} md={8} lg={4}>
            <NameSearchSelect
              items={tags}
              labelKey="tagName"
              valueKey="tagId"
              value={filters.tagId}
              onChange={(tagId) =>
                updateFilters({ tagId })
              }
              placeholder="Tìm tag..."
              allowClear
            />
          </Col>

          <Col xs={12} md={8} lg={4}>
            <Select
              style={{ width: '100%' }}
              value={filters.sortBy}
              options={SORT_OPTIONS}
              onChange={(sortBy) =>
                updateFilters({ sortBy })
              }
            />
          </Col>

          {/* Date range */}
          <Col xs={24} md={16} lg={10}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              onChange={(dates) => {
                setDateRange(dates)

                updateFilters({
                  fromDate: dates?.[0]
                    ?.startOf('day')
                    .format('YYYY-MM-DDTHH:mm:ss'),

                  toDate: dates?.[1]
                    ?.endOf('day')
                    .format('YYYY-MM-DDTHH:mm:ss'),
                })
              }}
            />
          </Col>

          <Col
            xs={24}
            md={8}
            lg={14}
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button
              icon={<ReloadOutlined />}
              onClick={resetFilters}
            >
              Xóa bộ lọc
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Data table */}
      <Card
        title={`Danh sách bài viết (${total.toLocaleString('vi-VN')})`}
        extra={
          <Text type="secondary">
            Dữ liệu trực tiếp từ backend
          </Text>
        }
      >
        <Table
          rowKey="articleId"
          columns={columns}
          dataSource={rows}
          loading={loading}
          size="middle"
          scroll={{ x: 1050 }}
          locale={{
            emptyText: (
              <Empty
                description="Không có bài viết phù hợp."
              />
            ),
          }}
          pagination={{
            current: filters.page + 1,
            pageSize: filters.size,
            total,

            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],

            showTotal: (value) =>
              `Tổng ${value} bài`,

            onChange: (page, size) =>
              setFilters((current) => ({
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

      {/* Create / Edit Drawer */}
      <ArticleEditorDrawer
        open={editor.open}
        articleId={editor.id}
        categories={categories}
        tags={tags}
        onClose={() =>
          setEditor({
            open: false,
            id: null,
          })
        }
        onSaved={({ created }) => {
          setEditor({
            open: false,
            id: null,
          })

          if (created) {
            setKeywordDraft('')
            setDateRange(null)
            setFilters({
              ...INITIAL_FILTERS,
              status: 'Draft',
            })
          }

          setReload((n) => n + 1)
        }}
      />
    </section>
  )
}

// Theme chỉ áp dụng cho ArticlesPage
export default function ArticlesPage() {
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
          fontFamily: '"Be Vietnam Pro", sans-serif',
        },
      }}
    >
      <AntdApp>
        <ArticlesContent />
      </AntdApp>
    </ConfigProvider>
  )
}
