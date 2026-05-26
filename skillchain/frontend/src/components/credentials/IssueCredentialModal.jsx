import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiShield, FiLoader, FiCheck } from 'react-icons/fi'
import { issueCredential } from '../../store/slices/credentialSlice'
import { closeModal } from '../../store/slices/uiSlice'
import toast from 'react-hot-toast'

const CATEGORIES = ['blockchain', 'development', 'design', 'data-science', 'cybersecurity', 'ai-ml', 'cloud', 'devops', 'other']
const LEVELS = [
  { value: 1, label: 'Beginner' },
  { value: 2, label: 'Intermediate' },
  { value: 3, label: 'Advanced' },
  { value: 4, label: 'Expert' },
  { value: 5, label: 'Master' },
]

export default function IssueCredentialModal() {
  const dispatch = useDispatch()
  const { issuing } = useSelector(s => s.credentials)
  const { address } = useSelector(s => s.web3)
  const [step, setStep] = useState(1) // 1: form, 2: confirming, 3: success
  const [form, setForm] = useState({
    recipientAddress: '',
    recipientName: '',
    skillName: '',
    category: 'development',
    level: 3,
    description: '',
    expiresAt: '',
  })

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.recipientAddress || !form.skillName) {
      toast.error('Please fill required fields')
      return
    }

    setStep(2)
    try {
      await dispatch(issueCredential({
        ...form,
        issuerAddress: address,
        level: parseInt(form.level),
      })).unwrap()
      setStep(3)
      toast.success('Credential issued on Polygon! 🎉')
      setTimeout(() => dispatch(closeModal()), 2500)
    } catch (err) {
      toast.error(err || 'Failed to issue credential')
      setStep(1)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => dispatch(closeModal())}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative glass-card w-full max-w-lg border border-neon-cyan/20 overflow-hidden"
      >
        {/* Animated top border */}
        <div className="h-0.5 animated-border w-full" />

        {/* Header */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
              <FiShield size={17} className="text-neon-cyan" />
            </div>
            <div>
              <h2 className="font-display text-base text-white">Issue Credential</h2>
              <p className="text-xs text-gray-500 font-mono">Polygon Amoy Testnet</p>
            </div>
          </div>
          <button onClick={() => dispatch(closeModal())} className="text-gray-500 hover:text-white transition-colors">
            <FiX size={20} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="p-6 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 font-mono mb-1.5">RECIPIENT ADDRESS *</label>
                  <input
                    name="recipientAddress"
                    value={form.recipientAddress}
                    onChange={handleChange}
                    placeholder="0x..."
                    className="cyber-input font-mono text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-mono mb-1.5">RECIPIENT NAME</label>
                  <input
                    name="recipientName"
                    value={form.recipientName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className="cyber-input"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-mono mb-1.5">SKILL NAME *</label>
                  <input
                    name="skillName"
                    value={form.skillName}
                    onChange={handleChange}
                    placeholder="Solidity Development"
                    className="cyber-input"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-mono mb-1.5">CATEGORY</label>
                  <select name="category" value={form.category} onChange={handleChange} className="cyber-input">
                    {CATEGORIES.map(c => (
                      <option key={c} value={c} style={{ background: '#050d15' }}>
                        {c.charAt(0).toUpperCase() + c.slice(1).replace('-', ' ')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-mono mb-1.5">PROFICIENCY LEVEL</label>
                  <select name="level" value={form.level} onChange={handleChange} className="cyber-input">
                    {LEVELS.map(l => (
                      <option key={l.value} value={l.value} style={{ background: '#050d15' }}>
                        {l.value} — {l.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 font-mono mb-1.5">DESCRIPTION</label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Describe the skill or achievement..."
                    rows={3}
                    className="cyber-input resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 font-mono mb-1.5">EXPIRY DATE (optional)</label>
                  <input
                    type="date"
                    name="expiresAt"
                    value={form.expiresAt}
                    onChange={handleChange}
                    className="cyber-input"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => dispatch(closeModal())} className="flex-1 cyber-btn text-gray-400 border-gray-700">
                  Cancel
                </button>
                <button type="submit" className="flex-1 cyber-btn-primary cyber-btn">
                  Issue On-Chain →
                </button>
              </div>
            </motion.form>
          )}

          {step === 2 && (
            <motion.div
              key="confirming"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 flex flex-col items-center gap-6 text-center"
            >
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-neon-cyan/20 border-t-neon-cyan animate-spin" />
                <FiShield className="absolute inset-0 m-auto text-neon-cyan" size={28} />
              </div>
              <div>
                <p className="font-display text-neon-cyan text-lg">WRITING TO BLOCKCHAIN</p>
                <p className="text-gray-500 text-sm mt-2 font-mono">Submitting transaction to Polygon Amoy...</p>
              </div>
              <div className="w-full bg-dark-700 rounded-full h-1">
                <motion.div
                  className="h-full bg-gradient-to-r from-neon-cyan to-neon-purple rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: '85%' }}
                  transition={{ duration: 2.5, ease: 'easeOut' }}
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-12 flex flex-col items-center gap-4 text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
                className="w-20 h-20 rounded-full bg-neon-green/10 border-2 border-neon-green/50 flex items-center justify-center"
              >
                <FiCheck size={36} className="text-neon-green" />
              </motion.div>
              <div>
                <p className="font-display text-neon-green text-lg">CREDENTIAL ISSUED!</p>
                <p className="text-gray-500 text-sm mt-2">Successfully written to Polygon blockchain</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
