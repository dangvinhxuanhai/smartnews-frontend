
import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  App as AntdApp,
  Avatar,
  Button,
  Card,
  Col,
  ConfigProvider,
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
  CloseCircleOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons'

import { externalSourceApi } from '../../api/externalSourceApi.js'
import { useAuth } from '../../context/AuthContext.jsx'
import { getApiError } from '../../utils/apiError.js'
import { formatDate } from '../../utils/formatters.js'
import ExternalSourceDrawer from '../../components/newsroom/ExternalSourceDrawer.jsx'

const { Text, Title } = Typography

// Tìm kiếm không phân biệt dấu tiếng Việt.
const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()

const safeUrl = (value) => {
  try {
    const url = new URL(value)

    return ['http:', 'https:'].includes(url.protocol)
      ? url.href
      : null
  } catch {
    return null
  }
}

const createdTime = (item) => {
  const time = new Date(item.createdDate ?? 0).getTime()
  return Number.isNaN(time) ? 0 : time
}

function ExternalSourcesContent() {
  const { user } = useAuth()
  const { message } = AntdApp.useApp()
  const canManage = user?.role === 'Admin'

  // Dữ liệu backend
  const [sources, setSources] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [refreshKey, setRefreshKey] = useState(0)

  // Form và trạng thái cập nhật
  const [changingId, setChangingId] = useState(null)
  const [editor, setEditor] = useState({
    open: false,
    id: null,
  })

  // Search, filter, sort và pagination
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState('all')
  const [country, setCountry] = useState(undefined)
  const [language, setLanguage] = useState(undefined)
  const [sortBy, setSortBy] = useState('nameAsc')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  // Tải toàn bộ External Sources.
  useEffect(() => {
    let active = true

    setLoading(true)
    setError('')

    externalSourceApi.getAll()
      .then(({ data }) => {
        if (!active) return

        if (!Array.isArray(data)) {
          throw new Error('Invalid source response')
        }

        setSources(data)
      })
      .catch((err) => {
        if (active) {
          setError(
            getApiError(err, 'Không thể tải nguồn tin.')
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [refreshKey])

  // Tạo option từ dữ liệu thật.
  const countryOptions = useMemo(
    () =>
      [...new Set(
        sources.map(s => s.countryCode).filter(Boolean)
      )]
        .sort()
        .map(value => ({ label: value, value })),
    [sources]
  )

  const languageOptions = useMemo(
    () =>
      [...new Set(
        sources.map(s => s.languageCode).filter(Boolean)
      )]
        .sort()
        .map(value => ({ label: value, value })),
    [sources]
  )

  // Search + Filter + Sort.
  const filtered = useMemo(() => {
    const query = normalize(keyword)

    return sources
      .filter((source) => {
        if (
          query &&
          !normalize(`${source.name} ${source.code}`)
            .includes(query)
        ) {
          return false
        }

        if (
          status !== 'all' &&
          Boolean(source.active) !== (status === 'active')
        ) {
          return false
        }

        if (
          country &&
          source.countryCode !== country
        ) {
          return false
        }

        if (
          language &&
          source.languageCode !== language
        ) {
          return false
        }

        return true
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return createdTime(b) - createdTime(a)
        }

        if (sortBy === 'oldest') {
          return createdTime(a) - createdTime(b)
        }

        const comparison =
          String(a.name ?? '').localeCompare(
            String(b.name ?? ''),
            'vi'
          )

        return sortBy === 'nameDesc'
          ? -comparison
          : comparison
      })
  }, [
    sources,
    keyword,
    status,
    country,
    language,
    sortBy,
  ])

  const updateFilter = (setter) => (value) => {
    setter(value)
    setPage(1)
  }

  const resetFilters = () => {
    setKeyword('')
    setStatus('all')
    setCountry(undefined)
    setLanguage(undefined)
    setSortBy('nameAsc')
    setPage(1)
  }

  // Active/Inactive
  const changeStatus = async (source) => {
    if (!canManage || changingId !== null) return

    setChangingId(source.sourceId)

    try {
      await externalSourceApi.changeStatus(
        source.sourceId,
        !source.active
      )

      message.success(
        source.active
          ? 'Đã tắt nguồn tin.'
          : 'Đã bật nguồn tin.'
      )

      setRefreshKey(key => key + 1)
    } catch (err) {
      message.error(
        getApiError(
          err,
          'Không thể đổi trạng thái nguồn.'
        )
      )
    } finally {
      setChangingId(null)
    }
  }

  const columns = [
    {
      title: 'Nguồn tin',
      key: 'name',
      width: 250,
      render: (_, source) => (
        <Space align="center" size="middle">
          <Avatar
            shape="square"
            size={40}
            src={safeUrl(source.logoUrl) || undefined}
          >
            S
          </Avatar>

          <Space orientation="vertical" size={2}>
            <Text strong>{source.name}</Text>

            <Text
              type="secondary"
              style={{ fontSize: 12 }}
            >
              {source.code} · #{source.sourceId}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: 'Website',
      dataIndex: 'websiteUrl',
      width: 210,
      render: (value) =>
        safeUrl(value) ? (
          <a
            href={safeUrl(value)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Mở website ↗
          </a>
        ) : '—',
    },
    {
      title: 'RSS',
      dataIndex: 'rssUrl',
      width: 150,
      render: (value) =>
        safeUrl(value) ? (
          <a
            href={safeUrl(value)}
            target="_blank"
            rel="noopener noreferrer"
          >
            Xem RSS ↗
          </a>
        ) : '—',
    },
    {
      title: 'Quốc gia',
      dataIndex: 'countryCode',
      width: 100,
      render: value => value || '—',
    },
    {
      title: 'Ngôn ngữ',
      dataIndex: 'languageCode',
      width: 110,
      render: value => value || '—',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'active',
      width: 120,
      render: value => (
        <Tag color={value ? 'success' : 'default'}>
          {value ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      width: 135,
      render: value => formatDate(value),
    },

    // Chỉ Admin nhìn thấy thao tác quản trị.
    ...(canManage ? [{
      title: 'Thao tác',
      key: 'actions',
      width: 165,
      fixed: 'right',
      render: (_, source) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() =>
              setEditor({
                open: true,
                id: source.sourceId,
              })
            }
          >
            Sửa
          </Button>

          <Popconfirm
            title={
              source.active
                ? 'Tắt nguồn tin?'
                : 'Bật nguồn tin?'
            }
            description={
              source.active
                ? 'Nguồn sẽ chuyển sang Inactive.'
                : 'Nguồn sẽ chuyển sang Active.'
            }
            okText="Xác nhận"
            cancelText="Hủy"
            onConfirm={() => changeStatus(source)}
          >
            <Button
              size="small"
              danger={source.active}
              loading={
                changingId === source.sourceId
              }
              disabled={changingId !== null}
            >
              {source.active ? 'Tắt' : 'Bật'}
            </Button>
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ]

  return (
    <section style={{ padding: '32px 0 56px' }}>
      <Row
        justify="space-between"
        align="middle"
        gutter={[16, 16]}
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
            External Sources
          </Title>

          <Text type="secondary">
            Quản lý các nguồn tin được sử dụng
            trong hệ thống multi-source.
          </Text>
        </Col>

        {canManage && (
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
              Thêm nguồn tin
            </Button>
          </Col>
        )}
      </Row>

      {error && (
        <Alert
          type="error"
          showIcon
          message={error}
          style={{ marginBottom: 16 }}
          action={
            <Button
              size="small"
              onClick={() =>
                setRefreshKey(v => v + 1)
              }
            >
              Thử lại
            </Button>
          }
        />
      )}

      {/* Search / Filter / Sort */}
      <Card style={{ marginBottom: 18 }}>
        <Row gutter={[12, 12]}>
          <Col xs={24} md={12} lg={7}>
            <Input
              value={keyword}
              onChange={event =>
                updateFilter(setKeyword)(
                  event.target.value
                )
              }
              placeholder="Tìm theo tên hoặc mã nguồn..."
              allowClear
            />
          </Col>

          <Col xs={12} md={6} lg={4}>
            <Select
              value={status}
              onChange={updateFilter(setStatus)}
              style={{ width: '100%' }}
              options={[
                {
                  value: 'all',
                  label: 'Tất cả trạng thái',
                },
                {
                  value: 'active',
                  label: 'Active',
                },
                {
                  value: 'inactive',
                  label: 'Inactive',
                },
              ]}
            />
          </Col>

          <Col xs={12} md={6} lg={3}>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Quốc gia"
              value={country}
              onChange={updateFilter(setCountry)}
              style={{ width: '100%' }}
              options={countryOptions}
            />
          </Col>

          <Col xs={12} md={6} lg={3}>
            <Select
              allowClear
              showSearch
              optionFilterProp="label"
              placeholder="Ngôn ngữ"
              value={language}
              onChange={updateFilter(setLanguage)}
              style={{ width: '100%' }}
              options={languageOptions}
            />
          </Col>

          <Col xs={12} md={6} lg={4}>
            <Select
              value={sortBy}
              onChange={updateFilter(setSortBy)}
              style={{ width: '100%' }}
              options={[
                {
                  value: 'nameAsc',
                  label: 'Tên A–Z',
                },
                {
                  value: 'nameDesc',
                  label: 'Tên Z–A',
                },
                {
                  value: 'newest',
                  label: 'Mới nhất',
                },
                {
                  value: 'oldest',
                  label: 'Cũ nhất',
                },
              ]}
            />
          </Col>

          <Col xs={24} md={6} lg={3}>
            <Space>
              <Button
                icon={<CloseCircleOutlined />}
                aria-label="Xóa bộ lọc"
                title="Xóa bộ lọc"
                onClick={resetFilters}
              />

              <Button
                icon={<ReloadOutlined />}
                aria-label="Tải lại danh sách"
                title="Tải lại danh sách"
                onClick={() =>
                  setRefreshKey(key => key + 1)
                }
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Bảng danh sách */}
      <Card
        title={`Nguồn tin (${filtered.length}/${sources.length})`}
      >
        <Table
          rowKey="sourceId"
          loading={loading}
          columns={columns}
          dataSource={error ? [] : filtered}
          size="middle"
          scroll={{ x: 1050 }}
          locale={{
            emptyText: 'Không có nguồn tin phù hợp.',
          }}
          pagination={{
            current: Math.min(
              page,
              Math.max(
                1,
                Math.ceil(filtered.length / pageSize)
              )
            ),
            pageSize,
            total: filtered.length,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            showTotal: total =>
              `Tổng ${total} nguồn`,

            onChange: (nextPage, nextSize) => {
              setPage(
                nextSize === pageSize
                  ? nextPage
                  : 1
              )
              setPageSize(nextSize)
            },
          }}
        />
      </Card>

      {/* Form Add / Edit */}
      {canManage && (
        <ExternalSourceDrawer
          open={editor.open}
          sourceId={editor.id}
          onClose={() =>
            setEditor({
              open: false,
              id: null,
            })
          }
          onSaved={() => {
            setEditor({
              open: false,
              id: null,
            })

            setRefreshKey(key => key + 1)
          }}
        />
      )}
    </section>
  )
}

// Sử dụng theme tối như Article Management.
export default function ExternalSourcesPage() {
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
        <ExternalSourcesContent />
      </AntdApp>
    </ConfigProvider>
  )
}
