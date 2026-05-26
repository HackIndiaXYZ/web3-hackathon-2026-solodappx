import { useState, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { motion } from 'framer-motion'
import {
  FiUser, FiMail, FiSave, FiShield, FiZap,
  FiCopy, FiExternalLink, FiEdit3, FiCheckCircle,
  FiCamera, FiTrash2, FiLink, FiShare2
} from 'react-icons/fi'
import { updateProfile } from '../store/slices/authSlice'
import { shortAddress, copyToClipboard, polygonscanAddressUrl } from '../utils/helpers'
import { QRCodeSVG } from 'qrcode.react'
import api from '../utils/api'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const dispatch = useDispatch()
  const { user }  = useSelector(s => s.auth)
  const { address, isConnected, balance } = useSelector(s => s.web3)
  const { stats } = useSelector(s => s.credentials)

  const [editing, setEditing] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({
    name:    user?.name    || '',
    bio:     user?.bio     || '',
    website: user?.website || '',
    github:  user?.github  || '',
    twitter: user?.twitter || '',
  })

  // Reset form when user changes
  const startEditing = () => {
    setForm({
      name:    user?.name    || '',
      bio:     user?.bio     || '',
      website: user?.website || '',
      github:  user?.github  || '',
      twitter: user?.twitter || '',
    })
    setEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await dispatch(updateProfile(form)).unwrap()
      toast.success('Profile updated!')
      setEditing(false)
    } catch (err) {
      toast.error(err || 'Update failed')
    }
    setSaving(false)
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { toast.error('Image too large — max 2MB'); return }

    setAvatarUploading(true)
    try {
      const reader = new FileReader()
      reader.onload = async (ev) => {
        const base64 = ev.target.result
        const { data } = await api.post('/upload/avatar', { avatar: base64 })
        // Update user in redux
        dispatch({ type: 'auth/setUser', payload: data.user })
        toast.success('Avatar updated!')
        setAvatarUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
      setAvatarUploading(false)
    }
  }

  const removeAvatar = async () => {
    try {
      const { data } = await api.delete('/upload/avatar')
      dispatch({ type: 'auth/setUser', payload: data.user })
      toast.success('Avatar removed')
    } catch {
      toast.error('Failed to remove avatar')
    }
  }

  // Public profile URL
  const publicUrl = address
    ? `${window.location.origin}/public/${address}`
    : `${window.location.origin}/public`

  const STAT_ITEMS = [
    { label: 'Total',    value: stats.total,    color: '#00f5ff' },
    { label: 'Verified', value: stats.verified, color: '#39ff14' },
    { label: 'Pending',  value: stats.pending,  color: '#fff200' },
    { label: 'Revoked',  value: stats.revoked,  color: '#ff006e' },
  ]

  const avatarLetter = (user?.name || 'U').charAt(0).toUpperCase()

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-white">
          My <span className="gradient-text">Profile</span>
        </h1>
        {!editing ? (
          <button onClick={startEditing} className="cyber-btn text-xs py-2 px-5 flex items-center gap-2">
            <FiEdit3 size={13} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)} className="cyber-btn text-xs py-2 px-4 text-gray-400">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="cyber-btn cyber-btn-primary text-xs py-2 px-4 flex items-center gap-2">
              {saving ? <div className="w-3 h-3 border border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" /> : <FiSave size={13} />}
              Save
            </button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="space-y-5">

          {/* Avatar + stats */}
          <div className="glass-card p-6 text-center">
            {/* Avatar with upload button */}
            <div className="relative w-20 h-20 mx-auto mb-4 group">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar"
                  className="w-20 h-20 rounded-full object-cover border-2 border-neon-cyan/30" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center text-3xl font-bold text-dark-900 font-display">
                  {avatarUploading ? (
                    <div className="w-6 h-6 border-2 border-dark-900/30 border-t-dark-900 rounded-full animate-spin" />
                  ) : avatarLetter}
                </div>
              )}
              {/* Upload overlay */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiCamera size={20} className="text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>

            {/* Remove avatar button */}
            {user?.avatar && (
              <button onClick={removeAvatar} className="text-[10px] text-gray-600 hover:text-neon-pink font-mono flex items-center gap-1 mx-auto mb-3 transition-colors">
                <FiTrash2 size={10} /> Remove photo
              </button>
            )}

            <h2 className="font-semibold text-white text-lg">{user?.name}</h2>
            <p className="text-gray-500 text-sm font-mono">{user?.email}</p>
            <p className="text-[10px] text-gray-700 font-mono mt-1">
              {user?.role?.toUpperCase() || 'USER'} · Member since {new Date(user?.created_at || Date.now()).getFullYear()}
            </p>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-2 mt-5">
              {STAT_ITEMS.map(stat => (
                <div key={stat.label} className="p-2.5 bg-dark-700/50 rounded-xl border border-white/5">
                  <p className="font-display text-lg font-bold" style={{ color: stat.color }}>{stat.value}</p>
                  <p className="text-[10px] text-gray-600 font-mono leading-tight">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Wallet */}
          <div className="glass-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiZap size={14} className="text-neon-cyan" />
              <h3 className="font-display text-xs text-gray-400 tracking-wider">WALLET</h3>
            </div>
            {isConnected ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-gray-600 font-mono mb-1">ADDRESS</p>
                  <div className="flex items-center gap-1">
                    <p className="text-neon-cyan font-mono text-xs flex-1 truncate">{shortAddress(address, 10)}</p>
                    <button onClick={() => { copyToClipboard(address); toast.success('Copied!') }}
                      className="text-gray-600 hover:text-neon-cyan p-1 transition-colors"><FiCopy size={12} /></button>
                    <a href={polygonscanAddressUrl(address)} target="_blank" rel="noopener noreferrer"
                      className="text-gray-600 hover:text-neon-cyan p-1 transition-colors"><FiExternalLink size={12} /></a>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] text-gray-600 font-mono mb-1">BALANCE</p>
                  <p className="font-display text-xl text-white">
                    {parseFloat(balance || 0).toFixed(4)} <span className="text-gray-500 text-sm">MATIC</span>
                  </p>
                </div>
                <div className="flex items-center gap-1.5 pt-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
                  <p className="text-[10px] text-neon-green font-mono">Polygon Amoy Testnet</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-600 text-xs font-mono text-center py-2">No wallet connected</p>
            )}
          </div>

          {/* Public Profile QR + Share Link */}
          {isConnected && (
            <div className="glass-card p-5 text-center space-y-4">
              <p className="text-[10px] text-gray-500 font-mono tracking-widest">PUBLIC PROFILE</p>

              {/* QR Code */}
              <div className="inline-block p-3 bg-white rounded-xl">
                <QRCodeSVG value={publicUrl} size={120} level="M" />
              </div>

              <p className="text-[10px] text-gray-600 font-mono">Scan to view all credentials</p>

              {/* Share link */}
              <div className="flex items-center gap-2 p-2.5 bg-white/5 rounded-xl border border-white/10">
                <FiLink size={12} className="text-gray-600 flex-shrink-0" />
                <p className="text-[10px] text-gray-500 font-mono truncate flex-1">{publicUrl.replace('https://', '')}</p>
                <button
                  onClick={() => { copyToClipboard(publicUrl); toast.success('Link copied!') }}
                  className="text-gray-600 hover:text-neon-cyan transition-colors flex-shrink-0"
                >
                  <FiCopy size={12} />
                </button>
              </div>

              <a href={publicUrl} target="_blank" rel="noopener noreferrer"
                className="cyber-btn text-xs py-2 px-4 w-full flex items-center justify-center gap-2">
                <FiShare2 size={12} /> View Public Profile
              </a>
            </div>
          )}
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Personal info form */}
          <div className="glass-card p-6">
            <h3 className="font-display text-sm text-gray-400 tracking-wider mb-5">PERSONAL INFO</h3>
            <div className="space-y-4">
              {[
                { name: 'name',    label: 'DISPLAY NAME', icon: FiUser,        placeholder: 'Your full name' },
                { name: 'bio',     label: 'BIO',          icon: FiEdit3,       placeholder: 'Tell the world about your skills...', textarea: true },
                { name: 'website', label: 'WEBSITE',      icon: FiExternalLink,placeholder: 'https://yoursite.com' },
                { name: 'github',  label: 'GITHUB',       icon: FiUser,        placeholder: 'yourusername' },
                { name: 'twitter', label: 'TWITTER / X',  icon: FiUser,        placeholder: 'yourhandle' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-[10px] text-gray-600 font-mono mb-1.5 tracking-wider">{field.label}</label>
                  {field.textarea ? (
                    <textarea
                      name={field.name} value={form[field.name]}
                      onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                      disabled={!editing} placeholder={!editing ? '—' : field.placeholder} rows={3}
                      className="cyber-input resize-none disabled:opacity-50 disabled:cursor-default"
                    />
                  ) : (
                    <div className="relative">
                      <field.icon size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-600" />
                      <input type="text" name={field.name} value={form[field.name]}
                        onChange={e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))}
                        disabled={!editing} placeholder={!editing ? '—' : field.placeholder}
                        className="cyber-input pl-9 disabled:opacity-50 disabled:cursor-default"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Account info */}
          <div className="glass-card p-6">
            <h3 className="font-display text-sm text-gray-400 tracking-wider mb-4">ACCOUNT DETAILS</h3>
            <div className="space-y-0">
              {[
                { label: 'EMAIL',          value: user?.email, icon: FiMail },
                { label: 'MEMBER SINCE',   value: new Date(user?.created_at || Date.now()).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }), icon: FiShield },
                { label: 'ACCOUNT STATUS', value: user?.is_active ? 'Active' : 'Inactive', icon: FiCheckCircle, valueClass: user?.is_active ? 'text-neon-green' : 'text-neon-pink' },
                { label: 'ROLE',           value: (user?.role || 'user').toUpperCase(), icon: FiUser, valueClass: 'text-neon-cyan font-mono' },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2">
                    <item.icon size={13} className="text-gray-600" />
                    <span className="text-xs text-gray-500 font-mono">{item.label}</span>
                  </div>
                  <span className={`text-sm ${item.valueClass || 'text-gray-300'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Third-party embed snippet */}
          <div className="glass-card p-6">
            <h3 className="font-display text-sm text-gray-400 tracking-wider mb-2">EMBED IN YOUR APP</h3>
            <p className="text-xs text-gray-600 font-mono mb-4">
              Let any third-party app verify or display your credentials via our public API.
            </p>
            {isConnected ? (
              <div className="space-y-3">
                {/* API snippet */}
                <div>
                  <p className="text-[10px] text-gray-600 font-mono mb-1.5 tracking-wider">FETCH CREDENTIALS</p>
                  <div className="relative bg-dark-900 rounded-xl border border-white/5 p-3 overflow-x-auto">
                    <code className="text-[11px] text-neon-cyan font-mono whitespace-pre">{`fetch('${window.location.origin.replace(/:5173/, ':5000')}/api/credentials/public/${address}')
  .then(r => r.json())
  .then(data => console.log(data.credentials))`}</code>
                    <button
                      onClick={() => {
                        copyToClipboard(`fetch('${window.location.origin.replace(/:5173/, ':5000')}/api/credentials/public/${address}')\n  .then(r => r.json())\n  .then(data => console.log(data.credentials))`)
                        toast.success('Code copied!')
                      }}
                      className="absolute top-2 right-2 text-gray-700 hover:text-neon-cyan transition-colors"
                    >
                      <FiCopy size={12} />
                    </button>
                  </div>
                </div>
                {/* Verify snippet */}
                <div>
                  <p className="text-[10px] text-gray-600 font-mono mb-1.5 tracking-wider">VERIFY A CREDENTIAL</p>
                  <div className="relative bg-dark-900 rounded-xl border border-white/5 p-3 overflow-x-auto">
                    <code className="text-[11px] text-neon-green font-mono whitespace-pre">{`fetch('${window.location.origin.replace(/:5173/, ':5000')}/api/credentials/verify/<CREDENTIAL_ID>')
  .then(r => r.json())
  .then(({ isValid, credential }) => console.log(isValid, credential))`}</code>
                    <button
                      onClick={() => {
                        copyToClipboard(`fetch('${window.location.origin.replace(/:5173/, ':5000')}/api/credentials/verify/<CREDENTIAL_ID>')\n  .then(r => r.json())\n  .then(({ isValid, credential }) => console.log(isValid, credential))`)
                        toast.success('Code copied!')
                      }}
                      className="absolute top-2 right-2 text-gray-700 hover:text-neon-cyan transition-colors"
                    >
                      <FiCopy size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 text-xs font-mono text-center py-4">Connect wallet to generate embed snippets</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
