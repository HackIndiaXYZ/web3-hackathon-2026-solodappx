import React from "react";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { formatDate, shortenAddress } from "../utils/helpers";
import { Copy, X, Shield } from "lucide-react";
import toast from "react-hot-toast";

function QRCodeDisplay({ credential, onClose }) {
  const verifyUrl = `${window.location.origin}/public/${credential.id}`;

  async function copyLink() {
    try { await navigator.clipboard.writeText(verifyUrl); toast.success("Link copied!"); }
    catch { toast.error("Failed to copy"); }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()} className="glass-card max-w-md w-full p-8 relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-white/10 transition-all">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-6">
          <Shield className="w-10 h-10 mx-auto mb-3 text-neon-purple" />
          <h2 className="text-xl font-bold mb-1">Credential QR Code</h2>
          <p className="text-gray-400 text-sm">Scan to verify on blockchain</p>
        </div>
        <div className="bg-white p-4 rounded-xl mx-auto w-fit mb-6">
          <QRCodeSVG value={verifyUrl} size={200} level="H" includeMargin={false} />
        </div>
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm"><span className="text-gray-400">Name</span><span className="font-medium">{credential.name}</span></div>
          <div className="flex items-center justify-between text-sm"><span className="text-gray-400">Skill</span><span className="font-medium text-neon-cyan">{credential.skill}</span></div>
          <div className="flex items-center justify-between text-sm"><span className="text-gray-400">ID</span><span className="font-mono text-neon-purple">#{credential.id}</span></div>
          <div className="flex items-center justify-between text-sm"><span className="text-gray-400">Issuer</span><span className="font-mono">{shortenAddress(credential.issuer)}</span></div>
          <div className="flex items-center justify-between text-sm"><span className="text-gray-400">Issued</span><span>{formatDate(credential.timestamp)}</span></div>
        </div>
        <button onClick={copyLink} className="w-full neon-gradient py-3 rounded-xl flex items-center justify-center gap-2 font-medium hover:opacity-90 transition-all">
          <Copy className="w-4 h-4" /> Copy Verification Link
        </button>
      </motion.div>
    </motion.div>
  );
}

export default QRCodeDisplay;
