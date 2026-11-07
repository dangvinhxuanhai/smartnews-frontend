
import axiosClient from './axiosClient.js'

export const externalSourceApi = {
  getAll() {
    return axiosClient.get('/external-sources')
  },

  getById(id) {
    return axiosClient.get(`/external-sources/${id}`)
  },

  create(data) {
    return axiosClient.post('/external-sources', data)
  },

  update(id, data) {
    return axiosClient.put(`/external-sources/${id}`, data)
  },

  changeStatus(id, active) {
    return axiosClient.patch(
      `/external-sources/${id}/status`,
      { active }
    )
  },
}
