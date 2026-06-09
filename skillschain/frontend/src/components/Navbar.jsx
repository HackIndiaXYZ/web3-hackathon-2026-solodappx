import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useWallet } from "../context/WalletContext";
import { shortenAddress } from "../utils/helpers";
import { Shield, LayoutDashboard, PlusCircle, Search, User, ExternalLink, LogOut } from "lucide-react";

function Navbar() {
  const { account, connectWallet, disconnectWallet, balance } = useWallet();
  const location = useLocation();
  const navLinks = [
    { path: "/", label: "Home", icon: Shield },
    { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { path: "/issue", label: "Issue", icon: PlusCircle },
    { path: "/verify", label: "Verify", icon: Search },
  ];

  return (
    <motion.nav initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 120 }}
      className="fixed top-0 left-0 right-0 z-50 bg-dark-900/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}
              className="w-8 h-8 rounded-lg neon-gradient flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold neon-gradient-text">SkillsChain</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link key={path} to={path}>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive ? "bg-neon-purple/20 text-neon-purple" : "text-gray-400 hover:text-white hover:bg-white/5"}`}>
                    <Icon className="w-4 h-4" /> {label}
                  </motion.div>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3">
            {account ? (
              <>
                <div className="hidden sm:flex items-center gap-3 px-4 py-2 glass-card rounded-xl">
                  <div className="text-right">
                    <p className="text-sm font-mono text-neon-purple">{shortenAddress(account)}</p>
                    <p className="text-xs text-gray-400">{parseFloat(balance || 0).toFixed(3)} MATIC</p>
                  </div>
                </div>
                <Link to="/profile">
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    className="p-2 glass-card rounded-xl hover:border-neon-purple/50 transition-all">
                    <User className="w-5 h-5" />
                  </motion.button>
                </Link>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                  onClick={disconnectWallet}
                  className="p-2 glass-card rounded-xl hover:border-red-500/50 transition-all text-red-400">
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </>
            ) : (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                onClick={connectWallet} className="neon-button flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Connect Wallet
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

export default Navbar;
