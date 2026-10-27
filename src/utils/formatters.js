export function formatDate(value, options = {}) {
  if (!value) return 'Mới cập nhật'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Mới cập nhật'

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options,
  }).format(date)
}

export function getReadingTime(content = '') {
  const plainText = String(content).replace(/<[^>]*>/g, ' ').trim()
  if (!plainText) return 1

  const words = plainText.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(words / 220))
}

export function getExcerpt(content = '', maxLength = 150) {
  const plainText = String(content)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  if (!plainText) return 'Mở bài viết để xem nội dung chi tiết.'
  if (plainText.length <= maxLength) return plainText

  return `${plainText.slice(0, maxLength).trimEnd()}…`
}
