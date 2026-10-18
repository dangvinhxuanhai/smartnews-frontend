export function getApiError(error, fallback = 'Có lỗi xảy ra. Vui lòng thử lại.') {
  const data = error?.response?.data

  if (data?.validationErrors) {
    const firstValidationMessage = Object.values(data.validationErrors)[0]
    if (firstValidationMessage) return firstValidationMessage
  }

  if (data?.message) return data.message
  if (typeof data === 'string' && data.trim()) return data

  return fallback
}
