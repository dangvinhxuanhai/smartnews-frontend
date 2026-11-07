import { useEffect, useState } from 'react'
import {
  Alert, App as AntdApp, Button, Card, Col, ConfigProvider,
  DatePicker, Form, Input, Modal, Row, Select, Space,
  Table, Tag, theme, Typography,
} from 'antd'
import {
  EyeOutlined, ImportOutlined, ReloadOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { externalArticleApi } from '../../api/externalArticleApi.js'
import { externalSourceApi } from '../../api/externalSourceApi.js'
import { taxonomyApi } from '../../api/taxonomyApi.js'
import { getApiError } from '../../utils/apiError.js'
import { formatDate } from '../../utils/formatters.js'
import ExternalArticleDetailDrawer from '../../components/newsroom/ExternalArticleDetailDrawer.jsx'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const STATUS_COLORS = {
  Pending: 'gold',
  Reviewed: 'green',
  Ignored: 'default',
}

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Reviewed', value: 'Reviewed' },
  { label: 'Ignored', value: 'Ignored' },
]

// Tên sortBy đúng với ExternalArticleServiceImpl.buildSort().
const SORT_OPTIONS = [
  { label: 'Mới xuất bản', value: 'newest' },
  { label: 'Cũ nhất', value: 'oldest' },
  { label: 'Tiêu đề A–Z', value: 'title' },
  { label: 'Mới import', value: 'recentlyImported' },
]

const INITIAL_FILTERS = {
  keyword: '',
  sourceId: undefined,
  categoryId: undefined,
  originalCategory: '',
  reviewStatus: undefined,
  fromDate: undefined,
  toDate: undefined,
  sortBy: 'newest',
  page: 0,
  size: 20,
}

const normalize = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLowerCase()

const nameSearch = {
  optionFilterProp: 'label',
  filterOption: (input, option) =>
    normalize(option?.label).includes(normalize(input)),
}

function safeUrl(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

function ExternalArticlesContent() {
  const { message } = AntdApp.useApp()
  const [filters, setFilters] = useState({ ...INITIAL_FILTERS })
  const [keywordInput, setKeywordInput] = useState('')
  const [originalInput, setOriginalInput] = useState('')
  const [dateRange, setDateRange] = useState(null)

  const [sources, setSources] = useState([])
  const [categories, setCategories] = useState([])
  const [metadataError, setMetadataError] = useState('')

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  const [importOpen, setImportOpen] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importForm] = Form.useForm()
  const [detailId, setDetailId] = useState(null)

  // Metadata for name-based Select: load APIs independently.
  useEffect(() => {
    let active = true

    Promise.allSettled([
      externalSourceApi.getAll(),
      taxonomyApi.getCategories(),
    ]).then(([sourceResult, categoryResult]) => {
      if (!active) return
      const errors = []

      if (sourceResult.status === 'fulfilled' && Array.isArray(sourceResult.value.data)) {
        setSources(sourceResult.value.data)
      } else {
        setSources([])
        errors.push('Không tải được danh sách nguồn tin.')
      }

      if (categoryResult.status === 'fulfilled' && Array.isArray(categoryResult.value.data)) {
        setCategories(categoryResult.value.data)
      } else {
        setCategories([])
        errors.push('Không tải được danh mục.')
      }

      setMetadataError(errors.join(' '))
    })

    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')

    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) =>
        value !== undefined && value !== null && value !== ''
      )
    )

    externalArticleApi.search(params)
      .then(({ data }) => {
        if (!active) return
        setRows(Array.isArray(data?.content) ? data.content : [])
        setTotal(Number(data?.totalElements ?? 0))
      })
      .catch((err) => {
        if (!active) return
        setRows([])
        setTotal(0)
        setError(getApiError(err, 'Không thể tải danh sách bài báo ngoài.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [filters, refreshKey])

  const updateFilters = (changes) => setFilters(current => ({
    ...current,
    ...changes,
    page: 0,
  }))

  const resetFilters = () => {
    setFilters({ ...INITIAL_FILTERS })
    setKeywordInput('')
    setOriginalInput('')
    setDateRange(null)
  }

  const handleImport = async ({ url }) => {
    if (importing) return
    setImporting(true)
    try {
      const { data } = await externalArticleApi.importFromUrl(url.trim())
      message.success('Đã import bài báo.')
      setImportOpen(false)
      importForm.resetFields()
      resetFilters()
      setRefreshKey(v => v + 1)
      if (data?.externalArticleId != null) {
        setDetailId(data.externalArticleId)
      }
    } catch (err) {
      message.error(getApiError(err, 'Import URL thất bại.'))
    } finally {
      setImporting(false)
    }
  }

  const columns = [
    {
      title: 'Bài báo',
      key: 'article',
      width: 340,
      render: (_, row) => (
        <Space align="start" size="middle">
          {safeUrl(row.imageUrl) ? (
            <img
              src={safeUrl(row.imageUrl)}
              alt=""
              style={{ width: 70, height: 56, borderRadius: 9, objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: 70, height: 56, borderRadius: 9, background: '#29486b', display: 'grid', placeItems: 'center' }}>
              <Text type="secondary">NEWS</Text>
            </div>
          )}
          <Space orientation="vertical" size={2} style={{ maxWidth: 245 }}>
            <Text strong ellipsis={{ tooltip: row.title }}>
              {row.title || 'Không có tiêu đề'}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              #{row.externalArticleId} · {row.author || 'Chưa rõ tác giả'}
            </Text>
          </Space>
        </Space>
      ),
    },
    { title: 'Nguồn', dataIndex: 'sourceName', width: 160, render: v => v || '—' },
    { title: 'Danh mục gốc', dataIndex: 'originalCategory', width: 150, render: v => v || '—' },
    { title: 'Category SmartNews', dataIndex: 'categoryName', width: 165, render: v => v || 'Chưa gán' },
    {
      title: 'Review', dataIndex: 'reviewStatus', width: 120,
      render: value => <Tag color={STATUS_COLORS[value] ?? 'default'}>{value}</Tag>,
    },
    { title: 'Xuất bản', dataIndex: 'publishedAt', width: 145, render: value => value ? formatDate(value) : 'Chưa rõ' },
    {
      title: 'Thao tác', key: 'actions', fixed: 'right', width: 120,
      render: (_, row) => (
        <Button size="small" icon={<EyeOutlined />} onClick={() => setDetailId(row.externalArticleId)}>
          Chi tiết
        </Button>
      ),
    },
  ]

  return (
    <section style={{ padding: '32px 0 56px' }}>
      <Row align="middle" justify="space-between" gutter={[16, 16]} style={{ marginBottom: 22 }}>
        <Col>
          <Text type="secondary" style={{ fontSize: 12, letterSpacing: 2 }}>SMARTNEWS / NEWSROOM</Text>
          <Title level={2} style={{ margin: '6px 0' }}>External Articles</Title>
          <Text type="secondary">Tìm, kiểm duyệt và chuẩn bị tin từ nguồn ngoài cho Story.</Text>
        </Col>
        <Col>
          <Button type="primary" size="large" icon={<ImportOutlined />} onClick={() => setImportOpen(true)}>
            Import từ URL
          </Button>
        </Col>
      </Row>

      {metadataError && <Alert type="warning" showIcon message={metadataError} style={{ marginBottom: 16 }} />}
      {error && (
        <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }}
          action={<Button onClick={() => setRefreshKey(v => v + 1)}>Thử lại</Button>} />
      )}

      <Card style={{ marginBottom: 18 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} lg={8}>
            <Input.Search
              prefix={<SearchOutlined />}
              value={keywordInput}
              allowClear
              placeholder="Tìm tiêu đề hoặc nội dung..."
              enterButton="Tìm"
              onChange={e => {
                setKeywordInput(e.target.value)
                if (!e.target.value) updateFilters({ keyword: '' })
              }}
              onSearch={value => updateFilters({ keyword: value.trim() })}
            />
          </Col>

          <Col xs={12} md={8} lg={5}>
            <Select
              style={{ width: '100%' }}
              allowClear
              showSearch={nameSearch}
              placeholder="Tìm nguồn tin..."
              value={filters.sourceId}
              options={sources.map(s => ({ label: s.name, value: Number(s.sourceId) }))}
              onChange={sourceId => updateFilters({ sourceId })}
            />
          </Col>

          <Col xs={12} md={8} lg={5}>
            <Select
              style={{ width: '100%' }}
              allowClear
              showSearch={nameSearch}
              placeholder="Tìm Category..."
              value={filters.categoryId}
              options={categories.map(c => ({ label: c.categoryName, value: Number(c.categoryId) }))}
              onChange={categoryId => updateFilters({ categoryId })}
            />
          </Col>

          <Col xs={12} md={8} lg={6}>
            <Select
              style={{ width: '100%' }}
              allowClear
              placeholder="Review Status"
              value={filters.reviewStatus}
              options={STATUS_OPTIONS}
              onChange={reviewStatus => updateFilters({ reviewStatus })}
            />
          </Col>

          <Col xs={24} md={10} lg={7}>
            <Input.Search
              value={originalInput}
              allowClear
              placeholder="Danh mục gốc (khớp chính xác)"
              enterButton="Lọc"
              onChange={e => {
                setOriginalInput(e.target.value)
                if (!e.target.value) updateFilters({ originalCategory: '' })
              }}
              onSearch={value => updateFilters({ originalCategory: value.trim() })}
            />
          </Col>

          <Col xs={24} md={10} lg={7}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày xuất bản', 'Đến ngày']}
              onChange={dates => {
                setDateRange(dates)
                updateFilters({
                  fromDate: dates?.[0]?.startOf('day').format('YYYY-MM-DDTHH:mm:ss'),
                  toDate: dates?.[1]?.endOf('day').format('YYYY-MM-DDTHH:mm:ss'),
                })
              }}
            />
          </Col>

          <Col xs={12} md={4} lg={5}>
            <Select
              style={{ width: '100%' }}
              value={filters.sortBy}
              options={SORT_OPTIONS}
              onChange={sortBy => updateFilters({ sortBy })}
            />
          </Col>

          <Col xs={12} md={24} lg={5}>
            <Space>
              <Button onClick={resetFilters}>Xóa bộ lọc</Button>
              <Button icon={<ReloadOutlined />} aria-label="Tải lại" onClick={() => setRefreshKey(v => v + 1)} />
            </Space>
          </Col>
        </Row>
      </Card>

      <Card title={`Danh sách bài ngoài (${total.toLocaleString('vi-VN')})`}>
        <Table
          rowKey="externalArticleId"
          loading={loading}
          columns={columns}
          dataSource={rows}
          scroll={{ x: 1250 }}
          locale={{ emptyText: 'Không có bài báo phù hợp.' }}
          pagination={{
            current: filters.page + 1,
            pageSize: filters.size,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50, 100],
            showTotal: value => `Tổng ${value} bài`,
            onChange: (page, size) => setFilters(current => ({
              ...current,
              page: size === current.size ? page - 1 : 0,
              size,
            })),
          }}
        />
      </Card>

      <Modal
        open={importOpen}
        title="Import External Article"
        okText="Import"
        okButtonProps={{ loading: importing }}
        cancelText="Hủy"
        onOk={() => importForm.submit()}
        onCancel={() => { if (!importing) { setImportOpen(false); importForm.resetFields() } }}
        closable={!importing}
        maskClosable={!importing}
        destroyOnHidden
      >
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 18 }}
          message="Import từ nguồn đã đăng ký"
          description="URL phải thuộc External Source đang Active. Backend hiện chỉ đọc metadata, không lấy toàn bộ nội dung bài."
        />
        <Form form={importForm} layout="vertical" onFinish={handleImport} disabled={importing}>
          <Form.Item name="url" label="URL bài báo" rules={[
            { required: true, whitespace: true, message: 'Nhập URL bài báo.' },
            { type: 'url', message: 'URL không hợp lệ.' },
            { max: 2000, message: 'URL tối đa 2000 ký tự.' },
          ]}>
            <Input placeholder="https://example.com/news/article" maxLength={2000} />
          </Form.Item>
        </Form>
      </Modal>

      <ExternalArticleDetailDrawer
        open={detailId != null}
        articleId={detailId}
        categories={categories}
        onClose={() => setDetailId(null)}
        onReviewed={() => setRefreshKey(v => v + 1)}
      />
    </section>
  )
}

export default function ExternalArticlesPage() {
  return (
    <ConfigProvider theme={{
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
    }}>
      <AntdApp>
        <ExternalArticlesContent />
      </AntdApp>
    </ConfigProvider>
  )
}