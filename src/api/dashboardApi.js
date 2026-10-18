import axiosClient from './axiosClient.js'

export const dashboardApi = {
  getAdminDashboard() {
    return axiosClient.get('/admin/dashboard')
  },
}
