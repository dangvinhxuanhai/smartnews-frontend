
import { useEffect, useState } from 'react'
import {
  Alert, App as AntdApp, Button, Col, Divider,
  Drawer, Form, Image, Input, Popconfirm,
  Row, Select, Space, Tabs, Tag, Upload,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'

import { storyApi } from '../../api/storyApi.js'
import { articleApi } from '../../api/articleApi.js'
import { getApiError } from '../../utils/apiError.js'
import StoryArticlePicker from './StoryArticlePicker.jsx'

const { TextArea } = Input

const normalize = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLowerCase()

const searchByName = (input, option) =>
  normalize(option?.label).includes(normalize(input))

export default function StoryEditorDrawer({
  open,
  storyId,
  categories,
  tags,
  onClose,
  onCreated,
  onSaved,
}) {
  const [form] = Form.useForm()
  const { message } = AntdApp.useApp()

  const [story, setStory] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [changingStatus, setChangingStatus] = useState(false)
  const [loadError, setLoadError] = useState('')

  const heroImageUrl = Form.useWatch('heroImageUrl', form)

  const busy = saving || uploading || changingStatus

  useEffect(() => {
    if (!open) return

    let active = true

    form.resetFields()
    setStory(null)
    setLoadError('')

    if (!storyId) {
      form.setFieldsValue({
        tagIds: [],
        heroImageUrl: '',
      })

      setLoading(false)
      return
    }

    setLoading(true)

    storyApi.getById(storyId)
      .then(({ data }) => {
        if (!active) return

        setStory(data)

        form.setFieldsValue({
          title: data.title,
          summary: data.summary ?? '',
          heroImageUrl: data.heroImageUrl ?? '',
          categoryId: data.categoryId ?? undefined,
          tagIds: (data.tagIds ?? []).map(Number),
        })
      })
      .catch((err) => {
        if (active) {
          setLoadError(
            getApiError(err, 'Không tải được Story.')
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [open, storyId, form])

  const categoryOptions = categories.map(item => ({
    label: item.categoryName,
    value: Number(item.categoryId),
  }))

  const tagOptions = tags.map(item => ({
    label: item.tagName,
    value: Number(item.tagId),
  }))

  const handleUpload = (file) => {
    if (!file.type.startsWith('image/')) {
      message.error('Vui lòng chọn file ảnh.')
      return Upload.LIST_IGNORE
    }

    if (file.size > 5 * 1024 * 1024) {
      message.error('Ảnh tối đa 5 MB.')
      return Upload.LIST_IGNORE
    }

    setUploading(true)

    articleApi.uploadImage(file)
      .then(({ data }) => {
        const url =
          typeof data === 'string' ? data.trim() : ''

        if (!/^https?:\/\//i.test(url)) {
          throw new Error('Upload không trả URL hợp lệ.')
        }

        form.setFieldValue('heroImageUrl', url)
        message.success('Đã tải ảnh lên.')
      })
      .catch(err => {
        message.error(
          getApiError(err, 'Upload ảnh thất bại.')
        )
      })
      .finally(() => setUploading(false))

    return Upload.LIST_IGNORE
  }

  const handleSave = async (values) => {
    if (busy || loading || loadError) return

    const payload = {
      title: values.title.trim(),
      summary: values.summary?.trim() || null,
      heroImageUrl: values.heroImageUrl?.trim() || null,
      categoryId: values.categoryId ?? null,
      tagIds: values.tagIds ?? [],
    }

    setSaving(true)

    try {
      if (storyId) {
        const { data } = await storyApi.update(
          storyId,
          payload
        )

        setStory(data)
        onSaved()
        message.success('Đã cập nhật Story.')
      } else {
        const { data } = await storyApi.create(payload)

        message.success(
          'Đã tạo Story. Bây giờ bạn có thể gắn bài viết.'
        )

        onCreated(data.storyId)
      }
    } catch (err) {
      message.error(
        getApiError(err, 'Không thể lưu Story.')
      )
    } finally {
      setSaving(false)
    }
  }

  const handleLinkedChanged = (updatedStory) => {
    setStory(updatedStory)
    onSaved()
  }

  const externalSources = story?.sources ?? []

  const distinctSources = new Set(
    externalSources
      .map(article => article.sourceId)
      .filter(id => id != null)
  ).size

  const canPublish =
    externalSources.length >= 2 &&
    distinctSources >= 2

  const handleChangeStatus = async () => {
    if (!story || busy) return

    const nextStatus =
      story.status === 'Published'
        ? 'Draft'
        : 'Published'

    if (nextStatus === 'Published' && !canPublish) {
      message.warning(
        'Cần ít nhất 2 bài từ 2 nguồn khác nhau.'
      )
      return
    }

    setChangingStatus(true)

    try {
      const { data } = await storyApi.changeStatus(
        story.storyId,
        nextStatus
      )

      setStory(data)
      onSaved()

      message.success(
        nextStatus === 'Published'
          ? 'Story đã được xuất bản.'
          : 'Story đã trở về Draft.'
      )
    } catch (err) {
      message.error(
        getApiError(err, 'Không đổi được trạng thái.')
      )
    } finally {
      setChangingStatus(false)
    }
  }

  const close = () => {
    if (!busy) onClose()
  }

  return (
    <Drawer
      title={
        storyId
          ? `Story #${storyId}`
          : 'Tạo Story mới'
      }
      open={open}
      onClose={close}
      width="min(920px, 100vw)"
      destroyOnHidden
      closable={!busy}
      maskClosable={!busy}
      keyboard={!busy}
      footer={
        <Space
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button onClick={close} disabled={busy}>
            Đóng
          </Button>

          <Button
            type="primary"
            loading={saving}
            disabled={
              loading ||
              uploading ||
              changingStatus ||
              Boolean(loadError)
            }
            onClick={() => form.submit()}
          >
            {storyId
              ? 'Lưu thông tin'
              : 'Tạo Story'}
          </Button>
        </Space>
      }
    >
      {loadError && (
        <Alert
          type="error"
          showIcon
          message={loadError}
          style={{ marginBottom: 18 }}
        />
      )}

      {story && (
        <Space
          align="center"
          wrap
          style={{ marginBottom: 18 }}
        >
          <Tag
            color={
              story.status === 'Published'
                ? 'green'
                : 'default'
            }
          >
            {story.status}
          </Tag>

          <span>
            {externalSources.length} External Articles
            {' · '}
            {distinctSources} Sources
          </span>

          <Popconfirm
            title={
              story.status === 'Published'
                ? 'Chuyển Story về Draft?'
                : 'Xuất bản Story?'
            }
            okText="Xác nhận"
            cancelText="Hủy"
            onConfirm={handleChangeStatus}
          >
            <Button
              size="small"
              loading={changingStatus}
              disabled={
                busy ||
                (story.status !== 'Published' &&
                  !canPublish)
              }
            >
              {story.status === 'Published'
                ? 'Unpublish'
                : 'Publish'}
            </Button>
          </Popconfirm>
        </Space>
      )}

      {story?.status === 'Draft' && !canPublish && (
        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 20 }}
          message="Story chưa đủ điều kiện Publish."
          description={
            'Cần 2 External Articles đã Reviewed ' +
            'thuộc ít nhất 2 External Sources khác nhau.'
          }
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        disabled={loading || busy || Boolean(loadError)}
      >
        <Form.Item
          name="title"
          label="Story Title"
          rules={[
            {
              required: true,
              whitespace: true,
              message: 'Nhập tiêu đề Story.',
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
            placeholder="Tiêu đề câu chuyện..."
          />
        </Form.Item>

        <Form.Item
          name="summary"
          label="Summary"
        >
          <TextArea
            rows={4}
            placeholder="Tóm tắt bối cảnh của Story..."
          />
        </Form.Item>

        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="categoryId"
              label="Category"
            >
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                filterOption={searchByName}
                options={categoryOptions}
                placeholder="Tìm danh mục theo tên..."
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="tagIds"
              label="Tags"
            >
              <Select
                mode="multiple"
                allowClear
                showSearch
                optionFilterProp="label"
                filterOption={searchByName}
                maxTagCount="responsive"
                options={tagOptions}
                placeholder="Tìm Tag theo tên..."
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="heroImageUrl"
          label="Hero Image URL"
          rules={[
            { type: 'url', message: 'URL không hợp lệ.' },
            { max: 700, message: 'Tối đa 700 ký tự.' },
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
              disabled={loading || busy}
            >
              Upload ảnh bìa
            </Button>
          </Upload>

          {heroImageUrl && (
            <Image
              src={heroImageUrl}
              width={240}
              alt="Story hero"
              style={{ borderRadius: 12 }}
            />
          )}
        </Space>
      </Form>

      {story && (
        <>
          <Divider orientation="left">
            Bài viết liên kết
          </Divider>

          <Tabs
            destroyOnHidden
            items={[
              {
                key: 'external',
                label: `External Articles (${story.sources?.length ?? 0})`,
                children: (
                  <StoryArticlePicker
                    story={story}
                    kind="external"
                    onChanged={handleLinkedChanged}
                  />
                ),
              },
              {
                key: 'internal',
                label: `SmartNews Articles (${story.smartNewsArticles?.length ?? 0})`,
                children: (
                  <StoryArticlePicker
                    story={story}
                    kind="internal"
                    onChanged={handleLinkedChanged}
                  />
                ),
              },
            ]}
          />
        </>
      )}
    </Drawer>
  )
}
