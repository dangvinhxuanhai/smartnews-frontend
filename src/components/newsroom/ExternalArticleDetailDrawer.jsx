import { useEffect, useState } from 'react'
import {
  Alert, App as AntdApp, Button, Descriptions, Drawer,
  Form, Image, Input, Select, Space, Spin, Tag, Typography,
} from 'antd'
import { externalArticleApi } from '../../api/externalArticleApi.js'
import { getApiError } from '../../utils/apiError.js'
import { formatDate } from '../../utils/formatters.js'

const { Paragraph, Text, Title } = Typography

const STATUS_OPTIONS = [
  { label: 'Pending', value: 'Pending' },
  { label: 'Reviewed', value: 'Reviewed' },
  { label: 'Ignored', value: 'Ignored' },
]

const STATUS_COLORS = {
  Pending: 'gold',
  Reviewed: 'green',
  Ignored: 'default',
}

const normalize = (value) => String(value ?? '')
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/đ/g, 'd')
  .replace(/Đ/g, 'D')
  .toLowerCase()

const searchable = {
  optionFilterProp: 'label',
  filterOption: (input, option) =>
    normalize(option?.label).includes(normalize(input)),
}

function safeUrl(value) {
  try {
    const url = new URL(value)
    return ['https:', 'http:'].includes(url.protocol) ? url.href : null
  } catch {
    return null
  }
}

export default function ExternalArticleDetailDrawer({
  open, articleId, categories, onClose, onReviewed,
}) {
  const [form] = Form.useForm()
  const { message } = AntdApp.useApp()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    if (!open || articleId == null) return

    let active = true
    setArticle(null)
    setError('')
    setLoading(true)
    form.resetFields()

    externalArticleApi.getById(articleId)
      .then(({ data }) => {
        if (!active) return
        setArticle(data)
        form.setFieldsValue({
          reviewStatus: data.reviewStatus ?? 'Pending',
          categoryId: data.categoryId == null
            ? undefined
            : Number(data.categoryId),
          editorNote: data.editorNote ?? '',
        })
      })
      .catch((err) => {
        if (active) {
          setError(getApiError(err, 'Không tải được chi tiết bài báo.'))
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => { active = false }
  }, [open, articleId, retry, form])

  const handleReview = async (values) => {
    if (!article || saving) return
    setSaving(true)

    try {
      const { data } = await externalArticleApi.review(article.externalArticleId, {
        reviewStatus: values.reviewStatus,
        categoryId: values.categoryId ?? null,
        editorNote: values.editorNote?.trim() || null,
      })

      setArticle(data)
      message.success('Đã lưu kết quả review.')
      onReviewed?.()
    } catch (err) {
      message.error(getApiError(err, 'Không lưu được review.'))
    } finally {
      setSaving(false)
    }
  }

  const articleUrl = safeUrl(article?.url)
  const imageUrl = safeUrl(article?.imageUrl)
  const categoryOptions = categories.map(c => ({
    label: c.categoryName,
    value: Number(c.categoryId),
  }))

  // If metadata failed or a category is no longer in the list,
  // use the article response name instead of displaying its raw ID.
  if (article?.categoryId != null &&
      !categoryOptions.some(c => c.value === Number(article.categoryId))) {
    categoryOptions.push({
      label: article.categoryName || `Danh mục #${article.categoryId}`,
      value: Number(article.categoryId),
    })
  }

  return (
    <Drawer
      title={article ? `External Article #${article.externalArticleId}` : 'Chi tiết bài báo'}
      open={open}
      onClose={() => { if (!saving) onClose() }}
      width="min(760px, 100vw)"
      destroyOnHidden
      closable={!saving}
      maskClosable={!saving}
    >
      <Spin spinning={loading}>
        {error && (
          <Alert
            type="error"
            showIcon
            message={error}
            action={<Button size="small" onClick={() => setRetry(n => n + 1)}>Thử lại</Button>}
          />
        )}

        {article && (
          <Space orientation="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Space wrap style={{ marginBottom: 12 }}>
                <Tag color={STATUS_COLORS[article.reviewStatus]}>
                  {article.reviewStatus}
                </Tag>
                <Tag>{article.sourceName}</Tag>
              </Space>
              <Title level={4} style={{ margin: 0 }}>{article.title}</Title>
            </div>

            {imageUrl && <Image src={imageUrl} alt="Ảnh bài báo" style={{ maxHeight: 240, objectFit: 'cover', borderRadius: 12 }} />}

            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Nguồn">{article.sourceName || '—'}</Descriptions.Item>
              <Descriptions.Item label="Tác giả">{article.author || '—'}</Descriptions.Item>
              <Descriptions.Item label="Danh mục gốc">{article.originalCategory || '—'}</Descriptions.Item>
              <Descriptions.Item label="Danh mục nội bộ">{article.categoryName || 'Chưa phân loại'}</Descriptions.Item>
              <Descriptions.Item label="Ngày xuất bản">{article.publishedAt ? formatDate(article.publishedAt) : 'Chưa có'}</Descriptions.Item>
              <Descriptions.Item label="Ngày import">{article.importedAt ? formatDate(article.importedAt) : '—'}</Descriptions.Item>
              <Descriptions.Item label="Người review">{article.reviewedByName || 'Chưa có'}</Descriptions.Item>
              <Descriptions.Item label="Link bài gốc">
                {articleUrl ? (
                  <a href={articleUrl} target="_blank" rel="noopener noreferrer">Mở bài báo gốc ↗</a>
                ) : 'Không có URL hợp lệ'}
              </Descriptions.Item>
            </Descriptions>

            <div>
              <Title level={5}>Tóm tắt</Title>
              <Paragraph style={{ whiteSpace: 'pre-wrap' }}>
                {article.summary || 'Nguồn này chưa cung cấp tóm tắt.'}
              </Paragraph>
              <Title level={5}>Nội dung</Title>
              {article.content ? (
                <Paragraph style={{ whiteSpace: 'pre-wrap', maxHeight: 260, overflowY: 'auto' }}>
                  {article.content}
                </Paragraph>
              ) : (
                <Alert
                  type="info"
                  showIcon
                  message="Chưa có nội dung đầy đủ"
                  description="API import URL hiện chỉ trích xuất metadata. Hãy mở bài gốc để đọc nội dung."
                />
              )}
            </div>

            <div>
              <Title level={5}>Review bài báo</Title>
              <Form form={form} layout="vertical" onFinish={handleReview} disabled={saving}>
                <Form.Item
                  name="reviewStatus"
                  label="Trạng thái"
                  rules={[{ required: true, message: 'Chọn trạng thái.' }]}
                >
                  <Select options={STATUS_OPTIONS} />
                </Form.Item>

                <Form.Item name="categoryId" label="Danh mục SmartNews">
                  <Select
                    allowClear={article.categoryId == null}
                    showSearch={searchable}
                    placeholder="Tìm theo tên danh mục"
                    options={categoryOptions}
                    notFoundContent="Không có danh mục phù hợp"
                  />
                </Form.Item>

                <Form.Item
                  name="editorNote"
                  label="Ghi chú biên tập"
                  rules={[{ max: 1000, message: 'Tối đa 1000 ký tự.' }]}
                >
                  <Input.TextArea rows={4} maxLength={1000} showCount />
                </Form.Item>

                <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
                  Để trống danh mục sẽ giữ nguyên danh mục đã gán (backend chưa hỗ trợ bỏ gán).
                  Chỉ bài có trạng thái Reviewed mới được thêm vào Story.
                </Text>

                <Button type="primary" htmlType="submit" loading={saving}>
                  Lưu review
                </Button>
              </Form>
            </div>
          </Space>
        )}
      </Spin>
    </Drawer>
  )
}