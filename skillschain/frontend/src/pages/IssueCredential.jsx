import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useWallet } from "../context/WalletContext";
import { SKILLSCHAIN_ABI, CONTRACT_ADDRESS } from "../contract/abi";
import toast from "react-hot-toast";
import { ethers } from "ethers";
import { isValidAddress, getExplorerUrl } from "../utils/helpers";
import { Award, User, Wallet, ArrowLeft, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function IssueCredential() {
  const { account, signer, connectWallet } = useWallet();
  const [issuing, setIssuing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [credentialId, setCredentialId] = useState(null);
  const [formData, setFormData] = useState({ name: "", skill: "", studentAddress: "" });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!signer || !account) { toast.error("Please connect your wallet first"); return; }
    if (!isValidAddress(formData.studentAddress)) { toast.error("Invalid wallet address"); return; }
    if (!formData.name.trim() || !formData.skill.trim()) { toast.error("All fields are required"); return; }

    setIssuing(true);
    try {
      const contract = new ethers.Contract(CONTRACT_ADDRESS, SKILLSCHAIN_ABI, signer);
      const tx = await contract.issueCredential(formData.studentAddress, formData.name, formData.skill);
      setTxHash(tx.hash);
      toast.loading("Issuing credential...", { id: "issue" });
      const receipt = await tx.wait();
      const event = receipt.logs
        .map((log) => { try { return contract.interface.parseLog(log); } catch { return null; } })
        .find((ev) => ev && ev.name === "CredentialIssued");
      setCredentialId(event ? Number(event.args.credentialId) : null);
      toast.dismiss("issue");
      toast.success("Credential issued successfully!");
      setSuccess(true);
      setFormData({ name: "", skill: "", studentAddress: "" });
    } catch (error) {
      console.error(error);
      if (error.code === 4001) toast.error("Transaction rejected");
      else if (error.code === "INSUFFICIENT_FUNDS") toast.error("Insufficient MATIC");
      else toast.error(`Failed: ${error.reason || error.message}`);
    } finally { setIssuing(false); }
  };

  if (!account) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-12 text-center max-w-md">
          <Wallet className="w-16 h-16 mx-auto mb-6 text-neon-purple" />
          <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-8">Connect MetaMask to issue credentials.</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={connectWallet} className="neon-button">Connect Wallet</motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link to="/dashboard">
        <motion.button whileHover={{ x: -5 }} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </motion.button>
      </Link>

      <div className="glass-card p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-xl neon-gradient flex items-center justify-center"><Award className="w-6 h-6 text-white" /></div>
          <div><h1 className="text-2xl font-bold">Issue Credential</h1><p className="text-gray-400 text-sm">Create a new on-chain skill credential</p></div>
        </div>

        {success ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
              <CheckCircle className="w-20 h-20 mx-auto mb-6 text-neon-green" />
            </motion.div>
            <h2 className="text-2xl font-bold mb-2">Credential Issued!</h2>
            <p className="text-gray-400 mb-6">Permanently stored on Polygon blockchain.</p>
            {credentialId && <div className="inline-flex items-center gap-2 glass-card px-6 py-3 mb-6"><span className="text-gray-400">Credential ID:</span><span className="text-neon-purple font-bold text-xl">#{credentialId}</span></div>}
            {txHash && <div className="glass-card px-4 py-2 font-mono text-sm mb-6 inline-flex items-center gap-2"><span className="text-gray-400">TX:</span><span className="text-neon-cyan truncate max-w-[200px]">{txHash}</span><a href={getExplorerUrl(txHash)} target="_blank" rel="noopener noreferrer" className="text-neon-purple hover:underline">View ↗</a></div>}
            <div className="flex gap-4 justify-center">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setSuccess(false)} className="glass-card px-6 py-3 hover:border-neon-purple/50 transition-all">Issue Another</motion.button>
              <Link to="/dashboard"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="neon-button">Dashboard</motion.button></Link>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2"><User className="w-4 h-4 inline mr-1" /> Student Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2"><Award className="w-4 h-4 inline mr-1" /> Skill</label>
              <input type="text" name="skill" value={formData.skill} onChange={handleChange} placeholder="e.g., Solidity, React" className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2"><Wallet className="w-4 h-4 inline mr-1" /> Student Wallet Address</label>
              <input type="text" name="studentAddress" value={formData.studentAddress} onChange={handleChange} placeholder="0x..." className="input-field font-mono" required />
              {formData.studentAddress && !isValidAddress(formData.studentAddress) && (
                <div className="flex items-center gap-1 mt-2 text-red-400 text-sm"><AlertCircle className="w-4 h-4" /> Invalid address format</div>
              )}
            </div>
            <div className="glass-card p-4 border-neon-cyan/20">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-neon-cyan mt-0.5 flex-shrink-0" />
                <div className="text-sm text-gray-300">
                  <p className="font-medium text-neon-cyan mb-1">On-Chain Transaction</p>
                  <p>This creates a transaction on Polygon Mumbai. You need MATIC for gas fees.</p>
                </div>
              </div>
            </div>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
              disabled={issuing || !isValidAddress(formData.studentAddress)} className="neon-button w-full flex items-center justify-center gap-2">
              {issuing ? <><Loader2 className="w-5 h-5 animate-spin" /> Issuing...</> : <><Send className="w-5 h-5" /> Issue Credential</>}
            </motion.button>
          </form>
        )}
      </div>
    </div>
  );
}

export default IssueCredential;
