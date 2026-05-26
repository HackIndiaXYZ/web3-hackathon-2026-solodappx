import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiArrowLeft } from 'react-icons/fi'
import { loginUser, registerUser, clearError } from '../store/slices/authSlice'
import toast from 'react-hot-toast'

export default function AuthPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, loading, error } = useSelector(s => s.auth)
  const from = location.state?.from?.pathname || '/dashboard'

  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  useEffect(() => {
    if (isAuthenticated) navigate(from, { replace: true })
  }, [isAuthenticated])

  useEffect(() => {
    if (error) { toast.error(error); dispatch(clearError()) }
  }, [error])

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (mode === 'login') {
      await dispatch(loginUser({ email: form.email, password: form.password }))
    } else {
      if (form.password.length < 6) return toast.error('Password must be at least 6 characters')
      await dispatch(registerUser(form))
    }
  }

  const switchMode = (newMode) => {
    setMode(newMode)
    setForm({ name: '', email: '', password: '' })
    dispatch(clearError())
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative">
      {/* Background */}
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" />

      {/* Back button */}
      <Link
        to="/"
        className="fixed top-6 left-6 z-20 flex items-center gap-2 text-sm text-gray-500 hover:text-neon-cyan transition-colors"
      >
        <FiArrowLeft size={16} />
        <span className="font-mono">Back</span>
      </Link>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center mx-auto mb-4">
            <FiShield size={28} className="text-neon-cyan" />
          </div>
          <h1 className="font-display text-2xl font-bold gradient-text">SKILLCHAIN</h1>
          <p className="text-gray-500 text-sm mt-1 font-mono">Decentralized Credentials Protocol</p>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="glass-card p-8 border-neon-cyan/10"
        >
          {/* Tab switcher */}
          <div className="flex mb-8 p-1 bg-dark-700 rounded-xl">
            {['login', 'register'].map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-mono font-medium transition-all duration-200 capitalize
                  ${mode === m
                    ? 'bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30'
                    : 'text-gray-500 hover:text-gray-300'
                  }`}
              >
                {m === 'login' ? '[ Login ]' : '[ Register ]'}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.form
              key={mode}
              initial={{ opacity: 0, x: mode === 'login' ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'login' ? 20 : -20 }}
              transition={{ duration: 0.25 }}
              onSubmit={handleSubmit}
              className="space-y-4"
            >
              {/* Name (register only) */}
              {mode === 'register' && (
                <div>
                  <label className="block text-xs text-gray-500 font-mono mb-1.5 tracking-wider">DISPLAY NAME</label>
                  <div className="relative">
                    <FiUser size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Satoshi Nakamoto"
                      className="cyber-input pl-10"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-xs text-gray-500 font-mono mb-1.5 tracking-wider">EMAIL ADDRESS</label>
                <div className="relative">
                  <FiMail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="you@skillchain.io"
                    className="cyber-input pl-10"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs text-gray-500 font-mono mb-1.5 tracking-wider">PASSWORD</label>
                <div className="relative">
                  <FiLock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="cyber-input pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 hover:text-neon-cyan transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={15} /> : <FiEye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="cyber-btn cyber-btn-primary w-full py-3.5 mt-2 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
                    <span>{mode === 'login' ? 'Authenticating...' : 'Creating Account...'}</span>
                  </>
                ) : (
                  <span>{mode === 'login' ? 'Login →' : 'Create Account →'}</span>
                )}
              </button>
            </motion.form>
          </AnimatePresence>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px bg-white/5" />
            <span className="text-gray-600 text-xs font-mono">or</span>
            <div className="flex-1 h-px bg-white/5" />
          </div>

          <p className="text-center text-sm text-gray-500">
            {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            <button
              onClick={() => switchMode(mode === 'login' ? 'register' : 'login')}
              className="text-neon-cyan hover:underline font-mono"
            >
              {mode === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
        </motion.div>

        <p className="text-center text-gray-700 text-xs font-mono mt-6">
          Secured by JWT · Powered by Polygon Blockchain
        </p>
      </div>
    </div>
  )
}
