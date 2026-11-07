import axiosClient from './axiosClient.js'

export const articleApi = {
  getPublicArticles(params = {}) {
    return axiosClient.get('/public/articles', { params })
  },

  getPublicArticleById(id) {
    return axiosClient.get(`/public/articles/${id}`)
  },

  // Newsroom
  search(params = {}) {
    return axiosClient.get('/articles/search', { params })
  },

  getById(id) {
    return axiosClient.get(`/articles/${id}`)
  },

  create(data) {
    return axiosClient.post('/articles', data)
  },

  update(id, data) {
    return axiosClient.put(`/articles/${id}`, data)
  },

  remove(id) {
    return axiosClient.delete(`/articles/${id}`)
  },

  uploadImage(file) {
    const form = new FormData()
    form.append('file', file)

    return axiosClient.post('/upload', form, {
      headers: { 'Content-Type': undefined },
    })
  },
}
