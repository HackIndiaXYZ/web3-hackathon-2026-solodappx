import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { FiZap, FiCopy, FiExternalLink, FiRefreshCw, FiWifi, FiWifiOff, FiAlertTriangle } from 'react-icons/fi'
import { connectWallet, disconnectWallet, refreshBalance } from '../store/slices/web3Slice'
import { shortAddress, copyToClipboard, polygonscanAddressUrl, formatBalance } from '../utils/helpers'
import toast from 'react-hot-toast'

// Mock recent transactions
const MOCK_TXS = [
  { hash: '0x7f3a8e914b...91d4', type: 'Credential Issued', amount: '-0.002 MATIC', status: 'confirmed', age: '2h ago' },
  { hash: '0x1a2b3c4d5e...6f7a', type: 'Credential Verified', amount: '-0.001 MATIC', status: 'confirmed', age: '1d ago' },
  { hash: '0xabc123def4...56gh', type: 'Credential Received', amount: '+0.000 MATIC', status: 'confirmed', age: '3d ago' },
]

export default function WalletPage() {
  const dispatch = useDispatch()
  const { address, balance, chainId, chainName, isConnected, loading, error } = useSelector(s => s.web3)

  const handleConnect = async () => {
    const result = await dispatch(connectWallet())
    if (connectWallet.fulfilled.match(result)) {
      toast.success('Wallet connected to Polygon Amoy!')
    } else {
      toast.error(result.payload || 'Connection failed')
    }
  }

  const handleDisconnect = () => {
    dispatch(disconnectWallet())
    toast.success('Wallet disconnected')
  }

  const handleRefresh = async () => {
    if (!address) return
    await dispatch(refreshBalance(address))
    toast.success('Balance refreshed')
  }

  const handleCopyAddress = async () => {
    await copyToClipboard(address)
    toast.success('Address copied!')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl text-white">Web3 <span className="gradient-text">Wallet</span></h1>
        <p className="text-gray-500 text-sm mt-0.5 font-mono">Connect MetaMask · Polygon Amoy Testnet</p>
      </div>

      {/* Connection card */}
      <AnimatePresence mode="wait">
        {!isConnected ? (
          <motion.div
            key="disconnected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card p-10 text-center border-dashed border-neon-cyan/20"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center mx-auto mb-6"
            >
              <FiWifiOff size={36} className="text-gray-600" />
            </motion.div>
            <h2 className="font-display text-xl text-white mb-3">No Wallet Connected</h2>
            <p className="text-gray-500 text-sm mb-8 max-w-sm mx-auto">
              Connect your MetaMask wallet to interact with the Polygon blockchain and manage your on-chain credentials.
            </p>

            {/* MetaMask check */}
            {typeof window.ethereum === 'undefined' && (
              <div className="flex items-center gap-2 justify-center text-neon-yellow text-sm mb-6 p-3 bg-yellow-500/5 border border-yellow-500/20 rounded-lg max-w-sm mx-auto">
                <FiAlertTriangle size={15} />
                <span className="font-mono text-xs">MetaMask not detected. Install the extension first.</span>
              </div>
            )}

            <button
              onClick={handleConnect}
              disabled={loading}
              className="cyber-btn cyber-btn-primary text-sm py-3.5 px-12 inline-flex items-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5" />
                  Connect MetaMask
                </>
              )}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="connected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            {/* Wallet info card */}
            <div className="glass-card p-6 border-neon-green/20 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/3 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-neon-green/10 border border-neon-green/30 flex items-center justify-center">
                      <FiWifi size={18} className="text-neon-green" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Wallet Connected</p>
                      <p className="text-xs text-neon-green font-mono">{chainName || 'Polygon Amoy'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRefresh}
                      className="p-2 rounded-lg hover:bg-white/5 text-gray-500 hover:text-neon-cyan transition-colors"
                      title="Refresh balance"
                    >
                      <FiRefreshCw size={15} />
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="text-xs text-neon-pink hover:bg-neon-pink/10 px-3 py-1.5 rounded-lg border border-neon-pink/20 font-mono transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>

                {/* Address */}
                <div className="mb-6">
                  <p className="text-xs text-gray-600 font-mono mb-1.5">WALLET ADDRESS</p>
                  <div className="flex items-center gap-2 p-3 bg-dark-700 rounded-xl border border-white/5">
                    <p className="text-neon-cyan font-mono text-sm flex-1 truncate">{address}</p>
                    <button onClick={handleCopyAddress} className="text-gray-500 hover:text-neon-cyan transition-colors p-1">
                      <FiCopy size={14} />
                    </button>
                    <a
                      href={polygonscanAddressUrl(address)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-neon-cyan transition-colors p-1"
                    >
                      <FiExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {/* Balance + Chain */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-dark-700 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-600 font-mono mb-1">BALANCE</p>
                    <p className="font-display text-2xl text-white">{formatBalance(balance)}</p>
                    <p className="text-xs text-gray-500 font-mono">MATIC</p>
                  </div>
                  <div className="p-4 bg-dark-700 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-600 font-mono mb-1">NETWORK</p>
                    <p className="text-white font-semibold text-sm">Polygon</p>
                    <p className="text-xs text-gray-500 font-mono">Amoy Testnet</p>
                  </div>
                  <div className="p-4 bg-dark-700 rounded-xl border border-white/5">
                    <p className="text-xs text-gray-600 font-mono mb-1">CHAIN ID</p>
                    <p className="text-white font-semibold text-sm font-mono">{chainId || '80002'}</p>
                    <p className="text-xs text-gray-500 font-mono">EVM Compatible</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How to get test MATIC */}
      <div className="glass-card p-5 border-neon-yellow/10">
        <div className="flex items-start gap-3">
          <FiAlertTriangle size={16} className="text-neon-yellow flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-neon-yellow mb-1 font-mono">Need Test MATIC?</p>
            <p className="text-gray-500 text-xs leading-relaxed">
              Get free test MATIC from the Polygon Amoy faucet to pay for transaction fees.{' '}
              <a
                href="https://faucet.polygon.technology/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neon-cyan hover:underline"
              >
                Visit Polygon Faucet →
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div>
        <h2 className="font-display text-sm text-gray-400 tracking-wider mb-4">RECENT TRANSACTIONS</h2>
        <div className="space-y-2">
          {MOCK_TXS.map((tx, i) => (
            <motion.div
              key={tx.hash}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="glass-card p-4 flex items-center gap-4"
            >
              <div className="w-2 h-2 rounded-full bg-neon-green flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{tx.type}</p>
                <p className="text-xs text-gray-600 font-mono truncate">{tx.hash}</p>
              </div>
              <span className="text-xs font-mono text-gray-500 hidden sm:block">{tx.age}</span>
              <span className={`text-sm font-mono ${tx.amount.startsWith('+') ? 'text-neon-green' : 'text-gray-400'}`}>
                {tx.amount}
              </span>
              <span className="status-verified text-[10px] px-2 py-0.5 rounded-full font-mono hidden md:block">
                {tx.status}
              </span>
            </motion.div>
          ))}
          {!isConnected && (
            <div className="text-center py-6 text-gray-600 text-sm font-mono">
              Connect wallet to view transaction history
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
