
import axiosClient from './axiosClient.js'

export const taxonomyApi = {
  getCategories() {
    return axiosClient.get('/categories')
  },

  getTags() {
    return axiosClient.get('/tags')
  },
}
