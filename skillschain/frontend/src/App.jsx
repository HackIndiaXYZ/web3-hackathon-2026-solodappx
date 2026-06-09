import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "./components/Navbar";
import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import IssueCredential from "./pages/IssueCredential";
import VerifyCredential from "./pages/VerifyCredential";
import Profile from "./pages/Profile";
import PublicVerify from "./pages/PublicVerify";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-6 rounded-full border-4 border-neon-purple border-t-transparent" />
        <h1 className="text-3xl font-bold neon-gradient-text mb-2">SkillsChain</h1>
        <p className="text-gray-400">Loading blockchain...</p>
      </motion.div>
    </div>
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { const t = setTimeout(() => setIsLoading(false), 1200); return () => clearTimeout(t); }, []);
  if (isLoading) return <LoadingScreen />;
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <main className="pt-20">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/issue" element={<IssueCredential />} />
            <Route path="/verify" element={<VerifyCredential />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/public/:id" element={<PublicVerify />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
