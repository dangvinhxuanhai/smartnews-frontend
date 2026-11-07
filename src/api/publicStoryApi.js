import axiosClient from './axiosClient.js'

export const publicStoryApi = {
  search(params = {}) {
    return axiosClient.get('/public/stories', { params })
  },

  getById(id) {
    return axiosClient.get(`/public/stories/${id}`)
  },
}