import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../utils/api'

// ── Async thunks ──────────────────────────────────────────────
export const fetchCredentials = createAsyncThunk('credentials/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/credentials')
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch credentials')
  }
})

export const issueCredential = createAsyncThunk('credentials/issue', async (credentialData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/credentials/issue', credentialData)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to issue credential')
  }
})

export const verifyCredential = createAsyncThunk('credentials/verify', async (credentialId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/credentials/verify/${credentialId}`)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Verification failed')
  }
})

export const revokeCredential = createAsyncThunk('credentials/revoke', async (credentialId, { rejectWithValue }) => {
  try {
    const { data } = await api.put(`/credentials/${credentialId}/revoke`)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Revocation failed')
  }
})

export const fetchPublicCredentials = createAsyncThunk('credentials/fetchPublic', async (address, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/credentials/public/${address}`)
    return data
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Failed to fetch public credentials')
  }
})

// ── Slice ─────────────────────────────────────────────────────
const credentialSlice = createSlice({
  name: 'credentials',
  initialState: {
    list: [],
    selected: null,
    verificationResult: null,
    publicCredentials: [],
    loading: false,
    issuing: false,
    verifying: false,
    error: null,
    stats: {
      total: 0,
      verified: 0,
      pending: 0,
      revoked: 0,
    },
  },
  reducers: {
    selectCredential: (state, action) => {
      state.selected = action.payload
    },
    clearVerification: (state) => {
      state.verificationResult = null
    },
    clearError: (state) => {
      state.error = null
    },
    updateStats: (state) => {
      state.stats.total = state.list.length
      state.stats.verified = state.list.filter(c => c.status === 'verified').length
      state.stats.pending = state.list.filter(c => c.status === 'pending').length
      state.stats.revoked = state.list.filter(c => c.status === 'revoked').length
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCredentials.pending, (state) => { state.loading = true })
      .addCase(fetchCredentials.fulfilled, (state, action) => {
        state.loading = false
        state.list = action.payload.credentials
        // Update stats
        state.stats.total = state.list.length
        state.stats.verified = state.list.filter(c => c.status === 'verified').length
        state.stats.pending = state.list.filter(c => c.status === 'pending').length
        state.stats.revoked = state.list.filter(c => c.status === 'revoked').length
      })
      .addCase(fetchCredentials.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })

    builder
      .addCase(issueCredential.pending, (state) => { state.issuing = true })
      .addCase(issueCredential.fulfilled, (state, action) => {
        state.issuing = false
        state.list.unshift(action.payload.credential)
        state.stats.total += 1
        state.stats.pending += 1
      })
      .addCase(issueCredential.rejected, (state, action) => {
        state.issuing = false
        state.error = action.payload
      })

    builder
      .addCase(verifyCredential.pending, (state) => { state.verifying = true })
      .addCase(verifyCredential.fulfilled, (state, action) => {
        state.verifying = false
        state.verificationResult = action.payload
        // Update in list
        const idx = state.list.findIndex(c => c._id === action.payload.credential?._id)
        if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload.credential }
      })
      .addCase(verifyCredential.rejected, (state, action) => {
        state.verifying = false
        state.error = action.payload
      })

    builder
      .addCase(revokeCredential.fulfilled, (state, action) => {
        const idx = state.list.findIndex(c => c._id === action.payload.credential._id)
        if (idx !== -1) state.list[idx].status = 'revoked'
        state.stats.revoked += 1
        state.stats.verified = Math.max(0, state.stats.verified - 1)
      })

    builder
      .addCase(fetchPublicCredentials.fulfilled, (state, action) => {
        state.publicCredentials = action.payload.credentials
      })
  },
})

export const { selectCredential, clearVerification, clearError, updateStats } = credentialSlice.actions
export default credentialSlice.reducer
