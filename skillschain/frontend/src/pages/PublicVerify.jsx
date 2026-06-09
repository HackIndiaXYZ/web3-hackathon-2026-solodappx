import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { SKILLSCHAIN_ABI, CONTRACT_ADDRESS } from "../contract/abi";
import { ethers } from "ethers";
import { Shield, Award, Clock, ExternalLink, Wallet, ArrowLeft, XCircle } from "lucide-react";
import { formatDate, shortenAddress, getAddressExplorerUrl } from "../utils/helpers";
import QRCodeDisplay from "../components/QRCodeDisplay";

function PublicVerify() {
  const { id } = useParams();
  const [loading, setLoading] = useState(true);
  const [credential, setCredential] = useState(null);
  const [error, setError] = useState(null);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    verifyCredential();
  }, [id]);

  async function verifyCredential() {
    setLoading(true);
    setError(null);
    try {
      const provider = new ethers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SKILLSCHAIN_ABI, provider);
      const credId = parseInt(id);
      const cred = await contract.getCredentialById(credId);
      if (cred.exists) {
        setCredential({
          id: Number(cred.id), name: cred.name, skill: cred.skill,
          issuer: cred.issuer, timestamp: new Date(Number(cred.timestamp) * 1000).toISOString(),
        });
      } else {
        setError("Credential does not exist");
      }
    } catch (err) {
      setError("Credential not found or invalid");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neon-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neon-cyan/10 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative max-w-2xl w-full">
        <Link to="/verify" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> Back to Verification
        </Link>

        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Shield className="w-12 h-12 mx-auto mb-4 text-neon-purple" />
            <h1 className="text-3xl font-bold mb-2">Blockchain <span className="neon-gradient-text">Verification</span></h1>
            <p className="text-gray-400">Public credential verification page</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 rounded-full border-4 border-neon-purple border-t-transparent" />
              <p className="text-gray-400">Verifying on blockchain...</p>
            </div>
          ) : error ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
              <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
              <h2 className="text-xl font-bold mb-2 text-red-400">Verification Failed</h2>
              <p className="text-gray-400 mb-6">{error}</p>
              <Link to="/verify"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="neon-button">Try Again</motion.button></Link>
            </motion.div>
          ) : credential ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="flex justify-center mb-6">
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="badge-verified px-4 py-2 text-base">
                  <Shield className="w-5 h-5" /> Verified on Blockchain
                </motion.span>
              </div>

              <div className="space-y-4 mb-6">
                <div className="glass-card p-4"><div className="flex items-center gap-3"><Award className="w-6 h-6 text-neon-purple" /><div><p className="text-sm text-gray-400">Student Name</p><p className="text-lg font-bold">{credential.name}</p></div></div></div>
                <div className="glass-card p-4"><div className="flex items-center gap-3"><Shield className="w-6 h-6 text-neon-cyan" /><div><p className="text-sm text-gray-400">Skill</p><p className="text-lg font-bold text-neon-cyan">{credential.skill}</p></div></div></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="glass-card p-4"><div className="flex items-center gap-3"><Wallet className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-400">Issuer</p><p className="font-mono text-sm">{shortenAddress(credential.issuer, 6)}</p></div></div></div>
                  <div className="glass-card p-4"><div className="flex items-center gap-3"><Clock className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-400">Issued On</p><p className="text-sm">{formatDate(credential.timestamp)}</p></div></div></div>
                </div>
                <div className="glass-card p-4"><div className="flex items-center gap-3"><ExternalLink className="w-5 h-5 text-gray-400" /><div><p className="text-sm text-gray-400">Credential ID</p><p className="font-mono text-sm text-neon-purple">#{credential.id}</p></div></div></div>
              </div>

              <div className="flex gap-4 justify-center">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowQR(true)} className="glass-card p-3 rounded-xl hover:border-neon-purple/50 transition-all">QR Code</motion.button>
                <a href={getAddressExplorerUrl(credential.issuer)} target="_blank" rel="noopener noreferrer" className="glass-card p-3 rounded-xl hover:border-neon-cyan/50 transition-all"><ExternalLink className="w-5 h-5" /></a>
              </div>
            </motion.div>
          ) : null}
        </div>

        <p className="text-center text-gray-500 text-sm mt-6">Powered by SkillsChain • Polygon Blockchain</p>
      </motion.div>

      {showQR && credential && <QRCodeDisplay credential={credential} onClose={() => setShowQR(false)} />}
    </div>
  );
}

export default PublicVerify;
