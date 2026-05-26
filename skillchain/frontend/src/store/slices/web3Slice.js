import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { ethers } from 'ethers'
import toast from 'react-hot-toast'

// Polygon Amoy Testnet config
const POLYGON_AMOY = {
  chainId: '0x13882', // 80002 in hex
  chainName: 'Polygon Amoy Testnet',
  nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  rpcUrls: ['https://rpc-amoy.polygon.technology/'],
  blockExplorerUrls: ['https://amoy.polygonscan.com/'],
}

export const connectWallet = createAsyncThunk('web3/connect', async (_, { rejectWithValue }) => {
  try {
    if (!window.ethereum) throw new Error('MetaMask not installed')

    // Request accounts
    await window.ethereum.request({ method: 'eth_requestAccounts' })

    // Switch to Polygon Amoy
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: POLYGON_AMOY.chainId }],
      })
    } catch (switchError) {
      // Chain not added yet, add it
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [POLYGON_AMOY],
        })
      }
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const address = await signer.getAddress()
    const balance = await provider.getBalance(address)
    const network = await provider.getNetwork()

    return {
      address,
      balance: ethers.formatEther(balance),
      chainId: network.chainId.toString(),
      chainName: network.name,
    }
  } catch (err) {
    return rejectWithValue(err.message || 'Failed to connect wallet')
  }
})

export const disconnectWallet = createAsyncThunk('web3/disconnect', async () => {
  // MetaMask doesn't have a programmatic disconnect, we just clear state
  return true
})

export const refreshBalance = createAsyncThunk('web3/refreshBalance', async (address, { rejectWithValue }) => {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const balance = await provider.getBalance(address)
    return ethers.formatEther(balance)
  } catch (err) {
    return rejectWithValue(err.message)
  }
})

const web3Slice = createSlice({
  name: 'web3',
  initialState: {
    address: null,
    balance: '0',
    chainId: null,
    chainName: null,
    isConnected: false,
    loading: false,
    error: null,
    transactions: [], // mock tx history
  },
  reducers: {
    setWalletAddress: (state, action) => {
      state.address = action.payload
    },
    addTransaction: (state, action) => {
      state.transactions.unshift(action.payload)
    },
    clearWeb3Error: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(connectWallet.pending, (state) => { state.loading = true; state.error = null })
      .addCase(connectWallet.fulfilled, (state, action) => {
        state.loading = false
        state.address = action.payload.address
        state.balance = action.payload.balance
        state.chainId = action.payload.chainId
        state.chainName = action.payload.chainName
        state.isConnected = true
      })
      .addCase(connectWallet.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
        state.isConnected = false
      })

    builder
      .addCase(disconnectWallet.fulfilled, (state) => {
        state.address = null
        state.balance = '0'
        state.chainId = null
        state.chainName = null
        state.isConnected = false
        state.loading = false
      })

    builder
      .addCase(refreshBalance.fulfilled, (state, action) => {
        state.balance = action.payload
      })
  },
})

export const { setWalletAddress, addTransaction, clearWeb3Error } = web3Slice.actions
export default web3Slice.reducer
