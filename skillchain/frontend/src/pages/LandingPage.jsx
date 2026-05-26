import { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, useScroll, useTransform } from 'framer-motion'
import { FiArrowRight, FiShield, FiZap, FiGlobe, FiLock, FiCheckCircle, FiGithub } from 'react-icons/fi'

const FEATURES = [
  {
    icon: FiShield,
    title: 'Tamper-Proof Credentials',
    desc: 'Every credential is hashed and stored on Polygon blockchain — immutable, permanent, trustless.',
    color: '#00f5ff',
  },
  {
    icon: FiZap,
    title: 'Instant Verification',
    desc: 'Any third party can verify credentials in milliseconds without contacting the issuer.',
    color: '#bf00ff',
  },
  {
    icon: FiGlobe,
    title: 'Cross-Platform Portability',
    desc: 'Share your verified skills via API or QR code with any employer or platform worldwide.',
    color: '#ff006e',
  },
  {
    icon: FiLock,
    title: 'Self-Sovereign Identity',
    desc: 'You own your credentials. No central authority, no data silos, no vendor lock-in.',
    color: '#39ff14',
  },
]

const STATS = [
  { label: 'Credentials Issued', value: '12,480+' },
  { label: 'Verified On-Chain', value: '99.8%' },
  { label: 'Active Issuers', value: '340+' },
  { label: 'Avg Verification', value: '<1s' },
]

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.12 } } },
  item: { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.6 } } },
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { isAuthenticated } = useSelector(s => s.auth)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, -60])

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Cyber grid bg */}
      <div className="fixed inset-0 cyber-grid opacity-30 pointer-events-none" />

      {/* Hero gradient */}
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" />

      {/* ── NAVBAR ────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-purple flex items-center justify-center">
            <FiShield size={16} className="text-dark-900" />
          </div>
          <span className="font-display text-base font-bold gradient-text">SKILLCHAIN</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/about" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
            About
          </Link>
          <Link to="/verify/demo" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
            Verify
          </Link>
          {isAuthenticated ? (
            <Link to="/dashboard" className="cyber-btn cyber-btn-primary text-xs py-2 px-5">
              Dashboard
            </Link>
          ) : (
            <Link to="/auth" className="cyber-btn cyber-btn-primary text-xs py-2 px-5">
              Launch App →
            </Link>
          )}
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────── */}
      <motion.section
        style={{ y: heroY }}
        className="relative z-10 text-center px-6 pt-20 pb-32 max-w-5xl mx-auto"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-neon-cyan/20 text-xs font-mono text-neon-cyan mb-8"
        >
          <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
          Deployed on Polygon Amoy Testnet
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-5xl sm:text-6xl md:text-7xl font-black leading-tight mb-6"
        >
          <span className="gradient-text">SKILLS</span>
          <br />
          <span className="text-white">ON-CHAIN.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-body leading-relaxed"
        >
          Issue, verify, and own your credentials on the Polygon blockchain.
          Tamper-proof. Trustless. Portable.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
            className="cyber-btn cyber-btn-primary text-sm py-3.5 px-10 flex items-center gap-2 group"
          >
            Get Started
            <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
          <Link
            to="/verify/demo"
            className="cyber-btn text-sm py-3.5 px-10 flex items-center gap-2"
          >
            <FiCheckCircle size={16} />
            Verify Credential
          </Link>
        </motion.div>

        {/* Floating credential card preview */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 15 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.9, delay: 0.6 }}
          style={{ perspective: '1000px' }}
          className="mt-20 mx-auto max-w-md"
        >
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            className="glass-card p-6 border-neon-cyan/20 relative"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-neon-cyan/5 to-neon-purple/5 rounded-2xl pointer-events-none" />
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
                  <FiShield size={18} className="text-neon-cyan" />
                </div>
                <div className="text-left">
                  <p className="text-white font-semibold text-sm">Solidity Smart Contracts</p>
                  <p className="text-gray-500 text-xs font-mono">blockchain · Level 4 — Expert</p>
                </div>
              </div>
              <span className="status-verified flex items-center gap-1 px-2 py-1 rounded-full text-xs font-mono">
                <FiCheckCircle size={10} /> Verified
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Issued by <span className="text-neon-purple font-mono">0x1a2b...3c4d</span></span>
              <span className="text-gray-600 font-mono">2024-01-15</span>
            </div>
            <div className="mt-3 pt-3 border-t border-white/5 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse" />
              <span className="text-[11px] text-gray-600 font-mono">0x7f3a...8e91 · Block #47,291,084</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="relative z-10 py-16 border-y border-white/5">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <p className="font-display text-3xl md:text-4xl font-bold neon-text-cyan">{stat.value}</p>
              <p className="text-gray-500 text-sm mt-1 font-mono">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section className="relative z-10 py-24 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-neon-cyan font-mono text-sm tracking-widest mb-3">// PROTOCOL FEATURES</p>
          <h2 className="font-display text-4xl font-bold text-white">
            Built for <span className="gradient-text">Web3</span>
          </h2>
        </motion.div>

        <motion.div
          variants={stagger.container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {FEATURES.map(feat => (
            <motion.div
              key={feat.title}
              variants={stagger.item}
              whileHover={{ scale: 1.03, y: -4 }}
              className="glass-card p-6 group"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ background: `${feat.color}15`, border: `1px solid ${feat.color}30` }}
              >
                <feat.icon size={22} style={{ color: feat.color }} />
              </div>
              <h3 className="font-semibold text-white text-sm mb-2 group-hover:text-neon-cyan transition-colors">
                {feat.title}
              </h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="relative z-10 py-24 bg-dark-800/50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-neon-purple font-mono text-sm tracking-widest mb-3">// HOW IT WORKS</p>
            <h2 className="font-display text-4xl font-bold text-white">
              Three Steps to <span className="gradient-text">Trust</span>
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-8 left-1/4 right-1/4 h-px bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink opacity-30" />

            {[
              { num: '01', title: 'Connect Wallet', desc: 'Link your MetaMask wallet to authenticate and receive credentials.' },
              { num: '02', title: 'Issue / Receive', desc: 'Organizations issue credentials directly to your wallet address on Polygon.' },
              { num: '03', title: 'Verify Anywhere', desc: 'Share your credential ID. Anyone can verify it instantly without trusting you.' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center relative"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center mx-auto mb-4">
                  <span className="font-display text-xl font-bold neon-text-cyan">{step.num}</span>
                </div>
                <h3 className="font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="relative z-10 py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto px-6"
        >
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-6">
            Ready to go <span className="gradient-text">on-chain?</span>
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Join the decentralized credentials revolution. Your skills, your proof, your blockchain.
          </p>
          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
            className="cyber-btn cyber-btn-primary text-sm py-4 px-14 inline-flex items-center gap-2 group"
          >
            Launch SkillChain
            <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="relative z-10 py-8 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <FiShield size={14} className="text-neon-cyan" />
          <span className="font-display text-sm gradient-text">SKILLCHAIN</span>
        </div>
        <p className="text-gray-600 text-xs font-mono">
          Built on Polygon · Open Source · Trustless Verification Protocol v1.0
        </p>
      </footer>
    </div>
  )
}
