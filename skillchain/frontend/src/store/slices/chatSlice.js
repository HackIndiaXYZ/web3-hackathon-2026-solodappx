import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

export const sendMessage = createAsyncThunk('chat/send', async (message, { getState, rejectWithValue }) => {
  try {
    const { chat } = getState()
    const { data } = await api.post('/ai/chat', {
      message,
      history: chat.messages.slice(-10), // send last 10 messages for context
    })
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to send message')
  }
})

export const fetchChatHistory = createAsyncThunk('chat/fetchHistory', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/ai/history')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch history')
  }
})

export const clearChatHistory = createAsyncThunk('chat/clearHistory', async (_, { rejectWithValue }) => {
  try {
    await api.delete('/ai/history')
    return true
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to clear history')
  }
})

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    messages: [],
    loading: false,
    streaming: false,
    error: null,
    sessionId: null,
  },
  reducers: {
    addUserMessage: (state, action) => {
      state.messages.push({
        role: 'user',
        content: action.payload,
        timestamp: new Date().toISOString(),
        id: Date.now().toString(),
      })
    },
    clearMessages: (state) => {
      state.messages = []
    },
    clearChatError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(sendMessage.pending, (state) => { state.loading = true; state.error = null })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.loading = false
        state.messages.push({
          role: 'assistant',
          content: action.payload.message,
          timestamp: new Date().toISOString(),
          id: Date.now().toString(),
          tokens: action.payload.tokens,
        })
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    builder
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.messages = action.payload.history || []
      })

    builder
      .addCase(clearChatHistory.fulfilled, (state) => {
        state.messages = []
      })
  },
})

export const { addUserMessage, clearMessages, clearChatError } = chatSlice.actions
export default chatSlice.reducer
