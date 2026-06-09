import React, { useState } from "react";
import { motion } from "framer-motion";
import { useWallet } from "../context/WalletContext";
import { SKILLSCHAIN_ABI, CONTRACT_ADDRESS } from "../contract/abi";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { isValidAddress, formatDate, shortenAddress, getAddressExplorerUrl } from "../utils/helpers";
import { Search, Shield, CheckCircle, XCircle, AlertCircle, Loader2, Wallet, Hash, Award, Clock, ExternalLink } from "lucide-react";
import QRCodeDisplay from "../components/QRCodeDisplay";

function VerifyCredential() {
  const { provider } = useWallet();
  const [searchType, setSearchType] = useState("address");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState([]);
  const [selectedCred, setSelectedCred] = useState(null);
  const [showQR, setShowQR] = useState(false);

  async function handleSearch(e) {
    e.preventDefault();
    if (!searchQuery.trim()) { toast.error("Enter a search query"); return; }
    if (searchType === "address" && !isValidAddress(searchQuery.trim())) { toast.error("Invalid wallet address"); return; }

    setLoading(true);
    setCredentials([]);

    try {
      const rpc = provider || new ethers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SKILLSCHAIN_ABI, rpc);

      if (searchType === "address") {
        const userCreds = await contract.getCredentials(searchQuery.trim());
        const formatted = userCreds.filter((c) => c.exists).map((c) => ({
          id: Number(c.id), name: c.name, skill: c.skill,
          issuer: c.issuer, timestamp: new Date(Number(c.timestamp) * 1000).toISOString(),
        }));
        setCredentials(formatted);
        if (formatted.length === 0) toast("No credentials found for this address");
      } else {
        const credId = parseInt(searchQuery.trim());
        if (isNaN(credId)) { toast.error("Invalid credential ID"); setLoading(false); return; }
        try {
          const cred = await contract.getCredentialById(credId);
          if (cred.exists) {
            setCredentials([{ id: Number(cred.id), name: cred.name, skill: cred.skill, issuer: cred.issuer, timestamp: new Date(Number(cred.timestamp) * 1000).toISOString() }]);
          }
        } catch { toast.error("Credential not found"); }
      }
    } catch (error) { console.error(error); toast.error("Failed to verify. Try again."); }
    finally { setLoading(false); }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Shield className="w-16 h-16 mx-auto mb-6 text-neon-purple" />
          <h1 className="text-4xl font-bold mb-4">Verify <span className="neon-gradient-text">Credentials</span></h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">Verify any skill credential on the Polygon blockchain. Search by wallet address or credential ID.</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-8 mb-8">
        <div className="flex gap-2 mb-6">
          <button onClick={() => { setSearchType("address"); setSearchQuery(""); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${searchType === "address" ? "bg-neon-purple/20 text-neon-purple" : "text-gray-400 hover:text-white"}`}>
            <Wallet className="w-4 h-4 inline mr-1" /> Wallet Address
          </button>
          <button onClick={() => { setSearchType("id"); setSearchQuery(""); }} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${searchType === "id" ? "bg-neon-purple/20 text-neon-purple" : "text-gray-400 hover:text-white"}`}>
            <Hash className="w-4 h-4 inline mr-1" /> Credential ID
          </button>
        </div>
        <form onSubmit={handleSearch}>
          <div className="flex gap-3">
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchType === "address" ? "Enter wallet address (0x...)" : "Enter credential ID (e.g., 1)"}
              className="input-field flex-1" />
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} type="submit" disabled={loading}
              className="neon-button flex items-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              Verify
            </motion.button>
          </div>
        </form>
      </motion.div>

      {loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 py-12">
          <Loader2 className="w-12 h-12 text-neon-purple animate-spin" />
          <p className="text-gray-400">Verifying on blockchain...</p>
        </motion.div>
      )}

      {!loading && credentials.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2"><CheckCircle className="w-6 h-6 text-neon-green" /> Found {credentials.length} Credential{credentials.length > 1 ? "s" : ""}</h2>
          {credentials.map((cred, index) => (
            <motion.div key={cred.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }} className="glass-card p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="badge-verified"><Shield className="w-3.5 h-3.5" /> Verified on Blockchain</span>
                    <span className="text-xs text-gray-500 font-mono">ID #{cred.id}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{cred.name}</h3>
                  <p className="text-neon-cyan font-medium mb-4">{cred.skill}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-gray-400" /><span className="text-gray-400">Issued:</span><span className="text-white">{formatDate(cred.timestamp)}</span></div>
                    <div className="flex items-center gap-2 text-sm"><Award className="w-4 h-4 text-gray-400" /><span className="text-gray-400">Issuer:</span><span className="text-white font-mono">{shortenAddress(cred.issuer)}</span></div>
                    <div className="flex items-center gap-2 text-sm"><Wallet className="w-4 h-4 text-gray-400" /><span className="text-gray-400">Holder:</span><span className="text-white font-mono">{shortenAddress(searchType === "address" ? searchQuery : cred.issuer)}</span></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { setSelectedCred(cred); setShowQR(true); }} className="glass-card p-2 hover:border-neon-purple/50 transition-all"><Search className="w-5 h-5" /></motion.button>
                  <a href={getAddressExplorerUrl(cred.issuer)} target="_blank" rel="noopener noreferrer" className="glass-card p-2 hover:border-neon-cyan/50 transition-all"><ExternalLink className="w-5 h-5" /></a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {!loading && credentials.length === 0 && searchQuery && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <XCircle className="w-16 h-16 mx-auto mb-4 text-gray-500" />
          <h3 className="text-xl font-bold mb-2 text-gray-300">No Credentials Found</h3>
          <p className="text-gray-500">{searchType === "address" ? "No credentials exist for this wallet address." : "No credential exists with this ID."}</p>
        </motion.div>
      )}

      {showQR && selectedCred && <QRCodeDisplay credential={selectedCred} onClose={() => setShowQR(false)} />}
    </div>
  );
}

export default VerifyCredential;
