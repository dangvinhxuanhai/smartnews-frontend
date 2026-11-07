import { useEffect, useState } from 'react'
import {
  Alert, App as AntdApp, Button, Col, Drawer,
  Form, Input, Row, Space,
} from 'antd'
import { externalSourceApi } from '../../api/externalSourceApi.js'
import { getApiError } from '../../utils/apiError.js'

const optional = (value) => value?.trim() || null

export default function ExternalSourceDrawer({
  open,
  sourceId,
  onClose,
  onSaved,
}) {
  const [form] = Form.useForm()
  const { message } = AntdApp.useApp()

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!open) return

    let active = true

    form.resetFields()
    setLoadError('')

    if (!sourceId) {
      setLoading(false)

      return () => {
        active = false
      }
    }

    setLoading(true)

    externalSourceApi.getById(sourceId)
      .then(({ data }) => {
        if (active) form.setFieldsValue(data)
      })
      .catch((error) => {
        if (active) {
          setLoadError(
            getApiError(error, 'Không tải được thông tin nguồn tin.')
          )
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [open, sourceId, form])

  const handleSave = async (values) => {
    if (saving || loading || loadError) return

    setSaving(true)

    const payload = {
      name: values.name.trim(),
      websiteUrl: optional(values.websiteUrl),
      rssUrl: optional(values.rssUrl),
      logoUrl: optional(values.logoUrl),
      countryCode:
        optional(values.countryCode)?.toUpperCase() ?? null,
      languageCode:
        optional(values.languageCode)?.toLowerCase() ?? null,
    }

    try {
      if (sourceId) {
        await externalSourceApi.update(sourceId, payload)
        message.success('Đã cập nhật nguồn tin.')
      } else {
        await externalSourceApi.create({
          code: values.code.trim().toLowerCase(),
          ...payload,
        })

        message.success('Đã tạo nguồn tin.')
      }

      onSaved()
    } catch (error) {
      message.error(
        getApiError(error, 'Không thể lưu nguồn tin.')
      )
    } finally {
      setSaving(false)
    }
  }

  const close = () => {
    if (!saving) onClose()
  }

  return (
    <Drawer
      title={
        sourceId
          ? `Chỉnh sửa nguồn #${sourceId}`
          : 'Thêm nguồn tin'
      }
      open={open}
      onClose={close}
      width="min(640px, 100vw)"
      destroyOnHidden
      closable={!saving}
      maskClosable={!saving}
      keyboard={!saving}
      footer={
        <Space
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <Button onClick={close} disabled={saving}>
            Hủy
          </Button>

          <Button
            type="primary"
            loading={saving}
            disabled={loading || Boolean(loadError)}
            onClick={() => form.submit()}
          >
            {sourceId ? 'Lưu thay đổi' : 'Tạo nguồn'}
          </Button>
        </Space>
      }
    >
      {loadError && (
        <Alert
          type="error"
          showIcon
          message={loadError}
          style={{ marginBottom: 16 }}
        />
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        disabled={loading || saving || Boolean(loadError)}
      >
        <Row gutter={12}>
          <Col xs={24} md={10}>
            <Form.Item
              name="code"
              label="Mã nguồn"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Nhập mã nguồn.',
                },
                { max: 50 },
              ]}
              extra={
                sourceId
                  ? 'Không thể đổi mã sau khi tạo.'
                  : 'Mã duy nhất, được chuẩn hóa thành chữ thường.'
              }
            >
              <Input
                maxLength={50}
                disabled={Boolean(sourceId)}
                placeholder="vnexpress"
              />
            </Form.Item>
          </Col>

          <Col xs={24} md={14}>
            <Form.Item
              name="name"
              label="Tên nguồn tin"
              rules={[
                {
                  required: true,
                  whitespace: true,
                  message: 'Nhập tên nguồn.',
                },
                { max: 150 },
              ]}
            >
              <Input
                maxLength={150}
                placeholder="Tên báo / website"
              />
            </Form.Item>
          </Col>
        </Row>

        {[
          ['websiteUrl', 'Website URL', 'https://example.com'],
          ['rssUrl', 'RSS URL', 'https://example.com/rss'],
          ['logoUrl', 'Logo URL', 'https://example.com/logo.png'],
        ].map(([key, label, placeholder]) => (
          <Form.Item
            key={key}
            name={key}
            label={label}
            rules={[
              {
                type: 'url',
                message: 'Nhập URL hợp lệ.',
              },
              {
                max: 500,
                message: 'Tối đa 500 ký tự.',
              },
            ]}
          >
            <Input
              maxLength={500}
              placeholder={placeholder}
            />
          </Form.Item>
        ))}

        <Row gutter={12}>
          <Col xs={24} md={12}>
            <Form.Item
              name="countryCode"
              label="Mã quốc gia"
              rules={[{ max: 10 }]}
            >
              <Input maxLength={10} placeholder="VN" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="languageCode"
              label="Mã ngôn ngữ"
              rules={[{ max: 10 }]}
            >
              <Input maxLength={10} placeholder="vi" />
            </Form.Item>
          </Col>
        </Row>

        <Alert
          type="info"
          showIcon
          message="Nguồn mới mặc định ở trạng thái Active."
          description="Có thể bật hoặc tắt nguồn trên bảng danh sách sau khi tạo."
        />
      </Form>
    </Drawer>
  )
}
