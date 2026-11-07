
import axiosClient from './axiosClient.js'

export const externalArticleApi = {
  search(params = {}) {
    return axiosClient.get('/external-articles', { params })
  },

  getById(id) {
    return axiosClient.get(`/external-articles/${id}`)
  },

  importFromUrl(url) {
    return axiosClient.post('/external-articles/import', {
      url
    })
  },

  review(id, payload) {
    return axiosClient.patch(
      `/external-articles/${id}/review`,
      payload
    )
  },
}
