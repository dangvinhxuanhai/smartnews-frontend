import axiosClient from './axiosClient.js'

export const articleApi = {
  getPublicArticles(params = {}) {
    return axiosClient.get('/public/articles', { params })
  },

  getPublicArticleById(id) {
    return axiosClient.get(`/public/articles/${id}`)
  },
}
