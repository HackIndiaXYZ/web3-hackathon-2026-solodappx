import { createSlice } from '@reduxjs/toolkit'

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    activeModal: null, // 'issueCredential' | 'verifyCredential' | 'connectWallet'
    modalData: null,
    theme: 'dark', // always dark for cyberpunk
    notifications: [],
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload
    },
    openModal: (state, action) => {
      state.activeModal = action.payload.modal
      state.modalData = action.payload.data || null
    },
    closeModal: (state) => {
      state.activeModal = null
      state.modalData = null
    },
    addNotification: (state, action) => {
      state.notifications.unshift({
        id: Date.now().toString(),
        ...action.payload,
        read: false,
        timestamp: new Date().toISOString(),
      })
    },
    markNotificationRead: (state, action) => {
      const notif = state.notifications.find(n => n.id === action.payload)
      if (notif) notif.read = true
    },
    clearNotifications: (state) => {
      state.notifications = []
    },
  },
})

export const {
  toggleSidebar,
  setSidebarOpen,
  openModal,
  closeModal,
  addNotification,
  markNotificationRead,
  clearNotifications,
} = uiSlice.actions
export default uiSlice.reducer
