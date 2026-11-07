
import { useEffect, useMemo, useState } from 'react'
import {
  Alert, App as AntdApp, Button, Col, Divider,
  Input, List, Popconfirm, Row, Select, Space,
  Table, Tag, Typography,
} from 'antd'
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons'

import { storyApi } from '../../api/storyApi.js'
import { articleApi } from '../../api/articleApi.js'
import { externalArticleApi } from '../../api/externalArticleApi.js'
import { externalSourceApi } from '../../api/externalSourceApi.js'
import { getApiError } from '../../utils/apiError.js'

const { Text } = Typography

export default function StoryArticlePicker({
  story,
  kind,
  onChanged,
}) {
  const { message } = AntdApp.useApp()
  const external = kind === 'external'

  const [keywordInput, setKeywordInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [sourceId, setSourceId] = useState(undefined)
  const [sources, setSources] = useState([])

  const [page, setPage] = useState(0)
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [reload, setReload] = useState(0)

  const linked = external
    ? story.sources ?? []
    : story.smartNewsArticles ?? []

  const idKey = external
    ? 'externalArticleId'
    : 'articleId'

  const linkedIds = useMemo(
    () => new Set(linked.map(item => item[idKey])),
    [linked, idKey]
  )

  // Chỉ External Articles cần lọc theo Source.
  useEffect(() => {
    if (!external) return

    let active = true

    externalSourceApi.getAll()
      .then(({ data }) => {
        if (active) {
          setSources(Array.isArray(data) ? data : [])
        }
      })
      .catch(() => {
        if (active) {
          message.warning('Không tải được bộ lọc Source.')
        }
      })

    return () => {
      active = false
    }
  }, [external, message])

  // Tìm bài viết đủ điều kiện để liên kết.
  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const response = external
          ? await externalArticleApi.search({
              keyword,
              sourceId,
              reviewStatus: 'Reviewed',
              sortBy: 'newest',
              page,
              size: 8,
            })
          : await articleApi.search({
              keyword,
              status: 'Published',
              sortBy: 'newest',
              page,
              size: 8,
            })

        if (!active) return

        setRows(response.data?.content ?? [])
        setTotal(response.data?.totalElements ?? 0)
      } catch (err) {
        if (!active) return

        setRows([])
        setTotal(0)
        setError(
          getApiError(err, 'Không thể tải danh sách bài viết.')
        )
      } finally {
        if (active) setLoading(false)
      }
    }

    load()

    return () => {
      active = false
    }
  }, [external, keyword, sourceId, page, reload])

  const attach = async (articleId) => {
    setBusyId(articleId)

    try {
      const response = external
        ? await storyApi.addExternalArticle(
            story.storyId,
            articleId
          )
        : await storyApi.addInternalArticle(
            story.storyId,
            articleId
          )

      onChanged(response.data)
      setReload(value => value + 1)
      message.success('Đã liên kết bài viết.')
    } catch (err) {
      message.error(
        getApiError(err, 'Không thể liên kết bài viết.')
      )
    } finally {
      setBusyId(null)
    }
  }

  const detach = async (articleId) => {
    setBusyId(articleId)

    try {
      const response = external
        ? await storyApi.removeExternalArticle(
            story.storyId,
            articleId
          )
        : await storyApi.removeInternalArticle(
            story.storyId,
            articleId
          )

      onChanged(response.data)
      setReload(value => value + 1)
      message.success('Đã gỡ bài viết.')
    } catch (err) {
      message.error(
        getApiError(err, 'Không thể gỡ bài viết.')
      )
    } finally {
      setBusyId(null)
    }
  }

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      ellipsis: true,
      render: value => (
        <Text ellipsis={{ tooltip: value }}>
          {value}
        </Text>
      ),
    },
    {
      title: external ? 'Nguồn tin' : 'Tác giả',
      width: 155,
      render: (_, row) =>
        external ? row.sourceName : row.authorName,
    },
    {
      title: 'Trạng thái',
      width: 115,
      render: (_, row) => (
        <Tag color="green">
          {external ? row.reviewStatus : row.status}
        </Tag>
      ),
    },
    {
      title: '',
      width: 90,
      render: (_, row) => {
        const articleId = row[idKey]
        const attached = linkedIds.has(articleId)

        return (
          <Button
            size="small"
            type={attached ? 'default' : 'primary'}
            icon={attached ? null : <PlusOutlined />}
            disabled={attached || busyId !== null}
            loading={busyId === articleId}
            onClick={() => attach(articleId)}
          >
            {attached ? 'Đã thêm' : 'Thêm'}
          </Button>
        )
      },
    },
  ]

  return (
    <Space
      orientation="vertical"
      size="large"
      style={{ width: '100%' }}
    >
      <div>
        <Text strong>
          Bài viết đã liên kết ({linked.length})
        </Text>

        <List
          style={{ marginTop: 12 }}
          bordered
          size="small"
          locale={{
            emptyText: 'Chưa có bài viết liên kết.',
          }}
          dataSource={linked}
          renderItem={(article) => (
            <List.Item
              actions={[
                <Popconfirm
                  key="remove"
                  title="Gỡ bài viết khỏi Story?"
                  okText="Gỡ"
                  cancelText="Hủy"
                  onConfirm={() => detach(article[idKey])}
                  disabled={story.status === 'Published'}
                >
                  <Button
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    disabled={
                      story.status === 'Published' ||
                      busyId !== null
                    }
                    loading={busyId === article[idKey]}
                  >
                    Gỡ
                  </Button>
                </Popconfirm>,
              ]}
            >
              <List.Item.Meta
                title={article.title}
                description={
                  external
                    ? article.sourceName
                    : `${article.authorName ?? ''} · ${article.status}`
                }
              />
            </List.Item>
          )}
        />
      </div>

      {story.status === 'Published' && (
        <Alert
          type="info"
          showIcon
          message="Hãy chuyển Story về Draft trước khi gỡ liên kết."
        />
      )}

      <Divider style={{ margin: 0 }} />

      <div>
        <Text strong>
          {external
            ? 'Tìm External Articles đã Reviewed'
            : 'Tìm bài SmartNews đã Published'}
        </Text>

        <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
          <Col xs={24} md={external ? 14 : 24}>
            <Input.Search
              allowClear
              placeholder="Tìm theo tiêu đề..."
              value={keywordInput}
              onChange={event => {
                setKeywordInput(event.target.value)

                if (!event.target.value) {
                  setKeyword('')
                  setPage(0)
                }
              }}
              onSearch={value => {
                setKeyword(value.trim())
                setPage(0)
              }}
            />
          </Col>

          {external && (
            <Col xs={24} md={10}>
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="Lọc theo nguồn tin"
                style={{ width: '100%' }}
                value={sourceId}
                options={sources.map(source => ({
                  label: source.name,
                  value: source.sourceId,
                }))}
                onChange={value => {
                  setSourceId(value)
                  setPage(0)
                }}
              />
            </Col>
          )}
        </Row>

        {error && (
          <Alert
            type="error"
            showIcon
            message={error}
            style={{ marginTop: 12 }}
            action={
              <Button onClick={() => setReload(v => v + 1)}>
                Thử lại
              </Button>
            }
          />
        )}

        <Table
          style={{ marginTop: 16 }}
          rowKey={idKey}
          size="small"
          loading={loading}
          dataSource={rows}
          columns={columns}
          scroll={{ x: 620 }}
          pagination={{
            current: page + 1,
            pageSize: 8,
            total,
            showSizeChanger: false,
            onChange: value => setPage(value - 1),
          }}
        />
      </div>
    </Space>
  )
}
