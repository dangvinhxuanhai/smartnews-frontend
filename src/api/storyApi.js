
import axiosClient from './axiosClient.js'

export const storyApi = {
  search(params = {}) {
    return axiosClient.get('/stories', { params })
  },

  getById(id) {
    return axiosClient.get(`/stories/${id}`)
  },

  create(payload) {
    return axiosClient.post('/stories', payload)
  },

  update(id, payload) {
    return axiosClient.put(`/stories/${id}`, payload)
  },

  remove(id) {
    return axiosClient.delete(`/stories/${id}`)
  },

  changeStatus(id, status) {
    return axiosClient.patch(`/stories/${id}/status`, {
      status,
    })
  },

  addExternalArticle(storyId, articleId) {
    return axiosClient.post(
      `/stories/${storyId}/external-articles/${articleId}`
    )
  },

  removeExternalArticle(storyId, articleId) {
    return axiosClient.delete(
      `/stories/${storyId}/external-articles/${articleId}`
    )
  },

  addInternalArticle(storyId, articleId) {
    return axiosClient.post(
      `/stories/${storyId}/articles/${articleId}`
    )
  },

  removeInternalArticle(storyId, articleId) {
    return axiosClient.delete(
      `/stories/${storyId}/articles/${articleId}`
    )
  },
}
