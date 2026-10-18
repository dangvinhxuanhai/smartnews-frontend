import axiosClient from './axiosClient.js'

export const authApi = {
  login(credentials) {
    return axiosClient.post('/auth/login', credentials)
  },

  register(data) {
    return axiosClient.post('/auth/register', data)
  },

  getMe() {
    return axiosClient.get('/auth/me')
  },
}
