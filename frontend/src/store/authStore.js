import { create } from 'zustand'
import axios from 'axios'

const API_URL = 'http://localhost:5000/api/auth'

axios.defaults.withCredentials = true

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  token: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  signup: async (email, password, name) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/signup`, {
        email,
        password,
        name
      })
      set({ user: response.data.user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({
        error: error.response.data.message || 'Error signing up',
        isLoading: false
      })
      throw error
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null })

    try {
      const response = await axios.post(`${API_URL}/verify-email`, { code })
      set({ user: response.data.user, isAuthenticated: true, isLoading: false })
    } catch (error) {
      set({
        error: error.response.data.message || 'Error verifying email',
        isLoading: false
      })
      throw error
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null })

    try {
      const response = await axios.post(`${API_URL}/login`, { email, password })

      if (response.data.requiresTwoFactor) {
        // Nếu yêu cầu 2FA, trả về trạng thái để frontend xử lý
        return { requiresTwoFactor: true, user: response.data.user }
      }

      const token = response.data.token

      if (!token) {
        throw new Error('Không nhận được token từ server')
      }

      localStorage.setItem('token', token) // Lưu token vào localStorage
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}` // Thiết lập header mặc định

      set({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        token,
        error: null
      })
      return { success: true }
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Error logging in',
        isLoading: false
      })
      throw error
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null })
    try {
      await axios.post(
        `${API_URL}/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      )

      localStorage.removeItem('token')
      axios.defaults.headers.common['Authorization'] = ''
      set({ user: null, isAuthenticated: false, isLoading: false })
    } catch (error) {
      set({ error: 'Error logging out', isLoading: false })
      throw error
    }
  },

  checkAuth: async () => {
    set({ isCheckingAuth: true, error: null })
    try {
      const token = localStorage.getItem('token') // Lấy token từ localStorage
      if (!token) {
        throw new Error('Token không tồn tại trong localStorage')
      }

      axios.defaults.headers.common['Authorization'] = `Bearer ${token}` // Thiết lập header mặc định
      const response = await axios.get(`${API_URL}/check-auth`)

      set({
        user: response.data.user,
        isAuthenticated: true,
        token,
        isCheckingAuth: false
      })
    } catch (error) {
      localStorage.removeItem('token')
      axios.defaults.headers.common['Authorization'] = ''
      set({ error: null, isCheckingAuth: false, isAuthenticated: false })
    }
  },

  forgotPassword: async (email) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/forgot-password`, { email })
      set({ message: response.data.message, isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response.data.message || 'Error sending reset password email'
      })
      throw error
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`, {
        password
      })
      set({ message: response.data.message, isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: error.response.data.message || 'Error resetting password'
      })
      throw error
    }
  },

  updatePassword: async (currentPassword, newPassword) => {
    set({ isLoading: true, error: null })
    try {
      const response = await axios.post(`${API_URL}/update-password`, {
        currentPassword,
        newPassword
      })
      set({ message: response.data.message, isLoading: false })
    } catch (error) {
      set({
        isLoading: false,
        error: error.response.data.message || 'Error updating password'
      })
      throw error
    }
  },

  updateName: async (newName) => {
    try {
      const token = localStorage.getItem('token') // Lấy token từ localStorage
      if (!token) {
        throw new Error('Token không tồn tại')
      }

      const response = await fetch(`${API_URL}/update-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` // Gửi token trong header
        },
        body: JSON.stringify({ newName }) // Gửi tên mới trong body
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Cập nhật tên thất bại')
      }

      const result = await response.json()
      set((state) => ({
        ...state,
        user: { ...state.user, name: newName } // Cập nhật tên trong state
      }))
    } catch (error) {
      console.error('Lỗi khi cập nhật tên:', error)
      throw error
    }
  }
}))
