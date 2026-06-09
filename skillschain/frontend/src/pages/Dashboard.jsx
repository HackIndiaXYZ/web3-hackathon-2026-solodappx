import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useWallet } from "../context/WalletContext";
import { SKILLSCHAIN_ABI, CONTRACT_ADDRESS } from "../contract/abi";
import { ethers } from "ethers";
import { shortenAddress, formatDate, getExplorerUrl, copyToClipboard } from "../utils/helpers";
import toast from "react-hot-toast";
import { Wallet, PlusCircle, Shield, Clock, Award, ExternalLink, Copy, QrCode, FileDown, Search, AlertCircle, Loader2 } from "lucide-react";
import QRCodeDisplay from "../components/QRCodeDisplay";

function Dashboard() {
  const { account, provider, connectWallet } = useWallet();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [totalCredentials, setTotalCredentials] = useState(0);
  const [selectedCred, setSelectedCred] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => { if (account && provider) fetchCredentials(); }, [account, provider]);

  async function fetchCredentials() {
    if (!provider || !account) return;
    setLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SKILLSCHAIN_ABI, provider);
      const userCreds = await contract.getCredentials(account);
      const total = await contract.getTotalCredentials();
      const formatted = userCreds.filter((c) => c.exists).map((c) => ({
        id: Number(c.id), name: c.name, skill: c.skill,
        issuer: c.issuer, timestamp: new Date(Number(c.timestamp) * 1000).toISOString(),
      }));
      setCredentials(formatted);
      setTotalCredentials(Number(total));
    } catch (error) { console.error(error); toast.error("Failed to fetch credentials"); }
    finally { setLoading(false); }
  }

  function downloadCertificate(cred) {
    const certText = `═══════════════════════════════════════\n    SKILLS CHAIN CERTIFICATE\n═══════════════════════════════════════\n\n  ID:     ${cred.id}\n  Name:   ${cred.name}\n  Skill:  ${cred.skill}\n  Issuer: ${cred.issuer}\n  Date:   ${formatDate(cred.timestamp)}\n  Status: ✅ Verified on Blockchain\n  Net:    Polygon Mumbai Testnet\n  Contract: ${CONTRACT_ADDRESS}\n\n═══════════════════════════════════════\n  Verify: ${window.location.origin}/verify\n═══════════════════════════════════════`;
    const blob = new Blob([certText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `Certificate_${cred.id}.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Certificate downloaded!");
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-md">
          <Wallet className="w-16 h-16 mx-auto mb-6 text-neon-purple" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">Connect MetaMask to access the dashboard.</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={connectWallet} className="neon-button">Connect Wallet</motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome, <span className="neon-gradient-text">{shortenAddress(account)}</span></h1>
        <p className="text-gray-400">Manage your blockchain-verified skill credentials.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4"><Award className="w-8 h-8 text-neon-purple" /><span className="text-xs text-gray-400 uppercase">Total Issued</span></div>
          <div className="text-3xl font-bold neon-gradient-text">{totalCredentials}</div>
          <p className="text-gray-400 text-sm mt-1">Platform credentials</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4"><Shield className="w-8 h-8 text-neon-cyan" /><span className="text-xs text-gray-400 uppercase">Your Credentials</span></div>
          <div className="text-3xl font-bold text-neon-cyan">{credentials.length}</div>
          <p className="text-gray-400 text-sm mt-1">Verified on-chain</p>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4"><Wallet className="w-8 h-8 text-neon-green" /><span className="text-xs text-gray-400 uppercase">Balance</span></div>
          <div className="text-3xl font-bold text-neon-green"><span className="text-lg">MATIC</span></div>
          <p className="text-gray-400 text-sm mt-1">Polygon Mumbai</p>
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <Link to="/issue"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="neon-button flex items-center gap-2"><PlusCircle className="w-5 h-5" /> Issue Credential</motion.button></Link>
        <Link to="/verify"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="glass-card flex items-center gap-2 px-6 py-3 hover:border-neon-purple/50 transition-all"><Search className="w-5 h-5" /> Verify Credential</motion.button></Link>
      </div>

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Shield className="w-6 h-6 text-neon-purple" /> Your Credentials</h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{[1,2,3].map(i => <div key={i} className="glass-card p-6 animate-pulse"><div className="h-6 bg-dark-500 rounded w-1/3 mb-4"/><div className="h-4 bg-dark-500 rounded w-2/3 mb-2"/><div className="h-4 bg-dark-500 rounded w-1/2 mb-4"/><div className="h-10 bg-dark-500 rounded w-full"/></div>)}</div>
      ) : credentials.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-bold mb-2 text-gray-300">No Credentials Yet</h3>
          <p className="text-gray-500 mb-6">Start by issuing your first skill credential.</p>
          <Link to="/issue"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="neon-button inline-flex items-center gap-2"><PlusCircle className="w-5 h-5" /> Issue Credential</motion.button></Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map((cred, index) => (
            <motion.div key={cred.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -5 }} className="glass-card-hover p-6">
              <div className="flex items-start justify-between mb-4">
                <span className="badge-verified"><Shield className="w-3.5 h-3.5" /> Verified on Blockchain</span>
                <span className="text-xs text-gray-500 font-mono">ID #{cred.id}</span>
              </div>
              <h3 className="text-lg font-bold mb-1">{cred.name}</h3>
              <p className="text-neon-cyan font-medium mb-4">{cred.skill}</p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-between text-sm"><span className="text-gray-400 flex items-center gap-1"><Clock className="w-4 h-4" /> Issued</span><span className="text-white">{formatDate(cred.timestamp)}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-gray-400 flex items-center gap-1"><Award className="w-4 h-4" /> Issuer</span><button onClick={() => { copyToClipboard(cred.issuer).then(() => toast.success("Copied!")); }} className="text-white font-mono flex items-center gap-1 hover:text-neon-purple transition-colors">{shortenAddress(cred.issuer)} <Copy className="w-3 h-3" /></button></div>
              </div>
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedCred(cred); setShowQR(true); }} className="flex-1 glass-card p-2 flex items-center justify-center gap-1 text-sm hover:border-neon-purple/50 transition-all"><QrCode className="w-4 h-4" /> QR</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => downloadCertificate(cred)} className="flex-1 glass-card p-2 flex items-center justify-center gap-1 text-sm hover:border-neon-green/50 transition-all"><FileDown className="w-4 h-4" /> Download</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(`/public/${cred.id}`)} className="flex-1 glass-card p-2 flex items-center justify-center gap-1 text-sm hover:border-neon-cyan/50 transition-all"><ExternalLink className="w-4 h-4" /> View</motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showQR && selectedCred && <QRCodeDisplay credential={selectedCred} onClose={() => setShowQR(false)} />}
    </div>
  );
}

export default Dashboard;
