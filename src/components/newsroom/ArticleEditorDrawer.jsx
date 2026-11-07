
import { useEffect, useState } from 'react'
import {
  Alert,
  App as AntdApp,
  Button,
  Col,
  Drawer,
  Form,
  Image,
  Input,
  Row,
  Select,
  Space,
  Upload,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { articleApi } from '../../api/articleApi.js'
import { getApiError } from '../../utils/apiError.js'
import NameSearchSelect from './NameSearchSelect.jsx'

const { TextArea } = Input

export default function ArticleEditorDrawer({
  open,
  articleId,
  categories,
  tags,
  onClose,
  onSaved,
}) {
  const [form] = Form.useForm()
  const { message } = AntdApp.useApp()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [articleStatus, setArticleStatus] = useState('Draft')

  const imageUrl = Form.useWatch('imageUrl', form)
  const busy = saving || uploading

  // Mỗi lần mở Drawer, nạp dữ liệu tương ứng.
  useEffect(() => {
    if (!open) return

    let active = true
    form.resetFields()
    setArticleStatus('Draft')

    if (!articleId) {
      // Create
      form.setFieldsValue({
        tagIds: [],
        imageUrl: '',
      })
      setLoading(false)
    } else {
      // Edit
      setLoading(true)

      articleApi.getById(articleId)
        .then(({ data }) => {
          if (!active) return

          setArticleStatus(data.status)

          form.setFieldsValue({
            title: data.title,
            content: data.content,
            imageUrl: data.imageUrl ?? '',
            categoryId: data.categoryId,
            tagIds: data.tagIds ?? [],
          })
        })
        .catch((error) => {
          if (active) {
            message.error(
              getApiError(error, 'Không tải được bài viết.')
            )
          }
        })
        .finally(() => {
          if (active) setLoading(false)
        })
    }

    return () => {
      active = false
    }
  }, [open, articleId, form, message])

  // Upload ảnh qua Spring Boot -> Cloudinary
  const handleUpload = (file) => {
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file ảnh.')
      return Upload.LIST_IGNORE
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('Ảnh không được vượt quá 5 MB.')
      return Upload.LIST_IGNORE
    }

    setUploading(true)

    articleApi.uploadImage(file)
      .then(({ data }) => {
        const url =
          typeof data === 'string' ? data.trim() : ''

        if (!url.startsWith('http')) {
          throw new Error('Upload không trả về URL hợp lệ.')
        }

        form.setFieldValue('imageUrl', url)
        message.success('Tải ảnh lên thành công.')
      })
      .catch((error) => {
        message.error(
          getApiError(error, 'Upload ảnh thất bại.')
        )
      })
      .finally(() => setUploading(false))

    return Upload.LIST_IGNORE
  }

  // Dùng chung một form cho Create và Edit
  const handleSubmit = async (values) => {
    if (busy) return

    setSaving(true)

    const payload = {
      title: values.title.trim(),
      content: values.content.trim(),
      categoryId: values.categoryId,
      tagIds: values.tagIds ?? [],
      imageUrl: values.imageUrl?.trim() || null,
    }

    try {
      if (articleId) {
        await articleApi.update(articleId, payload)
        message.success('Đã cập nhật bài viết.')
      } else {
        await articleApi.create(payload)
        message.success('Đã tạo bản nháp.')
      }

      onSaved({ created: !articleId })
    } catch (error) {
      message.error(
        getApiError(error, 'Không lưu được bài viết.')
      )
    } finally {
      setSaving(false)
    }
  }

  const close = () => {
    if (!busy) onClose()
  }

  return (
    <Drawer
      title={
        articleId
          ? `Chỉnh sửa bài #${articleId}`
          : 'Tạo bài viết mới'
      }
      open={open}
      onClose={close}
      width="min(720px, 100vw)"
      destroyOnHidden
      maskClosable={!busy}
      keyboard={!busy}
      closable={!busy}
      extra={
        <Button onClick={close} disabled={busy}>
          Đóng
        </Button>
      }
      footer={
        <Space
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button onClick={close} disabled={busy}>
            Hủy
          </Button>

          <Button
            type="primary"
            loading={saving}
            disabled={loading || uploading}
            onClick={() => form.submit()}
          >
            {articleId ? 'Lưu thay đổi' : 'Tạo bản nháp'}
          </Button>
        </Space>
      }
    >
      <Alert
        style={{ marginBottom: 20 }}
        type="info"
        showIcon
        message={
          articleId
            ? `Trạng thái hiện tại: ${articleStatus}`
            : 'Bài viết mới được lưu dưới dạng Draft.'
        }
        description="Việc duyệt/xuất bản sẽ được thêm khi backend có API workflow."
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={loading || busy}
        autoComplete="off"
      >
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Nhập tiêu đề.',
            },
            {
              max: 255,
              message: 'Tối đa 255 ký tự.',
            },
          ]}
        >
          <Input
            showCount
            maxLength={255}
            placeholder="Nhập tiêu đề bài viết"
          />
        </Form.Item>

        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="categoryId"
              label="Danh mục"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng chọn danh mục.',
                },
              ]}
            >
              <NameSearchSelect
                items={categories}
                labelKey="categoryName"
                valueKey="categoryId"
                placeholder="Nhập tên danh mục để tìm..."
                allowClear
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item name="tagIds" label="Tags">
              <NameSearchSelect
                items={tags}
                labelKey="tagName"
                valueKey="tagId"
                mode="multiple"
                maxTagCount="responsive"
                placeholder="Nhập tên tag để tìm..."
                allowClear
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="content"
          label="Nội dung"
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Nhập nội dung.',
            },
          ]}
        >
          <TextArea
            rows={13}
            placeholder="Viết nội dung bài báo (plain text)..."
          />
        </Form.Item>

        <Form.Item
          name="imageUrl"
          label="URL ảnh bìa"
          rules={[
            {
              max: 500,
              message: 'URL tối đa 500 ký tự.',
            },
            {
              type: 'url',
              message: 'URL ảnh không hợp lệ.',
            },
          ]}
        >
          <Input placeholder="https://..." />
        </Form.Item>

        <Space
          orientation="vertical"
          size="middle"
          style={{ width: '100%' }}
        >
          <Upload
            accept="image/*"
            maxCount={1}
            showUploadList={false}
            beforeUpload={handleUpload}
          >
            <Button
              icon={<UploadOutlined />}
              loading={uploading}
              disabled={busy || loading}
            >
              Chọn ảnh và upload
            </Button>
          </Upload>

          {imageUrl && (
            <Image
              src={imageUrl}
              alt="Ảnh bìa"
              width={220}
              style={{ borderRadius: 12 }}
            />
          )}
        </Space>
      </Form>
    </Drawer>
  )
}
