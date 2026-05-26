import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FiShield, FiArrowLeft, FiGithub, FiExternalLink,
  FiZap, FiLock, FiGlobe, FiCpu
} from 'react-icons/fi'

const TECH_STACK = [
  { name: 'React + Vite', desc: 'Fast, modern frontend framework', color: '#00f5ff' },
  { name: 'Polygon Blockchain', desc: 'Low-cost, fast EVM-compatible chain', color: '#bf00ff' },
  { name: 'Ethers.js', desc: 'Web3 wallet and contract interaction', color: '#ff006e' },
  { name: 'MongoDB', desc: 'Flexible document database', color: '#39ff14' },
  { name: 'Node.js + Express', desc: 'Backend REST API server', color: '#fff200' },
  { name: 'OpenAI API', desc: 'AI-powered credential assistant', color: '#00bfff' },
  { name: 'JWT Auth', desc: 'Secure token-based authentication', color: '#ff8c00' },
  { name: 'Framer Motion', desc: 'Smooth UI animations', color: '#7fff00' },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen px-4 pt-8 pb-16 relative">
      <div className="fixed inset-0 cyber-grid opacity-20 pointer-events-none" />
      <div className="fixed inset-0 bg-hero-gradient pointer-events-none" />

      <Link to="/" className="fixed top-6 left-6 z-20 flex items-center gap-2 text-sm text-gray-500 hover:text-neon-cyan transition-colors">
        <FiArrowLeft size={16} />
        <span className="font-mono">Back</span>
      </Link>

      <div className="relative z-10 max-w-4xl mx-auto pt-8 space-y-12">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-neon-cyan/30 flex items-center justify-center mx-auto mb-4">
            <FiShield size={28} className="text-neon-cyan" />
          </div>
          <h1 className="font-display text-4xl font-black gradient-text mb-4">SKILLCHAIN</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
            A decentralized protocol for issuing, storing, and verifying professional credentials on the Polygon blockchain.
            Built for a trustless, self-sovereign future of work.
          </p>
        </motion.div>

        {/* Mission */}
        <div className="glass-card p-8">
          <p className="text-neon-cyan font-mono text-xs tracking-widest mb-3">// MISSION</p>
          <h2 className="font-display text-2xl text-white mb-4">The Problem We Solve</h2>
          <div className="grid md:grid-cols-2 gap-6 text-gray-400 text-sm leading-relaxed">
            <p>
              Traditional credentials are stored in centralized databases, susceptible to fraud, and require
              contacting the issuing institution for verification — a slow, expensive process.
            </p>
            <p>
              SkillChain writes every credential as an immutable on-chain record on Polygon. Anyone can verify
              a credential in milliseconds with just a credential ID, without trusting any intermediary.
            </p>
          </div>
        </div>

        {/* Key properties */}
        <div>
          <p className="text-neon-purple font-mono text-xs tracking-widest mb-6 text-center">// PROTOCOL PROPERTIES</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: FiShield, title: 'Tamper-Proof', desc: 'Stored on immutable blockchain — no one can alter or delete a credential', color: '#00f5ff' },
              { icon: FiLock, title: 'Trustless', desc: 'No need to trust SkillChain. Verify directly against the blockchain', color: '#bf00ff' },
              { icon: FiGlobe, title: 'Portable', desc: 'Share via API, QR code, or credential ID. Works with any app', color: '#ff006e' },
              { icon: FiZap, title: 'Instant', desc: 'Sub-second verification. No emails, no phone calls, no waiting', color: '#39ff14' },
            ].map(item => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="glass-card p-5"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${item.color}15`, border: `1px solid ${item.color}30` }}>
                  <item.icon size={18} style={{ color: item.color }} />
                </div>
                <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tech stack */}
        <div>
          <p className="text-neon-cyan font-mono text-xs tracking-widest mb-6 text-center">// TECH STACK</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3">
            {TECH_STACK.map((tech, i) => (
              <motion.div
                key={tech.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="glass-card p-4"
              >
                <div className="w-2 h-2 rounded-full mb-2" style={{ background: tech.color }} />
                <p className="text-white text-sm font-semibold">{tech.name}</p>
                <p className="text-gray-600 text-xs mt-0.5">{tech.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Integration guide */}
        <div className="glass-card p-8">
          <div className="flex items-center gap-2 mb-4">
            <FiCpu size={16} className="text-neon-cyan" />
            <p className="text-neon-cyan font-mono text-xs tracking-widest">// API INTEGRATION</p>
          </div>
          <h2 className="font-display text-xl text-white mb-4">Third-Party Integration</h2>
          <p className="text-gray-400 text-sm mb-5">
            Any application can verify SkillChain credentials via our public REST API or directly on-chain.
          </p>
          <div className="space-y-3">
            {[
              { method: 'GET', path: '/api/credentials/verify/:id', desc: 'Verify a credential by ID' },
              { method: 'GET', path: '/api/credentials/public/:address', desc: 'Get all public credentials for a wallet address' },
              { method: 'POST', path: '/api/credentials/issue', desc: 'Issue a new credential (authenticated)' },
            ].map(ep => (
              <div key={ep.path} className="flex items-center gap-3 p-3 bg-dark-800 rounded-xl border border-white/5">
                <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold
                  ${ep.method === 'GET' ? 'bg-neon-green/10 text-neon-green' : 'bg-neon-cyan/10 text-neon-cyan'}`}>
                  {ep.method}
                </span>
                <code className="text-gray-300 text-xs font-mono flex-1">{ep.path}</code>
                <span className="text-gray-600 text-xs hidden sm:block">{ep.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center space-y-4">
          <Link to="/auth" className="cyber-btn cyber-btn-primary text-sm py-3.5 px-12 inline-flex items-center gap-2">
            <FiShield size={15} /> Get Started →
          </Link>
          <p className="text-gray-700 text-xs font-mono">
            Open Source · MIT License · Built on Polygon
          </p>
        </div>
      </div>
    </div>
  )
}
