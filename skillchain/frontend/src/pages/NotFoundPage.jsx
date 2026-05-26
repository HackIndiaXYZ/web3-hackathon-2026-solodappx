import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiArrowLeft, FiShield } from 'react-icons/fi'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative">
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" />

      <div className="relative z-10 text-center max-w-lg">
        {/* Glitch 404 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1
            className="font-display text-9xl font-black neon-text-cyan glitch select-none"
            data-text="404"
          >
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="glass-card p-8 border-neon-cyan/10 mb-8">
            <FiShield size={32} className="text-neon-cyan mx-auto mb-4" />
            <h2 className="font-display text-2xl text-white mb-3">
              BLOCK NOT FOUND
            </h2>
            <p className="text-gray-500 text-sm font-mono leading-relaxed">
              The page you're looking for doesn't exist on this chain.<br />
              It may have been moved, deleted, or you entered the wrong hash.
            </p>
          </div>

          {/* Animated scanline */}
          <div className="relative overflow-hidden rounded-xl mb-8">
            <div className="p-4 bg-dark-800 border border-white/5 rounded-xl">
              <p className="font-mono text-xs text-gray-600 text-left">
                <span className="text-neon-cyan">ERROR</span> 0x404 · TRANSACTION_NOT_FOUND<br />
                <span className="text-gray-700">at Block: null</span><br />
                <span className="text-gray-700">Network: Polygon Amoy</span><br />
                <span className="text-neon-pink">→ Redirecting to safe block...</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link to="/" className="cyber-btn cyber-btn-primary text-sm py-3 px-8 flex items-center gap-2">
              <FiArrowLeft size={15} />
              Return Home
            </Link>
            <Link to="/dashboard" className="cyber-btn text-sm py-3 px-8">
              Go to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
