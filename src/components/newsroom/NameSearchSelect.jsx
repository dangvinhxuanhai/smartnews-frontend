
import { Select } from 'antd'

// Cho phép tìm không phân biệt chữ hoa/thường và dấu tiếng Việt.
const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()

export default function NameSearchSelect({
  items = [],
  labelKey,
  valueKey,
  ...props
}) {
  const options = items
    .map((item) => ({
      label: item[labelKey],
      value: item[valueKey],
    }))
    .filter(
      (option) =>
        typeof option.label === 'string' &&
        option.value != null
    )

  return (
    <Select
      {...props}
      style={{ width: '100%', ...props.style }}
      options={options}
      showSearch={{
        optionFilterProp: 'label',

        filterOption: (input, option) =>
          normalizeText(option?.label).includes(
            normalizeText(input)
          ),
      }}
      notFoundContent="Không tìm thấy kết quả"
    />
  )
}
