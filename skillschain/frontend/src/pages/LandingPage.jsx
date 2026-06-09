import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { Shield, Database, Lock, Wallet, ArrowRight, Award, Zap, Globe } from "lucide-react";

function LandingPage() {
  const { account, connectWallet } = useWallet();
  const features = [
    { icon: Shield, title: "Trustless Verification", desc: "Credentials verified directly on-chain with zero intermediaries.", gradient: "from-neon-purple to-neon-blue" },
    { icon: Lock, title: "Tamper-Proof Records", desc: "Once issued, credentials cannot be altered or deleted.", gradient: "from-neon-blue to-neon-cyan" },
    { icon: Wallet, title: "Wallet-Based Identity", desc: "No passwords. Your wallet address is your identity.", gradient: "from-neon-cyan to-neon-green" },
    { icon: Globe, title: "Decentralized Storage", desc: "No centralized databases. All data lives on Polygon.", gradient: "from-neon-green to-neon-purple" },
  ];

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-neon-purple/20 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-neon-cyan/20 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card text-sm text-neon-purple mb-8">
            <Zap className="w-4 h-4" /> Powered by Polygon Blockchain
          </span>
          <h1 className="text-5xl sm:text-7xl font-extrabold mb-6">
            <span className="text-white">Skills </span><span className="neon-gradient-text">On-Chain</span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto mb-10">
            Issue, store, and verify skill credentials on the blockchain.<br className="hidden sm:block" />
            Trustless. Tamper-proof. Decentralized.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!account ? (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={connectWallet} className="neon-button flex items-center justify-center gap-2 text-lg px-8 py-4">
                Connect Wallet <ArrowRight className="w-5 h-5" />
              </motion.button>
            ) : (
              <Link to="/dashboard">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  className="neon-button flex items-center justify-center gap-2 text-lg px-8 py-4">
                  Go to Dashboard <ArrowRight className="w-5 h-5" />
                </motion.button>
              </Link>
            )}
            <Link to="/verify">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="glass-card flex items-center justify-center gap-2 text-lg px-8 py-4 text-white hover:border-neon-purple/50 transition-all">
                Verify Credential <Shield className="w-5 h-5" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>

      <section className="py-16 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: "Credentials Issued", value: "On-Chain", icon: Database },
              { label: "Verification Time", value: "< 3s", icon: Zap },
              { label: "Network", value: "Polygon", icon: Globe },
              { label: "Decentralized", value: "100%", icon: Lock },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="text-center">
                <stat.icon className="w-8 h-8 mx-auto mb-3 text-neon-purple" />
                <div className="text-3xl font-bold neon-gradient-text mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why <span className="neon-gradient-text">SkillsChain</span>?</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Built on blockchain for trust, transparency, and security.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15 }} whileHover={{ y: -5 }}
                className="glass-card-hover p-8 group cursor-pointer">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-r ${f.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <f.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-400">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How It <span className="neon-gradient-text">Works</span></h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "01", title: "Connect Wallet", desc: "Link MetaMask for decentralized identity.", icon: Wallet },
              { step: "02", title: "Issue Credential", desc: "Enter student details and skill. Stored on-chain.", icon: Award },
              { step: "03", title: "Verify Anytime", desc: "Anyone can verify by wallet or credential ID.", icon: Shield },
            ].map((item, i) => (
              <motion.div key={item.step} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.2 }}
                className="relative glass-card-hover p-8">
                <div className="absolute top-4 right-4 text-6xl font-bold text-white/5">{item.step}</div>
                <item.icon className="w-10 h-10 text-neon-purple mb-6" />
                <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                <p className="text-gray-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card p-8 sm:p-12">
            <div className="flex items-center gap-3 mb-6">
              <Award className="w-8 h-8 text-neon-cyan" />
              <h2 className="text-3xl font-bold">Third-Party <span className="neon-gradient-text">SDK</span></h2>
            </div>
            <p className="text-gray-400 mb-8">Integrate SkillsChain verification into your own applications.</p>
            <div className="bg-dark-900 rounded-xl p-6 font-mono text-sm overflow-x-auto">
              <div className="text-gray-500 mb-4">// Verify a credential on-chain</div>
              <div><span className="text-neon-purple">import</span> <span className="text-neon-cyan">{"{ verifyCredential }"}</span> <span className="text-neon-purple">from</span> <span className="text-green-400">'@skillschain/sdk'</span>;</div>
              <br />
              <div><span className="text-neon-purple">const</span> <span className="text-white">cred</span> <span className="text-neon-purple">= await</span> <span className="text-neon-cyan">verifyCredential</span>(</div>
              <div className="pl-4"><span className="text-neon-cyan">contractAddress</span>, <span className="text-neon-cyan">credentialId</span>, <span className="text-neon-cyan">provider</span></div>
              <div>);</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="neon-gradient rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-dark-900/80" />
            <div className="relative">
              <Award className="w-16 h-16 mx-auto mb-6 text-white" />
              <h2 className="text-4xl font-bold text-white mb-4">Ready to Go On-Chain?</h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">Start issuing tamper-proof skill credentials on Polygon.</p>
              {account ? (
                <Link to="/dashboard">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="bg-white text-dark-900 font-bold px-8 py-4 rounded-xl inline-flex items-center gap-2">
                    Open Dashboard →
                  </motion.button>
                </Link>
              ) : (
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={connectWallet}
                  className="bg-white text-dark-900 font-bold px-8 py-4 rounded-xl inline-flex items-center gap-2">
                  Connect Wallet →
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-neon-purple" />
            <span className="text-lg font-bold neon-gradient-text">SkillsChain</span>
          </div>
          <div className="flex items-center gap-6 text-gray-400 text-sm">
            <span>Built on Polygon</span> <span>•</span> <span>No Database</span> <span>•</span> <span>100% On-Chain</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 SkillsChain. Decentralized & Open Source.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
