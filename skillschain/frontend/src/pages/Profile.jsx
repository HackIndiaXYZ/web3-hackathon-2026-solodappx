import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { SKILLSCHAIN_ABI, CONTRACT_ADDRESS } from "../contract/abi";
import { ethers } from "ethers";
import { User, Wallet, Copy, Shield, Award, Clock, ExternalLink, QrCode, FileDown } from "lucide-react";
import { shortenAddress, formatDate, copyToClipboard, getAddressExplorerUrl } from "../utils/helpers";
import toast from "react-hot-toast";
import QRCodeDisplay from "../components/QRCodeDisplay";

function Profile() {
  const { account, provider } = useWallet();
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [selectedCred, setSelectedCred] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => { if (account && provider) fetchProfile(); }, [account, provider]);

  async function fetchProfile() {
    if (!account || !provider) return;
    setLoading(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SKILLSCHAIN_ABI, provider);
      const userCreds = await contract.getCredentials(account);
      const formatted = userCreds.filter((c) => c.exists).map((c) => ({
        id: Number(c.id), name: c.name, skill: c.skill, issuer: c.issuer, timestamp: new Date(Number(c.timestamp) * 1000).toISOString(),
      }));
      setCredentials(formatted);
    } catch (error) { console.error(error); toast.error("Failed to load profile"); }
    finally { setLoading(false); }
  }

  function downloadCertificate(cred) {
    const certText = `═══════════════════════════════════════\n    SKILLS CHAIN CERTIFICATE\n═══════════════════════════════════════\n\n  ID:     ${cred.id}\n  Name:   ${cred.name}\n  Skill:  ${cred.skill}\n  Issuer: ${cred.issuer}\n  Date:   ${formatDate(cred.timestamp)}\n  Status: ✅ Verified on Blockchain\n  Net:    Polygon Mumbai Testnet\n  Contract: ${CONTRACT_ADDRESS}\n\n═══════════════════════════════════════\n  Verify: ${window.location.origin}/verify\n═══════════════════════════════════════`;
    const blob = new Blob([certText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `Certificate_${cred.id}.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Certificate downloaded!");
  }

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center max-w-md">
          <User className="w-16 h-16 mx-auto mb-6 text-neon-purple" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">Connect MetaMask to view your profile.</p>
          <Link to="/"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="neon-button">Go Home</motion.button></Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          <div className="w-20 h-20 rounded-2xl neon-gradient flex items-center justify-center flex-shrink-0"><User className="w-10 h-10 text-white" /></div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold mb-2">Your Profile</h1>
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-4">
              <Wallet className="w-4 h-4 text-neon-purple" />
              <span className="text-sm font-mono text-white">{shortenAddress(account, 6)}</span>
              <button onClick={() => { copyToClipboard(account).then(() => toast.success("Copied!")); }} className="text-gray-400 hover:text-white transition-colors"><Copy className="w-3.5 h-3.5" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-card p-4 rounded-xl"><Award className="w-6 h-6 text-neon-purple mb-2" /><p className="text-2xl font-bold">{credentials.length}</p><p className="text-sm text-gray-400">Credentials</p></div>
              <div className="glass-card p-4 rounded-xl"><Shield className="w-6 h-6 text-neon-green mb-2" /><p className="text-2xl font-bold text-neon-green">{credentials.length > 0 ? "Active" : "None"}</p><p className="text-sm text-gray-400">Status</p></div>
              <div className="glass-card p-4 rounded-xl"><Clock className="w-6 h-6 text-neon-cyan mb-2" /><p className="text-2xl font-bold text-neon-cyan">{credentials.length > 0 ? formatDate(credentials[credentials.length - 1].timestamp).split(",")[0] : "N/A"}</p><p className="text-sm text-gray-400">Last Activity</p></div>
            </div>
          </div>
        </div>
      </motion.div>

      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3"><Shield className="w-6 h-6 text-neon-purple" /> Your Credentials</h2>

      {loading ? (
        <div className="grid gap-6">{[1,2].map(i => <div key={i} className="glass-card p-6 animate-pulse"><div className="h-6 bg-dark-500 rounded w-1/4 mb-4"/><div className="h-4 bg-dark-500 rounded w-1/3 mb-2"/><div className="h-4 bg-dark-500 rounded w-1/2"/></div>)}</div>
      ) : credentials.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <Award className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-bold mb-2 text-gray-300">No Credentials Yet</h3>
          <p className="text-gray-500 mb-6">You don't have any skill credentials issued to your wallet.</p>
          <Link to="/dashboard"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="neon-button">Go to Dashboard</motion.button></Link>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {credentials.map((cred, index) => (
            <motion.div key={cred.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="glass-card-hover p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="badge-verified"><Shield className="w-3.5 h-3.5" /> Verified on Blockchain</span>
                    <span className="text-xs text-gray-500 font-mono">ID #{cred.id}</span>
                  </div>
                  <h3 className="text-lg font-bold">{cred.name}</h3>
                  <p className="text-neon-cyan">{cred.skill}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-sm text-gray-400"><Clock className="w-4 h-4 inline mr-1" />{formatDate(cred.timestamp)}</div>
                  <div className="text-sm text-gray-400"><Award className="w-4 h-4 inline mr-1" />Issuer: {shortenAddress(cred.issuer)}</div>
                  <div className="flex gap-1">
                    <button onClick={() => { copyToClipboard(cred.issuer).then(() => toast.success("Copied!")); }} className="p-2 glass-card rounded-lg hover:border-neon-purple/50 transition-all" title="Copy"><Copy className="w-4 h-4" /></button>
                    <button onClick={() => { setSelectedCred(cred); setShowQR(true); }} className="p-2 glass-card rounded-lg hover:border-neon-purple/50 transition-all" title="QR"><QrCode className="w-4 h-4" /></button>
                    <button onClick={() => downloadCertificate(cred)} className="p-2 glass-card rounded-lg hover:border-neon-green/50 transition-all" title="Download"><FileDown className="w-4 h-4" /></button>
                    <a href={getAddressExplorerUrl(cred.issuer)} target="_blank" rel="noopener noreferrer" className="p-2 glass-card rounded-lg hover:border-neon-cyan/50 transition-all" title="Explorer"><ExternalLink className="w-4 h-4" /></a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {showQR && selectedCred && <QRCodeDisplay credential={selectedCred} onClose={() => setShowQR(false)} />}
    </div>
  );
}

export default Profile;
